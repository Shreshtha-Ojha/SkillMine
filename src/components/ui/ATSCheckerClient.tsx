"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Heatmap from './Heatmap';
import { simpleGrammarScore, simpleATSScore } from '@/lib/atsUtils';
import { parseLLMJsonClient, normalizeParsedClient } from '@/lib/llmParseClient';
import { ArrowLeft, Upload } from 'lucide-react';
import useCurrentUser from '@/lib/useCurrentUser';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { puter?: any; }
}

function loadPuterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no-window'));
    if ((window as any).puter) return resolve();
    const s = document.createElement('script');
    s.src = 'https://js.puter.com/v2/';
    s.async = true;
    s.onload = () => setTimeout(() => resolve(), 50);
    s.onerror = (e) => reject(new Error('failed to load puter CDN'));
    document.head.appendChild(s);
  });
}

export default function ATSCheckerClient() {
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isPremium, setIsPremium] = useState<boolean>(() => typeof window !== 'undefined' && !!localStorage.getItem('ats_premium'));
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [lastLLMResponseRaw, setLastLLMResponseRaw] = useState<string | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState<string | null>(null);
  const [retryRequested, setRetryRequested] = useState<boolean>(false);
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.atsChecker) {
      if (!user.atsChecker.allowedByAdmin && (user.atsChecker.used || 0) >= 1) {
        setUsageLimitReached('You have used your free ATS check. Request admin retry if needed.');
      } else {
        setUsageLimitReached(null);
      }
      setRetryRequested(!!user.atsChecker.requested);
    }
  }, [user]);

  // If the user is definitely not logged in, redirect to login with returnTo
  useEffect(() => {
    if (user === null) {
      router.replace(`/auth/login?returnTo=/ats-checker`);
    }
  }, [user, router]);

  useEffect(() => {
    loadPuterScript().then(() => setPuterLoaded(true)).catch(() => setPuterLoaded(false));
  }, []);

  useEffect(() => {
    if (result) setActiveSection('summary');
  }, [result]);

  // Build the standard prompt using current resumeText and jdText
  function assemblePrompt(rt = resumeText, jd = jdText) {
    return `You are a Senior ATS Engineer, Technical Recruiter, and Resume Coach\nwith experience screening resumes for FAANG, Tier-1 startups, and Fortune 500 companies.\n\nYour task is to deeply analyze:\n1) The provided RESUME\n2) The provided JOB DESCRIPTION (if present)\n\nYour response MUST be:\n- ATS-friendly\n- Recruiter-oriented\n- Brutally honest\n- Extremely actionable\n- Written as if advising a real hiring manager and candidate\n\nOUTPUT FORMAT (JSON ONLY)\n\n{ "scores": { "atsCompatibility": "number (0–100)", "grammarQuality": "number (0–100)", "keywordMatch": "number (0–100)", "impactAndMetrics": "number (0–100)", "readability": "number (0–100)", "formattingStructure": "number (0–100)" },\n\n  "overallVerdict": "1–2 line recruiter-style summary of how this resume would perform in ATS + human screening",\n\n  "jobDescriptionReview": { /* structured fields */ },\n\n  "detailedGuidelines": [ /* structured sections 1..10 */ ],\n\n  "missingCriticalKeywords": [],\n\n  "topActionItems": [],\n\n  "finalATSReadySummary": "Concise, ATS-optimized resume summary tailored to this JD"\n}\n\nResume:\n\n${rt}\n\nJob Description:\n\n${jd}\n\nIMPORTANT RULES: Output valid JSON only (no markdown or extra text).`;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setResumeFile(f);
    setError(null);
    // If it's a text-like file, read locally (handle cases where mime may be missing)
    if ((f.type && f.type.startsWith('text')) || (f.name && f.name.toLowerCase().endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = () => setResumeText(String(reader.result || ''));
      reader.readAsText(f);
      return;
    }

    // For non-plain files (PDF, DOCX, etc) try to extract text by calling server extraction endpoint
    if (f.type !== 'text/plain') {
      try {
        setLoading(true);
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/resume/extract-text', { method: 'POST', body: fd });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json?.error || 'Failed to extract file');
          setResumeText('');
          return;
        }
        const json = await res.json();
        if (json?.success && json?.text) {
          setResumeText(json.text);
          // If OCR suggested, ask user to retry with OCR
          if (json.ocrSuggested && !json.ocrUsed) {
            const ok = confirm('Extraction may have failed (scanned PDF). Retry with OCR? This may take longer.');
            if (ok) {
              const fd2 = new FormData(); fd2.append('file', f); fd2.append('useOCR', '1');
              const r2 = await fetch('/api/resume/extract-text', { method: 'POST', body: fd2 });
              const j2 = await r2.json().catch(()=>({}));
              if (r2.ok && j2?.success && j2?.text) setResumeText(j2.text);              else if (j2?.ocrUnavailable) setError('OCR is not available on this server. Ask admin to enable OCR.');              else setError(j2?.error || 'OCR extraction failed');
            }
          }
        } else { setError(json?.error || 'Extraction returned no text'); setResumeText(''); }

      } catch (err:any) {
        setError(err?.message || 'Failed to process file');
        setResumeText('');
      } finally { setLoading(false); }
    } else {
      // plain text, already handled above
      setResumeText('');
    }
  }

    async function analyze() {
      setError(null);
      setResult(null);
      if (!resumeText && !resumeFile) { setError('Please upload a resume.'); return; }
        if (user === undefined) { setError('Checking login status...'); return; }
        if (user === null) { setError('Please login to use the ATS Checker (testing mode).'); return; }
      setLoading(true);

      try {
        // If a file exists but we don't have extracted text, try extraction first
        if (resumeFile && !resumeText) {
          try {
            const fd = new FormData();
            fd.append('file', resumeFile);
            const res = await fetch('/api/resume/extract-text', { method: 'POST', body: fd });
            if (!res.ok) {
              const json = await res.json().catch(() => ({}));
              throw new Error(json?.error || 'Failed to extract resume');
            }
            const json = await res.json();
            if (json?.success && json?.text) {
              setResumeText(json.text);
              if (json.ocrSuggested && !json.ocrUsed) {
                const retry = confirm('Extraction looks like a scanned PDF. Retry with OCR?');
                if (retry) {
                  const fd2 = new FormData(); fd2.append('file', resumeFile); fd2.append('useOCR', '1');
                  const r2 = await fetch('/api/resume/extract-text', { method: 'POST', body: fd2 });
                  const j2 = await r2.json().catch(()=>({}));
                  if (r2.ok && j2?.success && j2?.text) setResumeText(j2.text);
                  else if (j2?.ocrUnavailable) { throw new Error('OCR is not available on this server. Ask admin to enable OCR.'); }
                  else { throw new Error(j2?.error || 'OCR extraction failed'); }
                }
              }
            } else throw new Error(json?.error || 'No extracted text');
          } catch (e:any) {
            setError(e?.message || 'Failed to extract resume text');
            setLoading(false);
            return;
          }
        }

        // Assemble prompt and payload
        const prompt = assemblePrompt();
        const payload = { prompt, resume: resumeText, jd: jdText };

        // Call server-side Gemini instead of Puter CDN
        const res = await fetch('/api/ai/gemini-ats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, resume: resumeText, jd: jdText }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) { setError(json?.message || 'Please login'); setLoading(false); return; }
          if (res.status === 403 && json?.error === 'usage_limit_reached') { setUsageLimitReached(json?.message || 'Usage limit reached'); setLoading(false); return; }
          throw new Error(json?.error || 'LLM backend failed');
        }
        const text = json?.raw || '';
        try { setLastLLMResponseRaw(text); } catch (_) {}

        // If server parsed it, use that parsed object
        if (json?.parsed) {
          setResult({ mode: 'gemini', ...json.parsed, parseMethod: json.parseMethod || null, parsedSnippet: json.parsedSnippet || null, parseError: json.parseError || null });
          setLoading(false);
          return;
        }

        // No parsed JSON from server; try client-side parsing of parsedSnippet as a fallback
        const parseMethod = json?.parseMethod || null;
        const parsedSnippet = json?.parsedSnippet || null;
        const parseError = json?.parseError || null;

        if (parsedSnippet) {
          const clientParse = parseLLMJsonClient(parsedSnippet);
          if (clientParse.parsed) {
            const normalized = normalizeParsedClient(clientParse.parsed);
            setResult({ mode: 'gemini', ...normalized, parseMethod: clientParse.method || parseMethod, parsedSnippet: clientParse.snippet || parsedSnippet, parseError: parseError });
            setLoading(false);
            return;
          }
        }

        // Display a minimal result object that includes parsing metadata and raw summary
        setResult({ mode: 'gemini', summary: text, parseMethod, parsedSnippet, parseError });
      } catch (e:any) {
        setError(e?.message || 'Analysis failed');
      } finally {
        setLoading(false);
      }
    }

  function handlePurchase() {
    // Simple simulated purchase flow; replace with real checkout in production
    const ok = confirm('Purchase Premium ATS Checker for ₹10?');
    if (!ok) return;
    localStorage.setItem('ats_premium', '1');
    setIsPremium(true);
    alert('Purchase successful — Premium unlocked!');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={()=>history.back()} className="p-2 bg-white/5 rounded-md hover:bg-white/10 transition">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-2xl font-extrabold">ATS Checker</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0b0b11] p-4 rounded-xl border border-white/5">
            <div className="text-sm text-gray-400 mb-2">Resume (upload .pdf or .txt)</div>
            <div className="w-full bg-[#07070a] p-3 rounded-md text-sm min-h-[12rem] flex items-center justify-center">
              <div className="text-center text-gray-400">Upload your resume file — we will extract and use the text for analysis.</div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 rounded cursor-pointer text-sm">
                <Upload className="w-4 h-4 text-white/80" />
                <span className="text-sm text-gray-300">Upload Resume</span>
                <input className="hidden" type="file" accept=".txt,.pdf" onChange={handleFile} />
              </label>
              <button onClick={() => { setResumeText(''); setResumeFile(null); setResult(null); setLastLLMResponseRaw(null); setUsageLimitReached(null); }} className="px-3 py-1 bg-white/5 rounded">Clear</button>
            </div>
            {resumeFile && <div className="mt-2 text-xs text-gray-400">Selected file: {resumeFile.name}</div>}
            {resumeText && <div className="mt-2 text-xs text-gray-400">Extracted text available ({Math.min(200, resumeText.length)} chars preview)</div>}
          </div>

          <div className="bg-[#0b0b11] p-4 rounded-xl border border-white/5">
            <div className="text-sm text-gray-400 mb-2">Job Description (optional)</div>
            <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} rows={12} className="w-full bg-[#07070a] p-3 rounded-md text-sm" />
            <div className="mt-3 text-xs text-gray-400">Providing the JD improves keyword-matching and ATS suggestions.</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm text-yellow-300 mr-4">Testing mode — logged-in users only. Each user gets one free ATS check.</div>
          <button onClick={analyze} disabled={loading || user === undefined || user === null || (user && user.atsChecker && !user.atsChecker.allowedByAdmin && (user.atsChecker.used || 0) >= 1)} className="px-4 py-2 bg-emerald-600 rounded-md">{loading ? 'Analyzing...' : 'Analyze'} </button>

          <button onClick={() => { setResumeText(''); setJdText(''); setResult(null); setLastLLMResponseRaw(null); setUsageLimitReached(null); }} className="px-3 py-2 bg-white/5 rounded">Reset</button>
        </div>

        {/* Debug payload removed */}

        {error && <div className="mt-4 text-red-400">{error}</div>}

        {usageLimitReached && (
          <div className="mt-4 bg-yellow-900/20 p-3 rounded border border-yellow-500/10">
            <div className="text-sm text-yellow-300 mb-2">{usageLimitReached}</div>
            <div className="flex gap-2">
              <button disabled={retryRequested} onClick={async ()=>{
                try {
                  setRetryRequested(true);
                  const r = await fetch('/api/ats/request-retry', { method: 'POST' });
                  const j = await r.json().catch(()=>({}));
                  if (!r.ok) { setError(j?.error || 'Request failed'); setRetryRequested(false); return; }
                  setRetryRequested(true);
                } catch (e:any) { setError(e?.message || 'Request failed'); setRetryRequested(false); }
              }} className="px-3 py-2 bg-emerald-600 rounded text-sm">Request admin retry</button>
              <button onClick={()=>setUsageLimitReached(null)} className="px-3 py-2 bg-white/5 rounded text-sm">Dismiss</button>
            </div>
          </div>
        )}

        {result && (
          <div id="ats-results" className="mt-6 space-y-4">
            {result.parseMethod && (
              <div className="text-sm text-yellow-300">LLM parse method: <strong className="text-white">{result.parseMethod}</strong>{result.parseError ? <span className="text-red-400"> — Parse error: {result.parseError}</span> : null}</div>
            )}
            {result.parsedSnippet && (
              <details className="mt-2 text-xs text-gray-300 bg-[#07070a] p-2 rounded"><summary className="cursor-pointer">Show extracted JSON snippet</summary><pre className="mt-2 text-xs text-gray-200 max-h-60 overflow-auto">{result.parsedSnippet}</pre></details>
            )}
            <div className="flex gap-6">
              <div className="w-72 hidden md:block">
                <div className="bg-[#06060a] p-3 rounded-lg border border-white/5 sticky top-24">
                  <div className="text-xs text-gray-400 mb-2">Report</div>
                  <button onClick={() => { document.getElementById('summary')?.scrollIntoView({behavior:'smooth'}); setActiveSection('summary'); }} className="block text-left text-sm text-gray-300 hover:text-white py-1">Summary</button>
                  <div className="text-xs text-gray-500 mt-2">Guidelines</div>
                  {result.detailedGuidelines?.map((g:any,i:number)=>(
                    <button key={i} onClick={() => { document.getElementById(`guideline-${i}`)?.scrollIntoView({behavior:'smooth'}); setActiveSection(`guideline-${i}`); }} className="block text-left text-sm text-gray-300 hover:text-white py-1">{g.heading}</button>
                  ))}
                  <button onClick={() => { document.getElementById('missing-keywords')?.scrollIntoView({behavior:'smooth'}); setActiveSection('missing-keywords'); }} className="block text-left text-sm text-gray-300 hover:text-white py-1">Missing Keywords</button>
                  <button onClick={() => { document.getElementById('top-actions')?.scrollIntoView({behavior:'smooth'}); setActiveSection('top-actions'); }} className="block text-left text-sm text-gray-300 hover:text-white py-1">Top Actions</button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div id="summary" className="bg-[#0b0b11] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">ATS Compatibility</div>
                      <div className="text-2xl font-bold">{result.scores?.atsCompatibility ?? result.scores?.ats ?? 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Grammar</div>
                      <div className="text-2xl font-bold">{result.scores?.grammarQuality ?? result.scores?.grammar ?? 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Keywords</div>
                      <div className="text-2xl font-bold">{result.scores?.keywordMatch ?? 'N/A'}</div>
                    </div>
                  </div>
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mt-3 text-sm text-gray-300">
                      <div className="font-semibold">Quick suggestions:</div>
                      <ul className="list-disc ml-5 mt-1">{result.suggestions.map((s:string,i:number)=>(<li key={i}>{s}</li>))}</ul>
                    </div>
                  )}
                  {result.summary && <div className="mt-3 text-sm text-gray-300">{result.summary}</div>}
                </div>



                {Array.isArray(result.detailedGuidelines) && result.detailedGuidelines.map((g:any,i:number)=> (
                  <div id={`guideline-${i}`} key={i} className={`bg-[#0b0b11] p-4 rounded-xl border border-white/5 transition ${activeSection===`guideline-${i}`? 'ring-2 ring-emerald-600':''}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400 font-semibold">{g.heading}</div>

                    </div>
                    <div className="mt-2 text-sm text-gray-200">{g.whatATSLooksFor}</div>
                    <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-400">Add</div>
                        <ul className="list-disc ml-5 mt-1">{(g.whatToAdd||[]).map((a:string,ai:number)=>(<li key={ai}>{a}</li>))}</ul>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Avoid</div>
                        <ul className="list-disc ml-5 mt-1">{(g.whatToAvoid||[]).map((a:string,ai:number)=>(<li key={ai}>{a}</li>))}</ul>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Vocabulary</div>
                        <div className="mt-1 text-sm text-gray-200">{(g.recommendedVocabulary||[]).slice(0,8).join(', ')}</div>
                      </div>
                    </div>
                    {g.exampleImprovement && (
                      <div className="mt-3 text-sm bg-[#07070a] p-3 rounded">
                        <div className="text-xs text-gray-400">Example</div>
                        <div className="mt-1 text-sm text-gray-200"><strong>Before:</strong> {g.exampleImprovement.before}</div>
                        <div className="mt-1 text-sm text-gray-200"><strong>After:</strong> {g.exampleImprovement.after}</div>
                      </div>
                    )}
                  </div>
                ))}

                {result.missingCriticalKeywords && result.missingCriticalKeywords.length > 0 && (
                  <div id="missing-keywords" className="bg-[#0b0b11] p-4 rounded-xl border border-white/5">
                    <div className="text-sm text-gray-400 mb-2">Missing Critical Keywords</div>
                    <div className="flex flex-wrap gap-2">{result.missingCriticalKeywords.map((k:string,i:number)=>(<span key={i} className="bg-white/5 px-2 py-1 rounded text-sm text-gray-200">{k}</span>))}</div>
                  </div>
                )}

                {result.topActionItems && result.topActionItems.length > 0 && (
                  <div id="top-actions" className="bg-[#0b0b11] p-4 rounded-xl border border-white/5">
                    <div className="text-sm text-gray-400 mb-2">Top Action Items</div>
                    <ol className="list-decimal ml-5 text-sm text-gray-200">{result.topActionItems.map((t:string,i:number)=>(<li key={i}>{t}</li>))}</ol>
                  </div>
                )}

                {result.finalATSReadySummary && (
                  <div className="bg-gradient-to-r from-emerald-600/10 to-blue-500/5 p-4 rounded-xl border border-white/5">
                    <div className="text-sm text-gray-400">Final ATS-ready Summary</div>
                    <div className="mt-2 text-sm text-white">{result.finalATSReadySummary}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}      </div>
    </div>
  );
}
