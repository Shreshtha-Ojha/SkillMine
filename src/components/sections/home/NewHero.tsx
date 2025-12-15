"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useStats } from "@/context/DataCacheContext";
import { ArrowRight, Sparkles, Play } from "lucide-react";

export default function NewHero() {
  const router = useRouter();
  const { stats, isLoading } = useStats();

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return `${num}`;
  };

  return (
    <section className="min-h-[90vh] w-full flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0f]">
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E1D4C1]/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D7A9A8]/15 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-full text-sm text-[#E1D4C1] mb-8">
          <Sparkles className="w-4 h-4 text-[#E1D4C1]" />
          <span>Trusted by {isLoading ? "..." : formatNumber(stats?.activeUsers || 0)} developers</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#E1D4C1] mb-6 tracking-tight leading-[1.1]">
          Build Your
          <br />
          <span className="text-[#E1D4C1]">
            Tech Career
          </span>
        </h1>

        {/* Subtitle - minimal */}
        <p className="text-lg sm:text-xl text-[#E1D4C1]/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI interviews, structured roadmaps, and career insights—everything to accelerate your developer journey.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            onClick={() => router.push("/explore")}
            className="group flex items-center gap-2 px-8 py-4 bg-[#7E102C] hover:bg-[#6a0f27] text-[#E1D4C1] font-semibold rounded-xl transition-all duration-300"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => router.push("/interview")}
            className="flex items-center gap-2 px-8 py-4 theme-card theme-card--vintage border border-[#7E102C]/14 text-[#E1D4C1] font-semibold rounded-xl transition-all"
          >
            <Play className="w-5 h-5" />
            Try AI Interview
          </button>
        </div>

      </div>
    </section>
  );
}
