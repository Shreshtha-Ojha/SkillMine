"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Code2, Code, Boxes, Cpu, Globe, Database, Lock, FileText, Users } from "lucide-react";

const topics = [
  { icon: Code2, label: "Company Problems", path: "/company-problems" },
  { icon: Boxes, label: "System Design", path: "/explore/roadmap/6952c8fabd516ee01ba0fa6a" },
  { icon: Cpu, label: "OS", path: "/prepare-interviews/operating-systems" },
  { icon: Globe, label: "Web Dev", path: "/explore" },
  { icon: Database, label: "DBMS", path: "/prepare-interviews" },
  { icon: Lock, label: "Security", path: "/prepare-interviews" },
  { icon: Users, label: "Interview Experiences", path: "/interview-experiences" },
  { icon: FileText, label: "ATS Checker (Testing)", path: "/ats-checker" },
  { icon: Code, label: "Skill Tests", path: "/skill-tests" },
];

export default function PrepareSection() {
  const router = useRouter();

  return (
    <section className="w-full py-24 px-4 ">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 text-xs font-medium bg-[#FAF9F6]/10 text-[#E5C76B] rounded-full mb-4"
            >
              Interview Prep
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-[#FAF9F6] mb-4"
            >
              Ace Your Next Interview
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#FFFFF0] text-lg mb-8"
            >
              Practice with AI-powered mock interviews. Get real-time feedback on your answers.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => router.push("/interview")}
                className="px-6 py-3 bg-[#D4AF37] text-[#FAF9F6] font-medium rounded-lg hover:bg-[#6a0f27] transition-all"
              >
                Start Practice
              </button>
              <button
                onClick={() => router.push("/top-interviews")}
                className="px-6 py-3 bg-[#FAF9F6]/6 text-[#FAF9F6] font-medium rounded-lg border border-[#FAF9F6]/10 hover:bg-[#FAF9F6]/8 transition-all"
              >
                Coding Arena
              </button>
            </motion.div>
          </div>

          {/* Right: Topics Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {topics.map((topic, index) => (
              <button
                key={topic.label}
                onClick={() => router.push(topic.path)}
                className="group flex flex-col items-center gap-3 p-5 theme-card theme-card--vintage border border-[#D4AF37]/14 rounded-xl hover:border-[#E5C76B]/30 transition-all"
              >
                <div className="p-3 bg-[#FAF9F6]/10 rounded-lg">
                  <topic.icon className="w-6 h-6 text-[#FAF9F6]" />
                </div>
                <span className="text-[#FAF9F6] font-medium text-sm group-hover:text-[#50C878] transition-colors">
                  {topic.label}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
