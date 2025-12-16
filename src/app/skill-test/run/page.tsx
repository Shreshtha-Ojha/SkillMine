"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCurrentUser from '@/lib/useCurrentUser';
import LoginRequiredModal from '@/components/ui/LoginRequiredModal';

export default function SkillTestRunner() {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAttemptId(new URLSearchParams(window.location.search).get('attemptId'));
  }, []);

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [mcqAnswers, setMcqAnswers] = useState<(number|null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [skillPrice, setSkillPrice] = useState<number | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveAction, setLeaveAction] = useState<'back' | 'refresh' | null>(null);
  const [showOneTimeWarning, setShowOneTimeWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // default 60 minutes
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [triggerAutoSubmit, setTriggerAutoSubmit] = useState(false);
  const MAX_TAB_SWITCHES = 3;
  const originalUrlRef = React.useRef<string | null>(null);
  const user = useCurrentUser();
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(()=>{ if (user) setShowLoginModal(false); }, [user]);

  useEffect(()=>{
    if (!attemptId) return; const fetchAttempt = async () => { setLoading(true); try { const res = await fetch(`/api/skill-test?attemptId=${attemptId}`); const j = await res.json(); if (!res.ok) throw new Error(j.error||''); setAttempt(j.attempt); setMcqAnswers(new Array(j.attempt.mcqSnapshot.length).fill(null));
        // if q param exists, set it
        const qParam = Number(new URLSearchParams(window.location.search).get('q') || 0);
        if (!Number.isNaN(qParam) && qParam >= 0) setCurrentQuestion(Math.min(Math.max(0, qParam), (j.attempt.mcqSnapshot.length||1)-1));
        // fetch premium status and pricing
        try {
          const ps = await fetch('/api/payment/skill-test');
          let purchased = false;
          if (ps.ok) { const pjson = await ps.json(); purchased = !!pjson.purchased; setIsPremium(purchased); }
          const pr = await fetch('/api/admin/pricing'); if (pr.ok) { const pj = await pr.json(); setSkillPrice(pj.pricing?.skillTestPremium ?? null); }
          // if one-time-visit is enabled and user is not premium, show warning modal on landing
          if (j.attempt?.oneTimeVisit && !purchased) {
            setShowOneTimeWarning(true);
          }
        } catch (e) { /* ignore */ }
      } catch (e:any) { toast.error(e?.message||'Failed to load'); router.push('/skill-tests'); } setLoading(false); }; fetchAttempt(); }, [attemptId]);

  const enterFullscreen = useCallback(async ()=>{
    try { const el = document.documentElement; if (el.requestFullscreen) await el.requestFullscreen(); else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen(); setStarted(true); } catch(e){ console.log('fullscreen failed', e); setStarted(true); }
  }, []);

  // When test is started prepare navigation/refresh guards
  useEffect(() => {
    if (!started) return;
    // store original URL so we can guard against leaving
    originalUrlRef.current = window.location.href;
    // push a history state to help trap back button
    try { window.history.pushState({ skillTestGuard: true }, '', window.location.href); } catch (e) {}

    // notify user
    toast('Navigation and page refresh are disabled during an active test. Use Submit to finish.', { icon: '⚠️' });

    return () => {
      // nothing special to clean up here; beforeunload and popstate handlers removed elsewhere
    };
  }, [started]);

  // Keydown handler for refresh (F5 / Ctrl+R)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return;
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        setLeaveAction('refresh');
        setShowLeaveModal(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started]);

  // beforeunload guard to prevent refresh/close while test is active
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!started) return;
      const msg = 'Leaving this page will forfeit your active test attempt.';
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [started]);

  // Handle user's confirmation to leave (from our modal)
  const confirmLeave = (allow: boolean) => {
    setShowLeaveModal(false);
    if (!allow) return;
    // Remove beforeunload to allow navigation/refresh
    try { (window as any).onbeforeunload = null; } catch(e){}
    if (leaveAction === 'back') {
      // go back in history
      window.history.back();
    } else if (leaveAction === 'refresh') {
      window.location.reload();
    }
  };

  // Tab switch detection
  useEffect(()=>{
    if (!started) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev=>{ const n = prev+1; if (n>=MAX_TAB_SWITCHES) { toast.error('Auto-submitting due to tab switches'); setTriggerAutoSubmit(true); } else { toast.error(`Warning ${n}/${MAX_TAB_SWITCHES}: tab switching detected`); } return n; });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return ()=> document.removeEventListener('visibilitychange', handleVisibility);
  }, [started]);

  // Exit fullscreen guard
  const exitFullscreen = useCallback(()=>{
    try {
      const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      if (!isFull) return;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } catch (err) {
      console.log('Exit fullscreen failed', err);
    }
  }, []);

  // Timer
  useEffect(()=>{
    if (!started) return; if (attempt?.timeLimitMinutes) setTimeLeft(attempt.timeLimitMinutes * 60);
    const t = setInterval(()=>{ setTimeLeft(prev=>{ if (prev<=1) { clearInterval(t); setTriggerAutoSubmit(true); return 0; } return prev-1; }); }, 1000);
    return ()=> clearInterval(t);
  }, [started, attempt]);


  useEffect(()=>{ if (triggerAutoSubmit) { (async ()=>{ await handleSubmit(true); })(); } }, [triggerAutoSubmit]);

  // Per-question state
  const [locked, setLocked] = useState<boolean[]>([]);
  const [perQTimeLeft, setPerQTimeLeft] = useState<number>(0);
  const perQTimerRef = React.useRef<number | null>(null);

  const selectAnswer = (idx:number, val:number)=>{ const arr=[...mcqAnswers]; arr[idx]=val; setMcqAnswers(arr); };

  const pushQuestionToUrl = (idx:number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('q', String(idx));
      window.history.pushState({}, '', url.toString());
    } catch(e){ /* ignore */ }
  }

  // Centralized navigation that enforces one-time-visit locks and updates URL
  const goToQuestion = (idx:number) => {
    if (!attempt) return;
    const maxIdx = (attempt.mcqSnapshot || []).length - 1;
    const target = Math.max(0, Math.min(idx, maxIdx));
    if (attempt.oneTimeVisit && locked[target] && target !== currentQuestion) {
      toast.error('This question is locked and cannot be revisited');
      return;
    }

    // If one-time-visit, lock the question we're leaving (currentQuestion)
    if (attempt.oneTimeVisit && target !== currentQuestion) {
      setLocked(prev => { const copy = [...prev]; copy[currentQuestion] = true; return copy; });
    }

    setCurrentQuestion(target);
    pushQuestionToUrl(target);
  }

  const findNextUnlocked = (from:number) => {
    if (!attempt) return -1;
    const maxIdx = (attempt.mcqSnapshot||[]).length - 1;
    for (let i = from; i <= maxIdx; i++) {
      if (!locked[i]) return i;
    }
    return -1;
  }

  const findPrevUnlocked = (from:number) => {
    if (!attempt) return -1;
    for (let i = from; i >= 0; i--) {
      if (!locked[i]) return i;
    }
    return -1;
  }

  // Handle browser back/forward: read 'q' param and set current question
  useEffect(()=>{
    const onPop = () => {
      try {
        // If user attempted to navigate away from test URL (back to previous page), show confirmation modal
        if (started && originalUrlRef.current && window.location.href !== originalUrlRef.current) {
          try { window.history.pushState({ skillTestGuard: true }, '', originalUrlRef.current); } catch(e){}
          setLeaveAction('back');
          setShowLeaveModal(true);
          return;
        }

        const qParam = Number(new URLSearchParams(window.location.search).get('q') || 0);
        if (Number.isNaN(qParam)) return;
        const maxIdx = (attempt?.mcqSnapshot?.length||1)-1;
        let target = Math.max(0, Math.min(qParam, maxIdx));
        // If one-time-visit is enabled and the target is locked, find nearest unlocked
        if (attempt?.oneTimeVisit && locked && locked[target] && target !== currentQuestion) {
          let found = -1;
          for (let i = target+1; i <= maxIdx; i++) if (!locked[i]) { found = i; break; }
          if (found === -1) for (let i = target-1; i >= 0; i--) if (!locked[i]) { found = i; break; }
          if (found === -1) { toast.error('Target question locked'); return; }
          target = found;
        }

        // Use central navigation to ensure locking logic runs
        goToQuestion(target);
      } catch(e){}
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [attempt, locked, currentQuestion]);

  // Initialize locked array when attempt loads
  useEffect(()=>{
    if (!attempt) return; setLocked(new Array(attempt.mcqSnapshot.length).fill(false));
  }, [attempt]);

  // Per-question timer handling
  useEffect(()=>{
    // clear any existing timer
    if (perQTimerRef.current) { window.clearInterval(perQTimerRef.current); perQTimerRef.current = null; }
    if (!started || !attempt) return;
    if (!attempt.perQuestionTimerEnabled) { setPerQTimeLeft(0); return; }
    const dur = (attempt.perQuestionTimeMinutes || 1) * 60;
    setPerQTimeLeft(dur);
    perQTimerRef.current = window.setInterval(()=>{
      setPerQTimeLeft(prev=>{
        if (prev <= 1) {
          // expire: lock current and move on
          window.clearInterval(perQTimerRef.current as number);
          perQTimerRef.current = null;
          setLocked(prevArr => { const copy = [...prevArr]; copy[currentQuestion] = true; return copy; });
          // move next or submit
          if (currentQuestion >= (attempt.mcqSnapshot.length||1)-1) {
            setTriggerAutoSubmit(true);
          } else {
            const next = Math.min((attempt.mcqSnapshot.length||1)-1, currentQuestion+1);
            setCurrentQuestion(next);
            pushQuestionToUrl(next);
          }
          return 0;
        }
        return prev-1;
      });
    }, 1000);
    return ()=>{ if (perQTimerRef.current) { window.clearInterval(perQTimerRef.current); perQTimerRef.current = null; } }
  }, [started, attempt, currentQuestion]);


  const handleSubmit = async (auto=false)=>{
    if (!auto && !confirm('Submit test?')) return;
    setSubmitting(true);
    try { const res = await fetch('/api/skill-test/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ attemptId, mcqAnswers }) }); const j = await res.json(); if (!res.ok) throw new Error(j.error||'Submit failed'); // redirect to result page
      exitFullscreen();
      router.push(`/skill-test/result?attemptId=${attemptId}`);
    } catch (e:any) { toast.error(e?.message||'Submit failed'); } setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]"/></div>;
  if (!attempt) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">Attempt not found</div>;

  const q = attempt.mcqSnapshot[currentQuestion];

  // Pre-test view
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(126,16,44,0.06)] rounded-full blur-[128px]" />
        </div>
        <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={()=>router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-white">Home</button>
            <h1 className="text-white font-semibold">Skill Test</h1>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <div className="px-3 py-1 rounded bg-green-600/10 text-green-300 text-sm">Premium active</div>
              ) : (
                <div className="flex items-center gap-2">
                <button onClick={async ()=>{
                  if (user === undefined) return;
                  if (!user) { setShowLoginModal(true); return; }
                  try {
                      const res = await fetch('/api/payment/skill-test/create', { method: 'POST', credentials: 'include' });
                    const j = await res.json();
                    if (res.status === 401) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                    if (!res.ok) throw new Error(j.error || 'Payment initiation failed');
                    if (j.paymentUrl) window.location.href = j.paymentUrl;
                  } catch (e:any) { alert(e?.message || 'Failed to initiate purchase'); }
                }} className="px-3 py-1 rounded bg-[var(--color-primary)] text-[var(--color-foreground)] text-sm">Buy Premium</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="p-8 bg-[rgba(126,16,44,0.04)] border border-[rgba(126,16,44,0.06)] rounded-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[rgba(126,16,44,0.06)] rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[var(--color-accent)]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{attempt.testName || 'Skill Test'}</h2>
            <p className="text-gray-400 max-w-lg mx-auto">This test contains {attempt.mcqSnapshot.length} questions. You will have {attempt.timeLimitMinutes || 60} minutes to complete the test. Tab-switching is monitored.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-white">{attempt.timeLimitMinutes || 60}</div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-white">{attempt.mcqSnapshot.length}</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-white">{attempt.mcqSnapshot.reduce((s:any,q:any)=>s + (q.marks||1),0)}</div>
                <div className="text-xs text-gray-500">Total Marks</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-[var(--color-accent)]">60%</div>
                <div className="text-xs text-gray-500">To Pass</div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={async ()=>{ await enterFullscreen(); }} className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-foreground)] font-semibold rounded-xl hover:bg-[#6b0f26]">Start Test</button>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-[#111118] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Question Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[rgba(126,16,44,0.04)] border border-[rgba(126,16,44,0.06)] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Multiple Choice (MCQ)</span>
                  <span className="px-2 py-1 bg-[rgba(126,16,44,0.06)] text-[var(--color-accent)] text-xs rounded-lg">Section 1</span>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between"><span>Number of Questions</span><span className="text-white font-medium">{attempt.mcqSnapshot.length}</span></div>
                  <div className="flex justify-between"><span>Marks per Question</span><span className="text-white font-medium">1</span></div>
                  <div className="flex justify-between"><span>Total Marks</span><span className="text-blue-400 font-medium">{attempt.mcqSnapshot.reduce((s:any,q:any)=>s + (q.marks||1),0)}</span></div>
                </div>
              </div>
              <div className="p-4 bg-[rgba(215,169,168,0.02)] border border-[rgba(215,169,168,0.04)] rounded-xl">
                <div className="flex items-center justify-between mb-3"><span className="text-white font-medium">Important Rules</span></div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-start gap-3"><div className="w-6 h-6 bg-[rgba(126,16,44,0.06)] rounded-full flex items-center justify-center">1</div><div><div className="text-white font-medium">Time Limit</div><div className="text-gray-400 text-sm">You have {attempt.timeLimitMinutes || 60} minutes. Timer starts when you click "Start Test" and the test will auto-submit when time expires.</div></div></div>

                  {attempt.perQuestionTimerEnabled && (
                    <div className="flex items-start gap-3"><div className="w-6 h-6 bg-[rgba(126,16,44,0.06)] rounded-full flex items-center justify-center">2</div><div><div className="text-white font-medium">Per-question timer</div><div className="text-gray-400 text-sm">Each question has its own timer of {attempt.perQuestionTimeMinutes || 1} minute{(attempt.perQuestionTimeMinutes || 1) > 1 ? 's' : ''}. When it expires the question locks and the test advances to the next question (or auto-submits if it was the last).</div></div></div>
                  )}

                  {attempt.oneTimeVisit && (
                    <div className="flex items-start gap-3"><div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">3</div><div><div className="text-white font-medium">One-time visit</div><div className="text-gray-400 text-sm">Once you move away from a question it becomes locked and you cannot return. Use this to enforce single-pass attempts.</div></div></div>
                  )}

                  <div className="flex items-start gap-3"><div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center">4</div><div><div className="text-white font-medium">Navigation & Tab Switching</div><div className="text-gray-400 text-sm">Use the question navigator to move between questions. Tab-switching is monitored and may auto-submit the test after repeated switches.</div></div></div>

                  <div className="mt-2 text-sm text-[var(--color-muted)] bg-[rgba(215,169,168,0.02)] p-2 rounded">Note: Skill tests do not provide official certificates or external verification.</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Leave confirmation modal (shown on pop/back or refresh key)
  const LeaveModal = () => {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 bg-[#0b0b10] border border-white/10 rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">Leave Test?</h3>
          <p className="text-sm text-gray-300 mb-4">If you leave now your attempt may be forfeited and you may not be able to resume. Do you want to leave?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => confirmLeave(false)} className="px-4 py-2 bg-white/5 rounded">Stay</button>
            <button onClick={() => confirmLeave(true)} className="px-4 py-2 bg-red-600 rounded">Leave Anyway</button>
          </div>
        </div>
      </div>
    );
  };

  // One-time visit warning modal (shown on landing if attempt.oneTimeVisit && not premium)
  const OneTimeModal = () => {
    if (!showOneTimeWarning) return null;
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowOneTimeWarning(false)} />
        <div className="relative z-10 bg-[#0b0b10] border border-white/10 rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">One-time Visit Enabled</h3>
          <p className="text-sm text-gray-300 mb-4">This test enforces one-time visits: once you leave a question it becomes locked. Without Premium you have limited attempts. Consider purchasing Premium to unlock unlimited attempts.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowOneTimeWarning(false)} className="px-4 py-2 bg-white/5 rounded">Continue</button>
            <button onClick={async ()=>{
              if (user === undefined) return;
              if (!user) { setShowLoginModal(true); return; }
              try {
                const res = await fetch('/api/payment/skill-test/create', { method: 'POST', credentials: 'include' });
                const j = await res.json();
                if (res.status === 401) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                if (!res.ok) throw new Error(j.error || 'Payment initiation failed');
                if (j.paymentUrl) window.location.href = j.paymentUrl;
              } catch (e:any) { alert(e?.message || 'Failed to initiate purchase'); }
            }} className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-foreground)] rounded hover:bg-[#6b0f26]">Buy Premium — ₹{skillPrice}</button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <LeaveModal />
      <OneTimeModal />

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        {/* Question Navigator - Sidebar like certification test */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 p-4 bg-[#111118] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Questions</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="font-medium">{attempt.timeLimitMinutes || 60} mins</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-2 mb-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded bg-[var(--color-primary)] border border-[var(--color-primary)]" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded bg-[var(--color-primary)]/20 border border-[rgba(126,16,44,0.08)]" />
                <span>Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded bg-white/5" />
                <span>Unanswered</span>
              </div>
            </div>
              <div className="grid grid-cols-6 gap-1">
                {attempt.mcqSnapshot.map((_:any, idx:number)=>(
                <button key={idx} onClick={()=>{ goToQuestion(idx); }} disabled={locked[idx] && idx !== currentQuestion} className={`w-8 h-8 text-xs rounded flex items-center justify-center transition-colors ${currentQuestion===idx ? 'bg-[var(--color-primary)] text-white' : locked[idx] ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] opacity-90 cursor-not-allowed' : mcqAnswers[idx] != null ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {idx+1}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">Question {currentQuestion+1} of {attempt.mcqSnapshot.length}</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-[#071025]/80 px-3 py-2 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="text-sm font-medium">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</div>
                </div>
                <button onClick={()=>handleSubmit(false)} disabled={submitting} className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-foreground)] rounded hover:bg-[#6b0f26]">{submitting ? 'Submitting...' : 'Submit Test'}</button>
              </div>
            </div>

          <div className="bg-[#0b0b10] p-6 rounded mb-4">
            <div className="mb-4 flex items-start justify-between">
              <div className="text-white mr-4">{q?.question}</div>
              {attempt.perQuestionTimerEnabled && (
                <div className="text-sm text-[var(--color-accent)] ml-4">Per-Q: {Math.floor(perQTimeLeft/60).toString().padStart(2,'0')}:{(perQTimeLeft%60).toString().padStart(2,'0')}</div>
              )}
            </div>
            <div className="space-y-2">
              {q?.options?.map((opt:any, i:number)=>(
                <label key={i} className={`block p-3 rounded border ${mcqAnswers[currentQuestion]===i? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10':'border-white/10'} cursor-pointer flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={mcqAnswers[currentQuestion]===i} onChange={()=>selectAnswer(currentQuestion, i)} className="mr-2" />
                    <span>{opt}</span>
                  </div>

                </label>
              ))}
            </div>
          </div>
            <div className="flex gap-3">
            <button onClick={()=>{
                // go to previous unlocked question
                const prevIdx = findPrevUnlocked(currentQuestion-1);
                if (prevIdx === -1) { toast.error('No previous unlocked question'); return; }
                goToQuestion(prevIdx);
              }} className="px-4 py-2 bg-white/5 rounded">Previous</button>
            <button onClick={()=>{
                // go to next unlocked question
                const nextIdx = findNextUnlocked(currentQuestion+1);
                if (nextIdx === -1) {
                  // if none, consider submitting if at end
                  if (currentQuestion >= (attempt.mcqSnapshot.length||1)-1) { toast.error('No further questions'); return; }
                  toast.error('No next unlocked question');
                  return;
                }
                goToQuestion(nextIdx);
              }} className="px-4 py-2 bg-white/5 rounded">Next</button>
          </div>

          {/* Mobile Question Navigator */}
          <div className="lg:hidden mt-6 p-4 bg-[#111118] border border-white/5 rounded-xl">
            <div className="flex gap-4 mb-4">
              <button className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors bg-[var(--color-primary)] text-[var(--color-foreground)]`}>Questions</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {attempt.mcqSnapshot.map((_:any, idx:number)=>(
                <button key={idx} onClick={()=>{ goToQuestion(idx); }} disabled={locked[idx] && idx !== currentQuestion} className={`w-8 h-8 text-xs rounded flex items-center justify-center ${currentQuestion===idx ? 'bg-[var(--color-primary)] text-white' : locked[idx] ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] opacity-90 cursor-not-allowed' : mcqAnswers[idx] != null ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                  {idx+1}
                </button>
              ))}
            </div>
          </div>
        </main>
        <LoginRequiredModal open={showLoginModal} onClose={()=>setShowLoginModal(false)} callbackUrl={typeof window !== 'undefined' ? window.location.href : '/skill-test/run'} />
      </div>
    </div>
  );
}
