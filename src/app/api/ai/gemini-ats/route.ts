import { NextResponse } from 'next/server';
import { generateContentWithConfig } from '@/lib/gemini';
import JSON5 from 'json5';

export async function POST(req: Request) {
  const BETA_NOTICE = 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.';
  try {
    const body = await req.json().catch(() => ({}));
    const resume: string = String(body.resume || '');
    const jd: string = String(body.jd || '');
    const promptFromClient: string | undefined = body.prompt;

    if (!resume) return NextResponse.json({ error: 'resume required' }, { status: 400 });

    // Use the user's exact prompt template (inject resume and JD directly)
    const prompt = promptFromClient || `You are a Senior ATS Engineer, Technical Recruiter, and Resume Coach
with experience screening resumes for FAANG, Tier-1 startups, and Fortune 500 companies.

Your task is to deeply analyze:
1) The provided RESUME
2) The provided JOB DESCRIPTION (if present)

Your response MUST be:
- ATS-friendly
- Brutally honest
OUTPUT FORMAT (JSON ONLY)
{
  "scores": {
    "atsCompatibility": number (0–100),
    "grammarQuality": number (0–100),
    "keywordMatch": number (0–100),
    "impactAndMetrics": number (0–100),
    "readability": number (0–100),
    "formattingStructure": number (0–100)
  },

  "overallVerdict": "1–2 line recruiter-style summary of how this resume would perform in ATS + human screening",

  "detailedGuidelines": [ /* 3..7 structured sections as in template */ ],

  "missingCriticalKeywords": [ /* list */ ],

  "finalATSReadySummary": "Concise, ATS-optimized resume summary tailored to this JD"
}

========================
INPUT
========================

Resume Text:
"""
${resume}
"""

Job Description:
"""
${jd}
"""

IMPORTANT RULES:
- Use professional HR language
- Be extremely specific and concrete
- Avoid generic advice completely
- Assume ATS screening first, recruiter second
- Output VALID JSON ONLY
- No markdown, no explanations outside JSON
`;

 

    // Enforce login and per-user usage limit: 1 free check unless admin allows
    const getUserFromRequest = (await import('@/lib/getUserFromRequest')).default;
    const user = await getUserFromRequest(req as Request);
    if (!user) {
      return NextResponse.json({ error: 'login_required', message: 'Please login to use ATS Checker (testing mode).' }, { status: 401 });
    }
    if (user && !user.isAdmin) {
      user.atsChecker = user.atsChecker || {};
      if (!user.atsChecker.allowedByAdmin && (user.atsChecker.used || 0) >= 1) {
        return NextResponse.json({ error: 'usage_limit_reached', message: 'You have used your free ATS check. Request admin retry if needed.' }, { status: 403 });
      }
    }

    // Call Gemini with a generous token limit
    const text = await generateContentWithConfig(prompt, { temperature: 0.2, maxOutputTokens: 4000 });

    // If analysis reached here successfully, increment usage (for authenticated users)
    try {
      if (user) {
        user.atsChecker = user.atsChecker || { used: 0, allowedByAdmin: false };
        user.atsChecker.used = (user.atsChecker.used || 0) + 1;
        // If admin allowed this, optionally clear the allowance flag
        if (user.atsChecker.allowedByAdmin) user.atsChecker.allowedByAdmin = false;
        await user.save();
      }
    } catch (e) {
      // non-fatal if saving usage fails
      console.warn('Failed to update ats usage', e);
    }

    // Parse LLM response using shared tolerant parser
    const { parseLLMJson } = await import('@/lib/llmParse');
    const parsedResult = parseLLMJson(text);
    let parsed: any = parsedResult.parsed;
    let parseMethod: string | null = parsedResult.parseMethod;
    let parsedSnippet: string | null = parsedResult.parsedSnippet;
    let parseError: string | null = parsedResult.parseError;



    if (parsed) {
      const normalized = (function(p:any){
        // reuse the normalizeParsed logic for final return
        if (!p || typeof p !== 'object') return p;
        const out: any = { ...p };
        out.scores = out.scores || {};
        const scoreAliases: Record<string, string[]> = {
          atsCompatibility: ['ats', 'atsCompatibility', 'atsScore'],
          grammarQuality: ['grammar', 'grammarQuality'],
          keywordMatch: ['keywordMatch', 'keywords', 'keyword_score'],
          impactAndMetrics: ['impactAndMetrics', 'impact'],
          readability: ['readability'],
          formattingStructure: ['formattingStructure', 'formatting']
        };
        for (const target of Object.keys(scoreAliases)) {
          if (out.scores[target] == null) {
            const aliases = scoreAliases[target];
            for (const a of aliases) {
              if (out.scores[a] != null) { out.scores[target] = out.scores[a]; break; }
              if ((p as any)[a] != null) { out.scores[target] = (p as any)[a]; break; }
            }
          }
          const v = out.scores[target];
          if (v != null && typeof v !== 'number') {
            const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
            out.scores[target] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : out.scores[target];
          }
        }
        out.finalATSReadySummary = out.finalATSReadySummary || out.overallVerdict || '';
        out.detailedGuidelines = Array.isArray(out.detailedGuidelines) ? out.detailedGuidelines : (out.detailedGuidelines ? [out.detailedGuidelines] : []);
        out.missingCriticalKeywords = Array.isArray(out.missingCriticalKeywords) ? out.missingCriticalKeywords : (out.missingCriticalKeywords ? [out.missingCriticalKeywords] : []);
        out.topActionItems = Array.isArray(out.topActionItems) ? out.topActionItems : (out.topActionItems ? [out.topActionItems] : []);
        out.jobDescriptionReview = out.jobDescriptionReview || {};
        return out;
      })(parsed);

      return NextResponse.json({ success: true, raw: text, parsed: normalized, promptUsed: prompt, parseMethod, parsedSnippet, betaNotice: 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.' });
    }

    // Fallback: return raw text and parsing metadata so client can display it
    return NextResponse.json({ success: true, raw: text, parsed: null, promptUsed: prompt, parseMethod: parseMethod || null, parsedSnippet, parseError, betaNotice: 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.' });
  } catch (e: any) {
    // Try to surface a sensible short message while inspecting nested provider error fields
    const msg = e?.message || (e?.error && e.error.message) || 'gemini failed';
    const full = (String(msg) + ' ' + (JSON.stringify(e) || '')).toLowerCase();

    // Timeout => 504
    if (full.includes('timed out')) {
      return NextResponse.json({ error: 'LLM request timed out', betaNotice: 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.' }, { status: 504 });
    }

    // Detect overloaded / rate-limited model responses (message text, nested error fields, or status/code)
    const isOverloaded = full.includes('overload') || full.includes('model is overloaded') || full.includes('model overloaded') || full.includes('unavailable') || e?.status === 429 || e?.status === 503 || (e?.error && (e.error.code === 503 || String(e.error.status).toUpperCase() === 'UNAVAILABLE'));
    if (isOverloaded) {
      return NextResponse.json({ error: 'Model overloaded — try again', keywords: ['model', 'overloaded', 'retry'], betaNotice: 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.' }, { status: 503 });
    }

    // Fallback: return original error message
    return NextResponse.json({ error: msg, betaNotice: 'Beta: using free Gemini (free tier) — service may be intermittent; please try again later.' }, { status: 500 });
  }
}
