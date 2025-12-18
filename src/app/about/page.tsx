"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Map,
  Youtube,
  FileText,
  Shield,
  Award,
  Clock,
  HelpCircle,
  Mic,
  Trophy,
  Code,
  BookOpen,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileSearch,
  GitBranch,
  Users,
  Briefcase,
  Star,
  TrendingUp,
} from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  // Main platform features - Flowchart
  const platformFeatures = [
    {
      category: "Learning & Growth",
      color: "from-[#7E102C] to-[#D7A9A8]",
      borderColor: "border-[#7E102C]/30",
      bgColor: "bg-[#7E102C]/10",
      items: [
        {
          icon: Map,
          title: "Roadmaps",
          description: "Curated learning paths with YouTube tutorials",
          link: "/explore",
        },

        {
          icon: Award,
          title: "Certifications",
          description: "Earn certificates after completing roadmaps",
          link: "/explore",
        },
      ],
    },
    {
      category: "Interview Prep",
      color: "from-[#7E102C] to-[#D7A9A8]",
      borderColor: "border-[#7E102C]/30",
      bgColor: "bg-[#7E102C]/10",
      items: [
        {
          icon: Mic,
          title: "AI Mock Interviews",
          description: "Practice with AI-powered feedback",
          link: "/interview",
        },
        {
          icon: Trophy,
          title: "Coding Arena",
          description: "Compete in coding challenges with leaderboards",
          link: "/top-interviews",
        },
        {
          icon: Briefcase,
          title: "Company Problems",
          description: "450+ company-specific DSA questions",
          link: "/company-problems",
        },
      ],
    },
    {
      category: "Career Tools",
      color: "from-[#7E102C] to-[#D7A9A8]",
      borderColor: "border-[#7E102C]/30",
      bgColor: "bg-[#7E102C]/10",
      items: [
        {
          icon: FileText,
          title: "Resume Builder",
          description: "Create ATS-friendly professional resumes",
          link: "/resume-builder",
        },
        {
          icon: FileSearch,
          title: "ATS Checker",
          description: "Get AI feedback on your resume",
          link: "/ats-checker",
        },
        {
          icon: TrendingUp,
          title: "Placement Data",
          description: "Real compensation insights from top companies",
          link: "/placement-data",
        },
      ],
    },
    {
      category: "Developer Stats",
      color: "from-[#7E102C] to-[#D7A9A8]",
      borderColor: "border-[#7E102C]/30",
      bgColor: "bg-[#7E102C]/10",
      items: [
        {
          icon: GitBranch,
          title: "GitHub Wrapped",
          description: "Visualize your GitHub journey with AI insights",
          link: "/github-wrapped",
        },
        {
          icon: Code,
          title: "Codeforces Wrapped",
          description: "Track your competitive programming stats",
          link: "/codeforces-wrapped",
        },
        {
          icon: Target,
          title: "LeetCode Wrapped",
          description: "Analyze your problem-solving journey",
          link: "/leetcode-wrapped",
        },
      ],
    },
  ];

  // User journey steps
  const journeySteps = [
    {
      step: 1,
      icon: Map,
      title: "Follow Roadmaps",
      description: "Start with curated learning paths to acquire skills.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/explore",
    },
    {
      step: 2,
      icon: CheckCircle,
      title: "Skill Tests",
      description: "Assess your skills with real-world coding tests.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/skill-tests",
    },
    {
      step: 3,
      icon: Award,
      title: "Earn Certificates",
      description: "Complete roadmaps and score 60% or more to get certified.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/explore",
    },
    {
      step: 4,
      icon: Users,
      title: "Interview Experiences",
      description: "Read and share real interview stories to prepare better.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/interview-experiences",
    },
    {
      step: 5,
      icon: FileText,
      title: "Resume Builder",
      description: "Create ATS-friendly resumes and improve your chances.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/resume-builder",
    },
    {
      step: 6,
      icon: FileSearch,
      title: "ATS Checker",
      description: "Get AI feedback on your resume to make it better.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/ats-checker",
    },
    {
      step: 7,
      icon: Mic,
      title: "Mock Interviews",
      description: "Practice with AI-powered mock interviews to gain confidence.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/interview",
    },
    {
      step: 8,
      icon: Briefcase,
      title: "Company Problems",
      description: "Solve premium problems to prepare for top companies.",
      color: "from-[#7E102C] to-[#D7A9A8]",
      link: "/company-problems",
    },
  ];

  // Premium features
  const premiumFeatures = [
    {
      icon: Briefcase,
      title: "450+ Company Questions",
      description: "OA questions from Google, Amazon, Meta, and more",
      price: "₹10",
      originalPrice: "₹99",
      link: "/company-problems",
      highlight: true,
    },
    {
      icon: Mic,
      title: "Unlimited Mock Interviews",
      description: "Premium subscription for unlimited AI interviews",
      price: "₹99/month",
      link: "/interview",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7E102C]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7E102C]/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#7E102C]/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#E1D4C1] hover:text-[#D7A9A8] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7E102C]/10 to-[#D7A9A8]/10 border border-white/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#7E102C]" />
            <span className="text-sm text-[#E1D4C1]/90">All Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#E1D4C1] mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-[#7E102C] via-[#D7A9A8] to-[#E1D4C1] bg-clip-text text-transparent">
              Ace Your Tech Career
            </span>
          </h1>
          <p className="text-[#E1D4C1]/80 text-lg max-w-2xl mx-auto">
            A complete platform for learning, practicing, and showcasing your
            skills — mostly free, with premium add-ons.
          </p>
        </motion.section>

        {/* User Journey Flow */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#E1D4C1] mb-4">
              Your Learning Journey
            </h2>
            <p className="text-[#E1D4C1]/80">
              From signup to certification in 5 simple steps
            </p>
          </motion.div>

          {/* Desktop Flow */}
          <div className="hidden lg:block relative">
            <div className="flex justify-between items-start">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center w-1/5 relative cursor-pointer"
                  onClick={() => router.push(step.link)}
                >
                  {/* Step Number */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-[#E1D4C1]" />
                  </div>

                  {/* Connector Arrow */}
                  {index < journeySteps.length - 1 && (
                    <div className="absolute top-8 left-[60%] w-[80%] flex items-center">
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-white/30 to-white/10" />
                      <ArrowRight className="w-5 h-5 text-[#E1D4C1]/30" />
                    </div>
                  )}

                  <div className="text-xs text-[#E1D3CC] mb-1">
                    Step {step.step}
                  </div>
                  <h4 className="text-[#E1D4C1] font-semibold mb-1">
                    {step.title}
                  </h4>
                  <p className="text-[#E1D3CC] text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-4">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                  >
                    <step.icon className="w-6 h-6 text-[#E1D4C1]" />
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-white/30 to-transparent mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="text-xs text-[#E1D3CC] mb-1">
                    Step {step.step}
                  </div>
                  <h4 className="text-[#E1D4C1] font-semibold">{step.title}</h4>
                  <p className="text-[#E1D3CC] text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Features Flowchart */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#E1D4C1] mb-4">
              Platform Features
            </h2>
            <p className="text-[#E1D4C1]/80">
              Explore all the tools available to accelerate your growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {platformFeatures.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
                className={`p-6 rounded-3xl border ${category.borderColor} ${category.bgColor}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                  >
                    <Zap className="w-5 h-5 text-[#E1D4C1]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#E1D4C1]">
                    {category.category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                      onClick={() => router.push(item.link)}
                      className="flex items-start gap-4 p-4 bg-[#0a0a0f]/50 rounded-xl border border-white/5 hover:border-white/20 cursor-pointer transition-all group"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} p-0.5 flex-shrink-0`}
                      >
                        <div className="w-full h-full bg-[#0a0a0f] rounded-[6px] flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-[#E1D4C1]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#E1D4C1] font-semibold mb-1 group-hover:text-[#D7A9A8] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[#E1D3CC] text-sm">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#E1D3CC] group-hover:text-[#E1D4C1] group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[#E1D4C1] mb-4">
            Ready to Start?
          </h2>
          <p className="text-[#E1D4C1]/80 mb-8">
            Begin your learning journey today — it&apos;s mostly free!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/explore")}
              className="px-8 py-4 bg-[#7E102C] text-[#E1D4C1] font-semibold rounded-xl hover:bg-[#6a0f27] transition-all"
            >
              Explore Roadmaps
            </button>
            <button
              onClick={() => router.push("/interview")}
              className="px-8 py-4 bg-[#E1D4C1]/6 text-[#E1D4C1] font-medium rounded-xl border border-[#E1D4C1]/10 hover:bg-[#E1D4C1]/8 transition-all"
            >
              Practice Interview
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
