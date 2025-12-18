"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, ChevronDown } from "lucide-react";
import useCurrentUser from "@/lib/useCurrentUser";
import LoginRequiredModal from "@/components/ui/LoginRequiredModal";

export default function SkillTestsPage() {
  const router = useRouter();

  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const [testName, setTestName] = useState("My Skill Test");
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);

  const [perQuestionTimerEnabled, setPerQuestionTimerEnabled] = useState(false);
  const [perQuestionTimeMinutes, setPerQuestionTimeMinutes] = useState(1);
  const [oneTimeVisit, setOneTimeVisit] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremiumPurchased, setIsPremiumPurchased] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [skillPrice, setSkillPrice] = useState<number | null>(null);
  const user = useCurrentUser();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* FETCH SKILLS */
  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/payment/skill-test');
      let purchased = false;
      if (res.ok) {
        const j = await res.json(); purchased = !!j.purchased; setIsPremiumPurchased(purchased);
      }
      const pricingRes = await fetch('/api/admin/pricing');
      if (pricingRes.ok) {
        const p = await pricingRes.json(); setSkillPrice(p.pricing?.premium ?? null);
        // Ensure fresh pricing if admin updated recently (bust cache on critical flows).
      }
      const ac = await fetch('/api/skill-test/attempts-count');
      if (ac.ok) { const ajson = await ac.json(); setAttemptsCount(ajson.attempts || 0); }
      const shown = sessionStorage.getItem('skillTestModalShown');
      if (!shown && !purchased) { setShowPremiumModal(true); sessionStorage.setItem('skillTestModalShown', 'true'); }
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    fetchPricing();

    // fetch skills list
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/skills');
        if (res.ok) { const j = await res.json(); setSkills(j.skills || []); }
      } catch (e) { console.error('Failed to fetch skills', e); }
    };
    fetchSkills();
  }, []);

  // Re-fetch pricing/purchase when user changes (e.g., after signing in)
  useEffect(() => { fetchPricing(); }, [user]);

  // close premium modal if user becomes premium
  React.useEffect(() => { if (isPremiumPurchased) setShowPremiumModal(false); }, [isPremiumPurchased]);

  // close login modal when user logs in
  React.useEffect(()=>{ if (user) setShowLoginModal(false); }, [user]);

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const close = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", e => e.key === "Escape" && setOpenDropdown(false));
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ACTIONS */
  const addSkill = (skill: any) => {
    if (selectedSkills.some(s => s._id === skill._id)) return;
    setSelectedSkills(prev => [...prev, skill]);
    setSearch("");
    setOpenDropdown(false);
  };

  const removeSkill = (id: string) => {
    setSelectedSkills(prev => prev.filter(s => s._id !== id));
  };

  const handleCreate = async () => {
    if (!selectedSkills.length) return alert("Select at least one skill");
    if (user === undefined) return; // still loading
    if (!user) { setShowLoginModal(true); return; }

    const res = await fetch("/api/skill-test/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testName,
        skills: selectedSkills.map(s => s._id),
        totalQuestions,
        timeLimitMinutes,
        perQuestionTimerEnabled,
        perQuestionTimeMinutes,
        oneTimeVisit
      })
    });

    const j = await res.json();
    if (!res.ok) {
      if (res.status === 403 && j.error && j.error.toLowerCase().includes('attempt limit')) {
        setShowPremiumModal(true);
        return;
      }
      return alert(j.error || "Failed");
    }

    router.push(`/skill-test/run?attemptId=${j.attemptId}`);
  };

  const filteredSkills = skills.filter(
    s =>
      s.title.toLowerCase().includes(search.toLowerCase()) &&
      !selectedSkills.some(sel => sel._id === s._id)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="max-w-3xl mx-auto">

        <div className="flex items-start justify-between mb-6">
          <div>
            {/* Back */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[#E1D3CC] hover:text-[#E1D4C1] mb-2"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {/* Header */}
            <h1 className="text-3xl font-extrabold text-[#E1D4C1]">Create Skill Test</h1>
            <p className="text-[#E1D3CC] mt-1">Build a focused skill assessment. Pass ≥60% to qualify.</p>
          </div>

          {/* Buy Premium Button on top-right */}
          {!isPremiumPurchased && (
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={async () => {
                  if (user === undefined) return; // still loading
                  if (!user) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                  try {
                    // Initiate purchase flow (admin price is validated server-side)
                    const res = await fetch('/api/payment/skill-test/create', { method: 'POST', credentials: 'include' });
                    const j = await res.json();
                    if (res.status === 401) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                    const errMsg = typeof j?.error === 'object' ? (j?.error?.message || JSON.stringify(j?.error)) : j?.error;
                    if (!res.ok) throw new Error(errMsg || 'Failed to initiate purchase');
                    if (j.paymentUrl) window.location.href = j.paymentUrl;
                  } catch (e: any) {
                    toast.error(e?.message || 'Failed to initiate purchase');
                  }
                }}
                className="px-4 py-2 bg-yellow-500 rounded text-black font-medium"
              >
                Buy Premium
              </button>
            </div>
          )}
        </div>

        <LoginRequiredModal open={showLoginModal} onClose={()=>setShowLoginModal(false)} callbackUrl={typeof window !== 'undefined' ? window.location.href : '/skill-tests'} />
        {/* Card */}
        <div className="space-y-6 bg-[#0b0b10]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

          {/* Test Name */}
          <div>
          {/* Premium Modal */}
          {showPremiumModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowPremiumModal(false)} />
              <div className="relative bg-[#0b0b10] border border-white/10 rounded-2xl p-6 max-w-xl w-full z-10">
                <h3 className="text-xl font-semibold mb-2">Premium</h3>
                <p className="text-sm text-[#E1D4C1] mb-4">Unlock unlimited attempts and premium test features (per-question timers, one-time visit enforcement, priority support). Upgrading to Premium also grants access to company problems and full practice content.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-yellow-500 rounded font-medium" onClick={async ()=>{
                    if (user === undefined) return;
                    if (!user) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                    try {
                      const res = await fetch('/api/payment/skill-test/create', { method: 'POST', credentials: 'include' });
                      const j = await res.json();
                      if (res.status === 401) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                      if (!res.ok) throw new Error(j.error || 'Payment initiation failed');
                      if (j.paymentUrl) window.location.href = j.paymentUrl;
                    } catch (e:any) { toast.error(e?.message || 'Failed to initiate purchase'); }
                  }}> 
                    <span className="mr-2">Buy Premium — ₹{skillPrice}</span>
                    <span className="text-xs text-gray-300 line-through">
                      ₹{skillPrice != null && skillPrice > 0 ? skillPrice + 100 : ''}
                    </span>
                  </button>
                  <button className="px-4 py-2 bg-white/5 rounded" onClick={() => setShowPremiumModal(false)}>Continue without premium</button>
                </div>
              </div>
            </div>
          )}
            <label className="text-sm text-[#E1D4C1] mb-1 block">Test Name</label>
            <input
              value={testName}
              onChange={e => setTestName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#07070a] border border-white/10 focus:border-[#3E80F6] outline-none"
            />
          </div>

          {/* Skills */}
          <div ref={dropdownRef} className="relative">
            <label className="text-sm text-[#E1D4C1] mb-2 block">Skills</label>

            <div
              onClick={() => setOpenDropdown(true)}
              className="flex items-center gap-2 p-3 bg-[#07070a] border border-white/10 rounded-lg cursor-text"
            >
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setOpenDropdown(true);
                }}
                placeholder="Search skills"
                className="bg-transparent outline-none flex-1 text-sm"
              />
              <ChevronDown size={16} className="text-[#E1D3CC]" />
            </div>

            {openDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-[#0b0b10] border border-white/10 rounded-xl max-h-60 overflow-auto">
                {filteredSkills.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[#E1D3CC]">No skills found</div>
                )}
                {filteredSkills.map(s => (
                  <div
                    key={s._id}
                    onClick={() => addSkill(s)}
                    className="px-4 py-3 cursor-pointer hover:bg-[#3E80F6]/10 flex justify-between"
                  >
                    <span>{s.title}</span>
                    <span className="text-xs text-[#E1D3CC]">{s.questionCount} Qs</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(s => (
                <div
                  key={s._id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border"
                  style={{
                    background: "rgba(62,128,246,0.12)",
                    borderColor: "rgba(62,128,246,0.35)"
                  }}
                >
                  {s.title}
                  <button onClick={() => removeSkill(s._id)}>
                    <X size={14} className="hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Questions */}
          <div>
            <label className="text-sm text-[#E1D4C1] mb-1 block">Questions</label>
            <select
              value={totalQuestions}
              onChange={e => setTotalQuestions(Number(e.target.value))}
              className="p-3 bg-[#07070a] border border-white/10 rounded-lg"
            >
              {[15, 20, 30, 40, 50, 60].map(n => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm text-[#E1D4C1] mb-1 block">Total Time (minutes)</label>
            <input
              type="number"
              value={timeLimitMinutes}
              onChange={e => setTimeLimitMinutes(Number(e.target.value))}
              className="w-40 p-3 bg-[#07070a] border border-white/10 rounded-lg focus:border-[#3E80F6]"
            />
          </div>

          {/* Sliders */}
          <div className="space-y-4">

            {/* Per Question Timer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Per-question timer</span>
                <button
                  onClick={() => setPerQuestionTimerEnabled(v => !v)}
                  className={`w-12 h-6 rounded-full transition ${
                    perQuestionTimerEnabled ? "bg-[#3E80F6]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`h-5 w-5 bg-white rounded-full transition transform ${
                      perQuestionTimerEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {perQuestionTimerEnabled && (
                <input
                  type="number"
                  value={perQuestionTimeMinutes}
                  onChange={e => setPerQuestionTimeMinutes(Number(e.target.value))}
                  className="w-40 p-2 bg-[#07070a] border border-white/10 rounded-lg"
                />
              )}
            </div>

            {/* One Time Visit */}
            <div className="flex justify-between items-center">
              <span className="text-sm">One-time visit per question</span>
              <button
                onClick={() => setOneTimeVisit(v => !v)}
                className={`w-12 h-6 rounded-full transition ${
                  oneTimeVisit ? "bg-[#3E80F6]" : "bg-white/20"
                }`}
              >
                <div
                  className={`h-5 w-5 bg-white rounded-full transition transform ${
                    oneTimeVisit ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-3 text-sm text-yellow-200">
            {isPremiumPurchased ? (
              <div>Premium active: unlimited attempts.</div>
            ) : (
              <div>You have used <strong>{attemptsCount}</strong> of 2 free attempts. Purchase Premium to unlock unlimited attempts.</div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-[#7E102C] hover:bg-[#6a0f27] text-[#E1D4C1] font-semibold rounded-xl transition-all duration-300"
            >
              Start Test
            </button>

            <button
              onClick={() => router.push("/skill-test/history")}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10"
            >
              History
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
