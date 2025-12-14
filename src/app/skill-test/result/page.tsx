"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronLeft } from "lucide-react";

export default function SkillTestResult() {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAttemptId(new URLSearchParams(window.location.search).get('attemptId'));
  }, []);

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      try {
        const res = await fetch(`/api/skill-test?attemptId=${attemptId}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed");
        setAttempt(j.attempt);
      } catch (e: any) {
        alert(e?.message || "Failed to load");
        router.push("/skill-tests");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">
        Loading results…
      </div>
    );

  if (!attempt)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">
        Result not found
      </div>
    );

  const percentage = attempt.percentage || 0;
  const passed = attempt.passed;

  // Compute additional stats
  const totalQuestions = attempt.mcqSnapshot?.length || 0;
  const attemptedCount = (attempt.mcqAnswers || []).filter((a:any) => a !== null && a !== undefined).length;
  const correctCount = (attempt.mcqSnapshot || []).reduce((s:any, q:any, idx:number) => s + ((attempt.mcqAnswers?.[idx] !== null && attempt.mcqAnswers?.[idx] !== undefined && Number(attempt.mcqAnswers?.[idx]) === Number(q.correctAnswer)) ? 1 : 0), 0);
  const accuracyAttempted = attemptedCount === 0 ? 0 : Math.round((correctCount / attemptedCount) * 100);

  // per-skill stats
  const skillMap: Record<string, { attempted: number; correct: number; wrong: number }> = {};
  (attempt.mcqSnapshot || []).forEach((q:any, idx:number) => {
    const st = q.skillTitle || 'General';
    if (!skillMap[st]) skillMap[st] = { attempted: 0, correct: 0, wrong: 0 };
    const ua = attempt.mcqAnswers?.[idx];
    if (ua !== null && ua !== undefined) {
      skillMap[st].attempted += 1;
      if (Number(ua) === Number(q.correctAnswer)) skillMap[st].correct += 1; else skillMap[st].wrong += 1;
    }
  });
  const skillStats = Object.keys(skillMap).map(k => ({ skill: k, ...skillMap[k], accuracy: skillMap[k].attempted ? Math.round((skillMap[k].correct / skillMap[k].attempted) * 100) : 0 }));
  const leastAttempted = [...skillStats].sort((a,b)=>a.attempted - b.attempted).slice(0,3);
  const leastCorrect = [...skillStats].sort((a,b)=>a.accuracy - b.accuracy).slice(0,3);
  const mostWrong = [...skillStats].sort((a,b)=>b.wrong - a.wrong).slice(0,3);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/skill-tests")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <h1 className="text-lg font-semibold">Skill Test Result</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* Result Summary */}
        <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
          <div
            className={`absolute inset-0 ${
              passed ? "bg-green-500/10" : "bg-red-500/10"
            } blur-[120px]`}
          />

          <div className="relative z-10">
            <div
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                passed ? "bg-green-500/15" : "bg-red-500/15"
              }`}
            >
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : (
                <XCircle className="w-12 h-12 text-red-400" />
              )}
            </div>

            <h2 className="text-4xl font-extrabold mb-2">
              {passed ? "Congratulations!" : "Test Not Cleared"}
            </h2>

            <p className="text-gray-400 mb-6">
              You scored <span className="text-white font-semibold">{percentage}%</span>
              <span className="block text-sm text-gray-400 mt-2">Attempted: <span className="text-white">{attemptedCount}</span> / <span className="text-white">{totalQuestions}</span> • Accuracy (attempted): <span className="text-white">{accuracyAttempted}%</span></span>
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-3 ${
                    passed ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Question Review</h3>

          {attempt.mcqSnapshot.map((q: any, idx: number) => {
            const userAnswer = attempt.mcqAnswers?.[idx];

            return (
              <div
                key={idx}
                className="bg-[#0b0b10] border border-white/5 rounded-2xl p-6"
              >
                <div className="mb-4 text-lg font-semibold">
                  Q{idx + 1}. {q.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt: string, oi: number) => {
                    const isCorrect = q.correctAnswer === oi;
                    const isUser = userAnswer === oi;

                    return (
                      <div
                        key={oi}
                        className={`p-3 rounded-xl border flex items-start gap-3
                          ${
                            isCorrect
                              ? "bg-green-600/10 border-green-500/30"
                              : isUser
                              ? "bg-red-600/10 border-red-500/30"
                              : "bg-white/5 border-white/10"
                          }`}
                      >
                        <div className="mt-1">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : isUser ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : null}
                        </div>

                        <div>
                          <div className="text-sm">{opt}</div>
                          {isCorrect && (
                            <div className="text-xs text-green-400">
                              Correct Answer
                            </div>
                          )}
                          {isUser && !isCorrect && (
                            <div className="text-xs text-red-400">
                              Your Answer
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

            {/* Suggestions */}
            <div className="p-4 bg-[#0b0b11] border border-white/5 rounded-xl flex gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-400">Skills to review (least attempted)</div>
                {leastAttempted.length === 0 ? <div className="text-sm text-gray-400">—</div> : leastAttempted.map(s => (
                  <div key={s.skill} className="flex items-center justify-between mt-2">
                    <div className="text-sm">{s.skill}</div>
                    <div className="text-xs text-gray-400">{s.attempted} attempted</div>
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Lowest accuracy</div>
                {leastCorrect.length === 0 ? <div className="text-sm text-gray-400">—</div> : leastCorrect.map(s => (
                  <div key={s.skill} className="flex items-center justify-between mt-2">
                    <div className="text-sm">{s.skill}</div>
                    <div className="text-xs text-gray-400">{s.accuracy}%</div>
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">Most wrong</div>
                {mostWrong.length === 0 ? <div className="text-sm text-gray-400">—</div> : mostWrong.map(s => (
                  <div key={s.skill} className="flex items-center justify-between mt-2">
                    <div className="text-sm">{s.skill}</div>
                    <div className="text-xs text-gray-400">{s.wrong} wrong</div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={() => router.push("/profile?tab=tests")}
            className="px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10"
          >
            View in Profile
          </button>

          <button
            onClick={() => router.push("/skill-tests")}
            className="px-6 py-3 bg-emerald-600 rounded-xl hover:bg-emerald-700"
          >
            Attempt Another Test
          </button>
        </div>
      </main>
    </div>
  );
}
