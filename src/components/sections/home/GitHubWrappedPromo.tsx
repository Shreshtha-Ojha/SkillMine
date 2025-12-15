"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { IconBrandGithub, IconCode } from "@tabler/icons-react";
import { Trophy } from "lucide-react";
import Link from "next/link";

const platforms = [
  {
    name: "GitHub",
    icon: IconBrandGithub,
    href: "/github-wrapped",
    description: "Commits, repos, languages & more",
  },
  {
    name: "Codeforces",
    icon: Trophy,
    href: "/codeforces-wrapped",
    description: "Rating journey, contests & problems",
  },
  {
    name: "LeetCode",
    icon: IconCode,
    href: "/leetcode-wrapped",
    description: "Problem solving & contest stats",
  },
];

export default function GitHubWrappedPromo() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,212,193,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(215,169,168,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(225,211,204,0.03),transparent_50%)]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E1D4C1]/10 border border-[#E1D4C1]/20 rounded-full text-[#E1D4C1] text-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#E1D4C1]" />
            <span>✨ New Feature</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            <span className="text-[#E1D4C1]">
              Wrapped 2025
            </span>
          </h2>
          <p className="text-[#E1D3CC] text-lg md:text-xl max-w-2xl mx-auto">
            Discover your coding journey across platforms! Get AI-powered insights, 
            fun stats, and shareable cards.
          </p>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={platform.href}>
                <div className={`relative overflow-hidden rounded-2xl theme-card theme-card--vintage border border-[#7E102C]/14 p-6 h-full transition-all hover:scale-105 hover:shadow-xl group cursor-pointer`}>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-[#E1D4C1]/6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-[#E1D4C1] flex items-center justify-center mb-6 shadow-lg`}>
                      <platform.icon size={32} className="text-[#7E102C]" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-[#E1D4C1] mb-2">
                      {platform.name} <span className="text-[#D7A9A8]">Wrapped</span>
                    </h3>
                    <p className="text-[#E1D3CC] mb-6">
                      {platform.description}
                    </p>

                    {/* CTA */}
                    <div className={`inline-flex items-center gap-2 text-[#7E102C] font-medium group-hover:gap-3 transition-all`}>
                      <span>Generate Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
