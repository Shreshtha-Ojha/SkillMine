"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Map, Mic, BarChart3, PenLine, Award, ArrowRight, FileText, Brain, ClipboardList, Users } from "lucide-react";
import useCurrentUser from "@/lib/useCurrentUser";

const features = [
  {
    icon: Map,
    title: "Roadmaps",
    description: "Structured learning paths for every tech stack",
    link: "/explore",
    iconBg: "#D4AF37",
  },
  {
    icon: Mic,
    title: "AI Interview",
    description: "Practice with real-time AI feedback",
    link: "/interview",
    iconBg: "#50C878",
  },
  {
    icon: BarChart3,
    title: "Salary Data",
    description: "Compensation insights from top companies",
    link: "/placement-data",
    iconBg: "#D4AF37",
  },
  {
    icon: PenLine,
    title: "Blog Platform",
    description: "Write and publish technical content",
    link: "/blogs",
    iconBg: "#50C878",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn credentials for completed roadmaps",
    link: "/profile",
    iconBg: "#D4AF37",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create ATS-friendly resumes easily",
    link: "/resume-builder",
    iconBg: "#50C878",
  },
  {
    icon: Brain,
    title: "ATS Checker",
    description: "One free check per user - fast ATS + recruiter-style review",
    link: "/ats-checker",
    iconBg: "#D4AF37",
  },
  {
    icon: ClipboardList,
    title: "Skill Test",
    description: "Assess your skills with real-world coding tests",
    link: "/skill-tests",
    iconBg: "#50C878",
  },
  {
    icon: Users,
    title: "Interview Experiences",
    description: "Read and share real interview stories",
    link: "/interview-experiences",
    iconBg: "#D4AF37",
  },
];

export default function FeaturesGrid() {
  const router = useRouter();
  const user = useCurrentUser();

  return (
    <section className="w-full py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFFF0] mb-4">
            Everything You Need
          </h2>
          <p className="text-[#FAF9F6]/80 text-lg max-w-2xl mx-auto">
            A complete platform for learning, practicing, and advancing your tech career
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => router.push(feature.link)}
              className="group relative p-6 bg-[#36454F]/50 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl text-left hover:border-[#50C878]/40 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-4 rounded-xl p-0.5" style={{ backgroundColor: feature.iconBg + '30' }}>
                <div className="w-full h-full rounded-[10px] flex items-center justify-center" style={{ backgroundColor: feature.iconBg }}>
                  <feature.icon className="w-6 h-6 text-[#FFFFF0]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#FFFFF0] mb-2 group-hover:text-[#50C878] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[#FAF9F6]/70 text-sm mb-4">{feature.description}</p>

              <div className="flex items-center gap-1 text-sm text-[#D4AF37] group-hover:text-[#50C878] transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
          {user === null && (
            <div className="p-6 bg-[#36454F]/50 backdrop-blur-sm border border-[#50C878]/30 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-[#FFFFF0] mb-2">Ready to start?</h3>
              <p className="text-[#FAF9F6]/70 text-sm mb-4">Begin your journey today - it's free.</p>
              <button
                onClick={() => router.push("/auth/signup")}
                className="w-fit px-4 py-2 bg-[#50C878] text-[#0a0908] text-sm font-semibold rounded-lg hover:bg-[#3DA35D] transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
