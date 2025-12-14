"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import useCurrentUser from "@/lib/useCurrentUser";
import LoginRequiredModal from "@/components/ui/LoginRequiredModal";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function SkillTestHistory() {
  const user = useCurrentUser();
  const [history, setHistory] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    axios
      .get("/api/skill-test/history")
      .then((r) => {
        if (r.data.success) setHistory(r.data.attempts || []);
      })
      .catch(() => {});
  }, [user]);

  React.useEffect(()=>{ if (user) setShowLoginModal(false); }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => router.push("/skill-tests")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ChevronLeft size={18} />
          Back to Skill Tests
        </button>

        {/* Header */}
        <h1 className="text-3xl font-extrabold mb-2">
          Skill Test History
        </h1>
        <p className="text-gray-400 mb-8">
          Review your past attempts, re-attempt tests, and track your progress.
        </p>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="bg-[#0b0b11] border border-white/10 rounded-xl p-6 text-center text-gray-400">
            No skill test attempts found yet.
          </div>
        )}

        {/* History Cards */}
        <div className="space-y-4">
          {history.map((h) => (
            <div
              key={h._id}
              className="p-4 bg-[#0b0b11] rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Left */}
              <div>
                <div className="text-lg font-semibold">
                  {h.testName}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {h.mcqSnapshot?.length || 0} questions •{" "}
                  {new Date(h.startedAt).toLocaleString()}
                </div>
              </div>

              {/* Right */}
              <div className="flex gap-3">
                {h.submittedAt ? (
                  <button onClick={() => router.push(`/skill-test/result?attemptId=${h._id}`)} className="px-4 py-2 bg-white/5 text-white rounded-lg">View Result</button>
                ) : (
                  <button onClick={() => router.push(`/skill-test/run?attemptId=${h._id}`)} className="px-4 py-2 bg-white/5 text-white rounded-lg">Resume</button>
                )}

                <button
                  onClick={async () => {
                    try {
                      const res = await axios.post('/api/skill-test/reattempt', { attemptId: h._id });
                      if (res.data?.success) {
                        // refresh history and navigate to new attempt
                        const r = await axios.get('/api/skill-test/history');
                        if (r.data?.success) setHistory(r.data.attempts || []);
                        router.push(`/skill-test/run?attemptId=${res.data.attemptId}`);
                      } else {
                        alert(res.data?.error || 'Failed to reattempt');
                      }
                    } catch (e:any) { alert(e?.message||'Failed to reattempt'); }
                  }}
                  className="px-4 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-600/30 transition"
                >
                  Re-attempt
                </button>
              </div>
            </div>
          ))}
        </div>

        <LoginRequiredModal open={showLoginModal} onClose={()=>setShowLoginModal(false)} callbackUrl={typeof window !== 'undefined' ? window.location.href : '/skill-test/history'} />
      </div>
    </div>
  );
}
