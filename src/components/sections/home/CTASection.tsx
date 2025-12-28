"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="w-full py-24 px-4 ">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl overflow-hidden  border border-[#D4AF37]/20"
        >
          {/* Background subtle tints */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,212,193,0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[#000000]/20 backdrop-blur-sm" />
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FAF9F6]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E5C76B]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF9F6]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#FAF9F6]" />
              <span className="text-sm text-[#FFFFF0]">100% Free Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FAF9F6] mb-4">
              Ready to Level Up?
            </h2>
            <p className="text-[#FFFFF0] text-lg max-w-xl mx-auto mb-8">
              Join thousands of developers who are already using SkillMine to ace their interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/auth/signup")}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#FAF9F6] font-semibold rounded-xl hover:bg-[#6a0f27] transition-all shadow-lg shadow-black/25"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/explore")}
                className="w-full sm:w-auto px-8 py-4 bg-[#FAF9F6]/6 text-[#FAF9F6] font-medium rounded-xl border border-[#FAF9F6]/10 hover:bg-[#FAF9F6]/8 transition-all"
              >
                Explore Roadmaps
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
