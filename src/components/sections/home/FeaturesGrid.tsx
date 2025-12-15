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
    color: "#E1D4C1",
  },
  {
    icon: Mic,
    title: "AI Interview",
    description: "Practice with real-time AI feedback",
    link: "/interview",
    color: "#D7A9A8",
  },
  {
    icon: BarChart3,
    title: "Salary Data",
    description: "Compensation insights from top companies",
    link: "/placement-data",
    color: "#E1D4C1",
  },
  {
    icon: PenLine,
    title: "Blog Platform",
    description: "Write and publish technical content",
    link: "/blogs",
    color: "#D7A9A8",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn credentials for completed roadmaps",
    link: "/profile",
    color: "#E1D4C1",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create ATS-friendly resumes easily",
    link: "/resume-builder",
    color: "#E1D4C1",
  },
  {
    icon: Brain,
    title: "ATS Checker",
    description: "One free check per user — fast ATS + recruiter-style review",
    link: "/ats-checker",
    color: "#D7A9A8",
  },
  {
    icon: ClipboardList,
    title: "Skill Test",
    description: "Assess your skills with real-world coding tests",
    link: "/skill-tests",
    color: "#E1D4C1",
  },
  {
    icon: Users,
    title: "Interview Experiences",
    description: "Read and share real interview stories",
    link: "/interview-experiences",
    color: "#E1D4C1",
  },
];

export default function FeaturesGrid() {
  const router = useRouter();
  const user = useCurrentUser();

  return (
    <section className="w-full py-24 px-4 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E1D4C1] mb-4">
            Everything You Need
          </h2>
          <p className="text-[#E1D4C1]/80 text-lg max-w-2xl mx-auto">
            A complete platform for learning, practicing, and advancing your tech career
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => router.push(feature.link)}
              className="group relative p-6 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl text-left hover:border-[#7E102C]/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 mb-4 rounded-xl bg-[#E1D4C1] p-0.5`}>
                <div className="w-full h-full bg-[#7E102C] rounded-[10px] flex items-center justify-center">
                  <feature.icon className={`w-6 h-6 [&>*]:stroke-white`} style={{ color: '#E1D4C1' }} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#E1D4C1] mb-2 group-hover:text-[#D7A9A8] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[#E1D3CC] text-sm mb-4">{feature.description}</p>

              {/* Arrow */}
              <div className="flex items-center gap-1 text-sm text-[#E1D3CC] group-hover:text-[#E1D4C1] transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
          {/* CTA Card: Only show if not logged in */}
          {user === null && (
            <div className="p-6 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-2xl flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-[#E1D4C1] mb-2">Ready to start?</h3>
              <p className="text-[#E1D3CC] text-sm mb-4">Begin your journey today—it's free.</p>
              <button
                onClick={() => router.push("/auth/signup")}
                className="w-fit px-4 py-2 bg-[#7E102C] text-[#E1D4C1] text-sm font-medium rounded-lg hover:bg-[#6a0f27] transition-all"
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
