"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle2, Flag, Loader2 } from 'lucide-react';
import useCurrentUser from '@/lib/useCurrentUser';

export default function MarkedPage() {
  const user = useCurrentUser();
  const [solved, setSolved] = useState<string[]>([]);
  const [marked, setMarked] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setSolved(user?.solvedProblems || []);
    setMarked(user?.reviewProblems || []);
  }, [user]);

  const titleFromLink = (link: string) => {
    try {
      const u = new URL(link);
      const seg = u.pathname.split('/').filter(Boolean).pop() || link;
      return seg.replace(/[-_]/g, ' ').replace(/(^|\s)\S/g, (s) => s.toUpperCase());
    } catch (e) {
      const seg = link.split('/').pop() || link;
      return seg.replace(/[-_]/g, ' ').replace(/(^|\s)\S/g, (s) => s.toUpperCase());
    }
  };

  const toggle = async (link: string, action: 'toggleSolved' | 'toggleReview') => {
    if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
    if (busy) return;
    setBusy(link);

    // optimistic
    if (action === 'toggleSolved') setSolved(prev => prev.filter(s => s !== link));
    if (action === 'toggleReview') setMarked(prev => prev.filter(s => s !== link));

    try {
      const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ problemLink: link, action }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error || 'Failed to update');
        // refresh from server arrays if available
        setSolved(new Set((j.solvedProblems || user?.solvedProblems || []) as any).size ? (j.solvedProblems || user?.solvedProblems || []) as any : solved);
        setMarked(new Set((j.reviewProblems || user?.reviewProblems || []) as any).size ? (j.reviewProblems || user?.reviewProblems || []) as any : marked);
      } else {
        setSolved(j.solvedProblems || []);
        setMarked(j.reviewProblems || []);
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/company-problems" className="text-[#E1D3CC] hover:text-[#E1D4C1] flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-2xl font-bold text-[#E1D4C1] ml-2">Solved & Marked Questions</h1>
        </div>

        {!user ? (
          <div className="p-6 bg-[#111118] border border-white/5 rounded-xl text-center">
            <p className="text-[#E1D3CC] mb-4">You need to sign in to view your solved and marked questions.</p>
            <Link href="/auth/login" className="inline-block px-4 py-2 bg-yellow-400 text-black rounded-xl font-semibold">Sign in</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#E1D4C1]">Solved ({solved.length})</h2>
                <span className="text-sm text-[#E1D3CC]">Manage your solved problems</span>
              </div>

              {solved.length === 0 ? (
                <div className="p-4 bg-[#111118] border border-white/5 rounded-xl text-[#E1D3CC]">No solved questions yet.</div>
              ) : (
                <ul className="space-y-2">
                  {solved.map((link) => (
                    <li key={link} className="p-3 bg-[#111118] border border-white/5 rounded-xl flex items-center justify-between">
                      <a href={link} target="_blank" rel="noreferrer" className="text-[#E1D4C1] truncate mr-4">{titleFromLink(link)}</a>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(link, 'toggleSolved')} disabled={busy === link} className="px-3 py-1 rounded text-sm bg-red-500/10 text-red-400 font-medium">
                          {busy === link ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unsolve'}
                        </button>
                        <a href={link} target="_blank" rel="noreferrer" className="text-sm text-[#E1D3CC] px-3 py-1 rounded bg-white/5">Open <ExternalLink className="w-4 h-4 inline-block ml-1" /></a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#E1D4C1]">Marked for review ({marked.length})</h2>
                <span className="text-sm text-[#E1D3CC]">Questions to revisit</span>
              </div>

              {marked.length === 0 ? (
                <div className="p-4 bg-[#111118] border border-white/5 rounded-xl text-[#E1D3CC]">No marked questions yet.</div>
              ) : (
                <ul className="space-y-2">
                  {marked.map((link) => (
                    <li key={link} className="p-3 bg-[#111118] border border-white/5 rounded-xl flex items-center justify-between">
                      <a href={link} target="_blank" rel="noreferrer" className="text-[#E1D4C1] truncate mr-4">{titleFromLink(link)}</a>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(link, 'toggleReview')} disabled={busy === link} className="px-3 py-1 rounded text-sm bg-yellow-500/10 text-yellow-400 font-medium">
                          {busy === link ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remove'}
                        </button>
                        <a href={link} target="_blank" rel="noreferrer" className="text-sm text-[#E1D3CC] px-3 py-1 rounded bg-white/5">Open <ExternalLink className="w-4 h-4 inline-block ml-1" /></a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
