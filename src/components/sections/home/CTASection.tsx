"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="w-full py-24 px-4 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl overflow-hidden bg-[#0a0a0f] border border-[#7E102C]/20"
        >
          {/* Background subtle tints */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,212,193,0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[#000000]/20 backdrop-blur-sm" />
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#E1D4C1]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D7A9A8]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E1D4C1]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#E1D4C1]" />
              <span className="text-sm text-[#E1D3CC]">100% Free Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E1D4C1] mb-4">
              Ready to Level Up?
            </h2>
            <p className="text-[#E1D3CC] text-lg max-w-xl mx-auto mb-8">
              Join thousands of developers who are already using PrepSutra to ace their interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/auth/signup")}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-[#7E102C] text-[#E1D4C1] font-semibold rounded-xl hover:bg-[#6a0f27] transition-all shadow-lg shadow-black/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/explore")}
                className="w-full sm:w-auto px-8 py-4 bg-[#E1D4C1]/6 text-[#E1D4C1] font-medium rounded-xl border border-[#E1D4C1]/10 hover:bg-[#E1D4C1]/8 transition-all"
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
