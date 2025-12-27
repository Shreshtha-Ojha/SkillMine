"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  Search,
  ExternalLink,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Layers,
  CheckCircle2,
  Flag,
} from "lucide-react";
import Link from "next/link";
import useCurrentUser from '@/lib/useCurrentUser';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 25;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/company-problems/analysis?${params}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");

      setQuestions(j.topQuestions || []);
      setTotal(j.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchDetails = async (title: string) => {
    try {
      setDetailsLoading(true);
      const res = await fetch(
        `/api/company-problems/analysis?title=${encodeURIComponent(title)}`
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setSelected(j);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const chartData = useMemo(() => questions.slice(0, 8), [questions]);

  // User interactions
  const user = useCurrentUser();
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set());
  const [busyQuestion, setBusyQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSolvedSet(new Set(user.solvedProblems || []));
      setReviewSet(new Set(user.reviewProblems || []));
    } else {
      setSolvedSet(new Set());
      setReviewSet(new Set());
    }
  }, [user]);

  /* ------------------ Chart ------------------ */
  const Chart = ({ data }: { data: any[] }) => {
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.title} className="flex items-center gap-3">
            <div className="w-32 truncate text-xs text-[#E1D4C1]">
              {d.title}
            </div>
            <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7E102C] to-[#a81a3d]"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs text-[#E1D3CC]">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <Link
              href="/company-problems"
              className="flex items-center gap-2 text-sm text-[#E1D3CC] hover:text-[#E1D4C1]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <h1 className="text-3xl font-bold text-[#E1D4C1] mt-2">
              Interview Question Intelligence
            </h1>
            <p className="text-sm text-[#E1D3CC] mt-1">
              Identify the questions that dominate real interview rounds
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1D3CC]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interview question"
                className="pl-10 pr-4 py-2 bg-[#111118] border border-white/10 rounded-xl text-[#E1D4C1] focus:outline-none focus:ring-2 focus:ring-[#7E102C]/40"
              />
            </div>
            <button
              onClick={() => {
                setPage(1);
                fetchList();
              }}
              className="px-5 py-2 rounded-xl bg-[#7E102C] text-[#E1D4C1] font-semibold hover:opacity-90"
            >
              Search
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Stat icon={<Layers />} label="Unique Questions" value={total} />
          <Stat
            icon={<TrendingUp />}
            label="Highest Coverage"
            value={questions[0]?.count || 0}
          />
          <Stat icon={<BarChart3 />} label="Companies Tracked" value="100+" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= QUESTION LIST ================= */}
          <div className="lg:col-span-2 bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-10 flex items-center justify-center gap-3 text-[#E1D3CC]">
                <Loader2 className="animate-spin" />
                Fetching insights…
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5">
                  {questions.map((q, idx) => (
                    <div
                      key={q.title}
                      className="p-4 hover:bg-white/5 cursor-pointer transition group"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-2">
                          <div className="font-medium text-[#E1D4C1] group-hover:underline">
                            <button onClick={() => fetchDetails(q.title)} className="text-left w-full">{q.title}</button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-[#E1D3CC]">
                              Appears across <span className="text-[#E1D4C1] font-medium">{q.count}</span> companies
                            </div>
                            <div className="ml-2 flex items-center gap-2">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                                  const link = q.link || `https://leetcode.com/problems/${q.title.toLowerCase().replace(/\s+/g,'-')}`;
                                  if (busyQuestion) return;
                                  setBusyQuestion(link);
                                  const willSolve = !solvedSet.has(link);
                                  setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.add(link); else n.delete(link); return n; });
                                  try {
                                    const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleSolved' }), credentials: 'include' });
                                    const j = await res.json().catch(()=>({}));
                                    if (!res.ok) {
                                      setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; });
                                      alert(j?.error || 'Failed to update solved status');
                                    } else {
                                      setSolvedSet(new Set(j.solvedProblems || []));
                                      setReviewSet(new Set(j.reviewProblems || []));
                                    }
                                  } catch (err) {
                                    setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; });
                                    alert('Network error');
                                  } finally { setBusyQuestion(null); }
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition ${solvedSet.has(q.link || '') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{solvedSet.has(q.link || '') ? 'Solved' : 'Mark solved'}</span>
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                                  const link = q.link || `https://leetcode.com/problems/${q.title.toLowerCase().replace(/\s+/g,'-')}`;
                                  if (busyQuestion) return;
                                  setBusyQuestion(link);
                                  const willMark = !reviewSet.has(link);
                                  setReviewSet(prev => { const n = new Set(prev); if (willMark) n.add(link); else n.delete(link); return n; });
                                  try {
                                    const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleReview' }), credentials: 'include' });
                                    const j = await res.json().catch(()=>({}));
                                    if (!res.ok) {
                                      setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; });
                                      alert(j?.error || 'Failed to update review status');
                                    } else {
                                      setReviewSet(new Set(j.reviewProblems || []));
                                      setSolvedSet(new Set(j.solvedProblems || []));
                                    }
                                  } catch (err) {
                                    setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; });
                                    alert('Network error');
                                  } finally { setBusyQuestion(null); }
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition ${reviewSet.has(q.link || '') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                              >
                                <Flag className="w-4 h-4" />
                                <span>{reviewSet.has(q.link || '') ? 'For review' : 'Mark review'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs px-2 py-1 rounded-full bg-[#7E102C]/20 text-[#E1D4C1]">
                          Rank #{idx + 1 + (page - 1) * perPage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-white/5">
                  <div className="text-xs text-[#E1D3CC]">
                    Showing {(page - 1) * perPage + 1} –{" "}
                    {Math.min(page * perPage, total)} of {total}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-lg bg-white/5 text-sm disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      disabled={page * perPage >= total}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 rounded-lg bg-white/5 text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#E1D4C1] mb-1">
                Most Repeated Questions
              </h3>
              <p className="text-xs text-[#E1D3CC] mb-4">
                Based on company-wise occurrence data
              </p>
              <Chart data={chartData} />
            </div>

            {selected && (
              <div className="border-t border-white/5 pt-4">
                <h4 className="font-semibold text-[#E1D4C1] mb-2">
                  {selected.title}
                </h4>

                {detailsLoading ? (
                  <div className="text-sm text-[#E1D3CC]">
                    <Loader2 className="animate-spin inline-block mr-2" />
                    Loading breakdown…
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto">
                    {selected.occurrences?.map((o: any, i: number) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <a
                          className="text-[#E1D4C1] hover:underline"
                          href={o.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {o.company}
                        </a>
                        <ExternalLink className="w-4 h-4 text-[#E1D3CC]" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Stat Card ------------------ */
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-[#7E102C]/20 text-[#E1D4C1]">
        {icon}
      </div>
      <div>
        <div className="text-sm text-[#E1D3CC]">{label}</div>
        <div className="text-xl font-bold text-[#E1D4C1]">{value}</div>
      </div>
    </div>
  );
}
