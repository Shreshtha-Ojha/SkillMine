"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function PracticePage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await fetch("/api/skills");
        if (s.ok) {
          const j = await s.json();
          const nonZero = (j.skills || []).filter(
            (sk: any) => sk.questionCount && sk.questionCount > 0
          );
          setSkills(nonZero);
          setFilteredSkills(nonZero);
        }
      } catch {}

      try {
        const r = await fetch("/api/roadmap/fetchall");
        if (r.ok) {
          const j = await r.json();
          setRoadmaps(j.roadmaps || []);
        }
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!query) return setFilteredSkills(skills);
    setFilteredSkills(
      skills.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, skills]);

  // All skills are now free - paywall removed

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================= TOP BAR ================= */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#E1D3CC] hover:text-[#E1D4C1]"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1D3CC]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills"
              className="pl-10 pr-4 py-2 w-full bg-[#111118] border border-white/10 rounded-xl text-[#E1D4C1] placeholder:text-[#E1D3CC] focus:outline-none focus:ring-2 focus:ring-[#7E102C]/40"
            />
          </div>
        </div>

        {/* ================= HEADER ================= */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#E1D4C1] flex items-center gap-2">
            Practice Arena <Sparkles className="w-6 h-6 text-[#7E102C]" />
          </h1>
          <p className="text-sm text-[#E1D3CC] mt-1 max-w-2xl">
            Strengthen concepts with real-time MCQs and roadmap-based tests —
            designed to mirror real interview pressure.
          </p>
        </div>

        {/* ================= SKILLS ================= */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#E1D4C1] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Skill-wise Practice
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredSkills.map((sk) => (
              <div
                key={sk._id}
                className="group p-5 bg-[#111118] border border-white/5 rounded-2xl flex flex-col hover:border-[#7E102C]/40 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-[#E1D4C1]">
                      {sk.title}
                    </h3>
                    <p className="text-xs text-[#E1D3CC] mt-1">
                      {sk.questionCount} practice questions
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
                    Free
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <Link
                    href={`/practice/skill/${sk._id}`}
                    className="px-4 py-2 bg-[#7E102C] text-[#E1D4C1] rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Start Practice
                  </Link>
                  <Link
                    href={`/skill-tests?skill=${sk.key}`}
                    className="text-sm text-[#E1D3CC] hover:text-[#E1D4C1]"
                  >
                    Create Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ROADMAP TESTS ================= */}
        <section>
          <h2 className="text-lg font-semibold text-[#E1D4C1] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Roadmap-Based Tests
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {roadmaps.map((r) => (
              <div
                key={r._id}
                className="group p-5 bg-[#111118] border border-white/5 rounded-2xl flex flex-col hover:border-[#7E102C]/40 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-[#E1D4C1]">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[#E1D3CC] mt-1 line-clamp-2">
                      {r.shortDescription || "Structured assessment test"}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
                    Free
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <Link
                    href={`/roadmap-test?roadmapId=${r._id}`}
                    className="px-4 py-2 bg-[#7E102C] text-[#E1D4C1] rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Open Test
                  </Link>
                  <Link
                    href={`/explore/roadmap/${r._id}`}
                    className="text-sm text-[#E1D3CC] hover:text-[#E1D4C1]"
                  >
                    View Roadmap
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
