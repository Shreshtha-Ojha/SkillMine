"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, Trophy, BookOpen } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Choose a Roadmap",
    description: "Pick from 20+ structured learning paths",
  },
  {
    icon: CheckCircle,
    title: "Complete Topics",
    description: "Mark topics as you learn and progress",
  },
  {
    icon: Sparkles,
    title: "Practice Interviews",
    description: "Get AI feedback on your answers",
  },
  {
    icon: Trophy,
    title: "Earn Certificate",
    description: "Get recognized for your achievement",
  },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <section className="w-full py-24 px-4 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#E1D4C1] mb-4">
            How It Works
          </h2>
          <p className="text-[#E1D3CC] text-lg">
            Four simple steps to accelerate your career
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line - Desktop */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-[#E1D4C1]/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Number */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-[#E1D4C1]" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#7E102C] text-[#E1D4C1] text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-[#E1D4C1] font-semibold mb-2">{step.title}</h3>
                <p className="text-[#E1D3CC] text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={() => router.push("/explore")}
            className="px-8 py-4 bg-[#7E102C] text-[#E1D4C1] font-medium rounded-xl hover:bg-[#6a0f27] transition-all shadow-lg shadow-black/25"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </section>
  );
}
