"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, Mic, FileText, Award, Map, TrendingUp } from "lucide-react";
import { useStats } from "@/context/DataCacheContext";

export default function StatsSection() {
  const { stats, isLoading } = useStats();

  const statItems = [
    { 
      icon: Users, 
      value: stats?.activeUsers || "1K+", 
      label: "Active Users",
      color: "text-[#E1D4C1]"
    },
    { 
      icon: Mic, 
      value: stats?.totalInterviews || "5K+", 
      label: "Interviews Taken",
      color: "text-[#D7A9A8]"
    },
    { 
      icon: FileText, 
      value: stats?.publishedBlogs || "500+", 
      label: "Blogs Published",
      color: "text-[#7E102C]"
    },
    { 
      icon: Map, 
      value: stats?.availableRoadmaps || "20+", 
      label: "Roadmaps",
      color: "text-[#E1D3CC]"
    },
    { 
      icon: Award, 
      value: stats?.certificatesEarned || "2K+", 
      label: "Certificates",
      color: "text-[#D7A9A8]"
    },
    { 
      icon: TrendingUp, 
      value: "95%", 
      label: "Success Rate",
      color: "text-[#D7A9A8]"
    },
  ];

  return (
    <section className="w-full py-16 px-4 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 theme-card theme-card--vintage border border-[#7E102C]/14 rounded-3xl overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-[#E1D4C1]/5 pointer-events-none" />

          {/* Stats Grid */}
          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <span className="text-2xl sm:text-3xl font-bold text-[#E1D4C1] mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-[#E1D3CC]">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
