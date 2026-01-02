"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  List,
  CheckCircle,
  Bookmark,
} from "lucide-react";
import useCurrentUser from "@/lib/useCurrentUser";
import LoginRequiredModal from '@/components/ui/LoginRequiredModal';
import { toast } from 'react-hot-toast';

export default function SkillPractice({ params }: any) {
  const router = useRouter();
  const { skillId } = params;
  const user = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reveals, setReveals] = useState<any>({});
  const [filter, setFilter] = useState<"all" | "solved" | "marked" | "unsolved">("all");

  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());
  const [markedSet, setMarkedSet] = useState<Set<string>>(new Set());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  // Premium paywall removed - all features free
  const [premiumRequired, setPremiumRequired] = useState(false); // Will never be true now
  // Truncation state (when Skill Test Premium gating limits questions)
  const [truncated, setTruncated] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  // Timing / analytics for practice per-question
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [questionDurations, setQuestionDurations] = useState<Record<string, number>>({});

  // Purchase modal / login state (must be declared unconditionally to preserve hook order)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(`/api/practice/skill?skillId=${skillId}`, { headers, credentials: 'include' });
        if (res.status === 403) {
          setPremiumRequired(true);
          return;
        }
        const j = await res.json();
        setSkill(j.skill);
        setQuestions(j.questions || []);
        setTruncated(!!j.truncated);
        setTotalQuestions(j.totalQuestions ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [skillId]);

  useEffect(() => {
    setSolvedSet(new Set(user?.solvedProblems || []));
    setMarkedSet(new Set(user?.reviewProblems || []));
  }, [user]);



  const getLink = (qid: string) => `practice:${skillId}:${qid}`;

  /* ================= FILTER ================= */
  const visibleQuestions = questions.filter((q) => {
    const link = getLink(q._id);
    if (filter === "solved") return solvedSet.has(link);
    if (filter === "marked") return markedSet.has(link);
    if (filter === "unsolved") return !solvedSet.has(link);
    return true;
  });

  // Ensure currentIndex is valid
  useEffect(() => {
    if (currentIndex >= visibleQuestions.length) setCurrentIndex(Math.max(0, visibleQuestions.length - 1));
  }, [visibleQuestions]);

  // Track when a question becomes visible so we can measure time to answer
  useEffect(() => {
    const q = visibleQuestions[currentIndex];
    if (!q) return;
    const qid = String(q._id);
    setQuestionStartTimes((p) => ({ ...p, [qid]: p[qid] || Date.now() }));
  }, [currentIndex]);

  // Toggle solved for the current question (explicit user action)
  const handleToggleSolved = async (qid: string) => {
    const link = getLink(qid);
    if (!user) return router.push('/auth/login');
    try {
      // Optimistic update
      setSolvedSet(prev => {
        const n = new Set(prev);
        if (n.has(link)) n.delete(link); else n.add(link);
        return n;
      });
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/user/problem-status', { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ problemLink: link, action: 'toggleSolved' }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Revert optimistic update on failure
        setSolvedSet(new Set(j.solvedProblems || user?.solvedProblems || []));
        alert(j?.error || 'Failed to update solved status');
      } else {
        setSolvedSet(new Set(j.solvedProblems || []));
      }
    } catch (err) {
      console.error('Failed to toggle solved', err);
    }
  };

  // Toggle marked (review) for the current question
  const handleToggleMarked = async (qid: string) => {
    const link = getLink(qid);
    if (!user) return router.push('/auth/login');
    try {
      setMarkedSet(prev => {
        const n = new Set(prev);
        if (n.has(link)) n.delete(link); else n.add(link);
        return n;
      });
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/user/problem-status', { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ problemLink: link, action: 'toggleReview' }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMarkedSet(new Set(j.reviewProblems || user?.reviewProblems || []));
        alert(j?.error || 'Failed to update review status');
      } else {
        setMarkedSet(new Set(j.reviewProblems || []));
      }
    } catch (err) {
      console.error('Failed to toggle review', err);
    }
  };

  const q = visibleQuestions[currentIndex];

  /* ================= ACTIONS ================= */
  const selectOption = async (qid: string, idx: number) => {
    setAnswers((p) => ({ ...p, [qid]: idx }));
    const q = questions.find((x) => x._id === qid);
    if (!q) return;

    const correctIndex = Number(q.correctAnswer);
    const isCorrect = idx === correctIndex;

    // Record duration for this question (if start time exists)
    try {
      const now = Date.now();
      const start = questionStartTimes[qid];
      if (start) {
        const dur = Math.max(0, now - start);
        setQuestionDurations((p) => ({ ...p, [qid]: dur }));
      }
    } catch (e) {
      console.error('Failed to record duration', e);
    }

    setReveals((p: any) => ({
      ...p,
      [qid]: {
        selectedIndex: idx,
        correctIndex,
        correct: isCorrect,
        explanation: q.explanation || null,
      },
    }));

    // Auto-mark as solved on selection (explicit request): only mark if not already solved
    try {
      const link = getLink(qid);
      if (user && !solvedSet.has(link)) {
        // Use the existing toggler which will set solved on server and update local state
        handleToggleSolved(qid);
      }
    } catch (e) {
      console.error('Failed to auto-mark solved', e);
    }

    // Do NOT auto-mark solved on answer. Users can explicitly mark questions as solved using the Mark Solved button.
    // We keep timings and reveal behavior above.
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E1D4C1]" />
      </div>
    );

  const handlePracticePurchase = async () => {
    if (user === undefined) return; // loading
    if (!user) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
    setProcessingPurchase(true);
    try {
      const res = await fetch('/api/payment/practice/create', { method: 'POST', credentials: 'include' });
      const j = await res.json();
      if (!res.ok) {
        if (res.status === 401) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
        toast.error(j.error || 'Failed to create payment request');
        setProcessingPurchase(false);
        return;
      }
      if (j.paymentUrl) window.location.href = j.paymentUrl;
    } catch (err:any) {
      toast.error(err?.message || 'Failed to initiate payment');
    } finally { setProcessingPurchase(false); }
  };

  if (premiumRequired)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
        <div className="bg-[#111118] border border-white/5 rounded-xl p-6 text-center">
          <p className="text-[#E1D3CC] mb-4">
            This skill requires <strong>Premium</strong>.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setShowPurchaseModal(true)} className="px-4 py-2 bg-yellow-400 text-black rounded-lg">Purchase Premium</button>
            <button onClick={() => router.push('/skill-tests')} className="px-4 py-2 bg-white/5 rounded-lg">Back</button>
          </div>

          {/* Purchase Modal */}
          {showPurchaseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowPurchaseModal(false)} />
              <div className="relative z-10 bg-[#0b0b10] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">Purchase Premium</h3>
                <p className="text-sm text-[#E1D4C1] mb-4">Premium unlocks all practice content, skill tests and company problem sets.</p>
                <div className="flex gap-3">
                  <button onClick={handlePracticePurchase} disabled={processingPurchase} className="px-4 py-2 bg-[#7E102C] rounded text-[#E1D4C1]">
                    {processingPurchase ? 'Processing...' : `Pay ₹${/* price fetched on page or default */ 249} & Unlock`}
                  </button>
                  <button onClick={() => setShowPurchaseModal(false)} className="px-4 py-2 bg-white/5 rounded">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <LoginRequiredModal open={showLoginModal} onClose={()=>setShowLoginModal(false)} callbackUrl={typeof window !== 'undefined' ? window.location.href : `/practice/skill/${skillId}`} />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/practice")}
            className="flex items-center gap-2 text-sm text-[#E1D3CC] hover:text-[#E1D4C1]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Practice
          </button>

          <h1 className="text-2xl font-bold text-[#E1D4C1] mt-2">
            {skill?.title} Practice
          </h1>
          <p className="text-sm text-[#E1D3CC] mt-1">
            Attempt MCQs one-by-one. Instant feedback after each answer.
          </p>
          {truncated && totalQuestions !== null && (
            <div className="mt-3 p-3 bg-[#1a1512] border border-yellow-500/20 rounded-lg text-sm flex items-center justify-between gap-4">
              <div className="text-yellow-300">Only {questions.length} of {totalQuestions} questions are available for preview. Purchase <strong>Premium</strong> to unlock the full set.</div>
              <button onClick={() => router.push('/skill-tests')} className="px-3 py-2 bg-yellow-400 text-black rounded">Upgrade</button>
            </div>
          )}

          {/* Fixed Back button (top-left) */}
          <button onClick={() => router.push('/practice')} className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-[#111118] border border-white/5 rounded-lg text-sm text-[#E1D4C1]">
            <ArrowLeft className="w-4 h-4" /> Practice
          </button>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", "solved", "marked", "unsolved"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === f
                  ? "bg-[#7E102C] text-white"
                  : "bg-[#111118] border border-white/5 text-[#E1D4C1]"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* ================= QUESTION ================= */}
        {!q ? (
          <div className="p-6 bg-[#111118] border border-white/5 rounded-xl text-[#E1D3CC]">
            No questions available.
          </div>
        ) : (
          <div className="bg-[#111118] border border-white/5 rounded-xl p-5">
            <div className="flex justify-between mb-3">
              <div className="text-sm text-[#E1D3CC]">
                Question {currentIndex + 1} / {visibleQuestions.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-1 text-sm text-[#E1D4C1]"
                >
                  <List className="w-4 h-4" />
                  All
                </button>

                <button
                  onClick={() => setShowSummary(true)}
                  className="px-3 py-1 rounded bg-[#111118] border border-white/5 text-sm text-[#E1D4C1]"
                  title="Show practice summary"
                >
                  Summary
                </button>

                <button
                  onClick={() => handleToggleSolved(q._id)}
                  className={`px-3 py-1 rounded text-sm ${solvedSet.has(getLink(q._id)) ? 'bg-green-600 text-white' : 'bg-[#111118] border border-white/5 text-[#E1D4C1]'}`}
                >
                  {solvedSet.has(getLink(q._id)) ? 'Solved' : 'Mark Solved'}
                </button>

                <button
                  onClick={() => handleToggleMarked(q._id)}
                  className={`px-3 py-1 rounded text-sm ${markedSet.has(getLink(q._id)) ? 'bg-yellow-400 text-black' : 'bg-[#111118] border border-white/5 text-[#E1D4C1]'}`}
                >
                  {markedSet.has(getLink(q._id)) ? 'Marked' : 'Mark'}
                </button>

              </div>
            </div>

            <div className="font-medium text-[#E1D4C1] mb-4">
              {q.question}
            </div>

            <div className="grid gap-3">
              {q.options.map((opt: string, i: number) => {
                const r = reveals[q._id];
                const state =
                  r &&
                  (i === r.correctIndex
                    ? "border-green-500 bg-green-500/10"
                    : i === r.selectedIndex
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/5");

                return (
                  <button
                    key={i}
                    onClick={() => selectOption(q._id, i)}
                    className={`p-3 rounded-lg border text-left text-[#E1D4C1] ${state}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {reveals[q._id]?.explanation && (
              <div className="mt-4 text-sm text-[#E1D3CC]">
                <strong>Explanation:</strong> {reveals[q._id].explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= BOTTOM NAV (MOBILE FRIENDLY) ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f] border-t border-white/5 p-3">
        <div className="max-w-3xl mx-auto flex justify-between gap-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="flex-1 px-4 py-2 rounded-lg bg-[#111118] text-[#E1D4C1] disabled:opacity-40"
          >
            Prev
          </button>
          {currentIndex === visibleQuestions.length - 1 ? (
            <button
              onClick={() => setShowSummary(true)}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold"
            >
              Finish Practice
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(visibleQuestions.length - 1, i + 1)
                )
              }
              className="flex-1 px-4 py-2 rounded-lg bg-[#7E102C] text-white"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* ================= QUESTION DRAWER ================= */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-72 h-full bg-[#111118] border-l border-white/5 p-4">
            <div className="flex justify-between mb-4">
              <div className="font-medium text-[#E1D4C1]">Questions</div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-sm text-[#E1D3CC]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {visibleQuestions.map((q, i) => {
                const rid = String(q._id);
                const r = reveals[rid];
                const isCorrect = r?.correct === true;
                const isIncorrect = r && r.correct === false;
                const link = getLink(q._id);
                const isSolved = solvedSet.has(link);
                const isMarked = markedSet.has(link);

                const boxClass = i === currentIndex
                  ? 'bg-[#7E102C] text-white'
                  : isCorrect
                    ? 'bg-green-600 text-white'
                    : isIncorrect
                      ? 'bg-red-600 text-white'
                      : isMarked
                        ? 'bg-yellow-400 text-black'
                        : 'bg-[#0a0a0f] border border-white/5 text-[#E1D4C1]';

                return (
                  <button
                    key={q._id}
                    onClick={() => { setCurrentIndex(i); setShowDrawer(false); }}
                    className={`w-10 h-10 rounded-lg text-sm ${boxClass}`}
                    title={`Q${i+1} ${isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : isSolved ? 'Solved' : isMarked ? 'Marked' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUMMARY MODAL ================= */}
      {showSummary && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
          <div className="w-full max-w-xl bg-[#111118] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-[#E1D4C1]">Practice Summary</div>
              <button onClick={() => setShowSummary(false)} className="text-sm text-[#E1D3CC]">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-[#0a0a0f] rounded-lg">
                <div className="text-xs text-[#E1D3CC]">Attempted</div>
                <div className="text-2xl font-bold text-white">{Object.keys(reveals).length}</div>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg">
                <div className="text-xs text-[#E1D3CC]">Correct</div>
                <div className="text-2xl font-bold text-green-400">{Object.values(reveals).filter((r:any)=>r.correct).length}</div>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg">
                <div className="text-xs text-[#E1D3CC]">Incorrect</div>
                <div className="text-2xl font-bold text-red-400">{Object.values(reveals).filter((r:any)=>r.correct === false).length}</div>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg">
                <div className="text-xs text-[#E1D3CC]">Avg time / question</div>
                <div className="text-2xl font-bold text-white">{(() => {
                  const durValues = Object.keys(questionDurations).map(k => questionDurations[k]);
                  if (!durValues.length) return '—';
                  const avgMs = Math.round(durValues.reduce((a,b)=>a+b,0) / durValues.length);
                  return `${Math.round(avgMs/1000)}s`;
                })()}</div>
              </div>
            </div>

            <div className="text-sm text-[#E1D3CC]">Detailed per-question status:</div>
            <div className="mt-3 max-h-48 overflow-auto grid grid-cols-4 gap-2">
              {visibleQuestions.map((q, i) => {
                const rid = String(q._id);
                const r = reveals[rid];
                const dur = questionDurations[rid];
                return (
                  <div key={rid} className="p-2 bg-[#0a0a0f] rounded">
                    <div className="text-xs text-[#E1D3CC]">Q{i+1}</div>
                    <div className={`text-sm font-medium ${r ? (r.correct ? 'text-green-400' : 'text-red-400') : 'text-[#E1D4C1]'}`}>{r ? (r.correct ? 'Correct' : 'Incorrect') : 'Unattempted'}</div>
                    <div className="text-xs text-[#E1D3CC] mt-1">{dur ? `${Math.round(dur/1000)}s` : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
