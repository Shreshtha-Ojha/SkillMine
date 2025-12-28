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
    color: "#D4AF37",
  },
  {
    icon: CheckCircle,
    title: "Complete Topics",
    description: "Mark topics as you learn and progress",
    color: "#50C878",
  },
  {
    icon: Sparkles,
    title: "Practice Interviews",
    description: "Get AI feedback on your answers",
    color: "#D4AF37",
  },
  {
    icon: Trophy,
    title: "Earn Certificate",
    description: "Get recognized for your achievement",
    color: "#50C878",
  },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <section className="w-full py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FFFFF0] mb-4">
            How It Works
          </h2>
          <p className="text-[#FAF9F6]/80 text-lg">
            Four simple steps to accelerate your career
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-[#D4AF37]/50 via-[#50C878]/50 to-[#D4AF37]/50" />

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
                <div className="relative mb-4">
                  <div 
                    className="w-20 h-20 bg-[#36454F]/60 backdrop-blur-sm border rounded-2xl flex items-center justify-center"
                    style={{ borderColor: step.color + '40' }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                  <span 
                    className="absolute -top-2 -right-2 w-6 h-6 text-[#0a0908] text-xs font-bold rounded-full flex items-center justify-center"
                    style={{ backgroundColor: step.color }}
                  >
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-[#FFFFF0] font-semibold mb-2">{step.title}</h3>
                <p className="text-[#FAF9F6]/70 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={() => router.push("/explore")}
            className="px-8 py-4 bg-[#50C878] text-[#0a0908] font-semibold rounded-xl hover:bg-[#3DA35D] transition-all shadow-lg"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </section>
  );
}
