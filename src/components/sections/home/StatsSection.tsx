"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, Mic, FileText, Award, Map } from "lucide-react";
import { useStats } from "@/context/DataCacheContext";

export default function StatsSection() {
  const { stats, isLoading } = useStats();

  const statItems = [
    {
      icon: Users,
      value: isLoading ? "—" : (stats?.activeUsers ?? 0),
      label: "Active Users",
      color: "text-[#D4AF37]"
    },
    {
      icon: Mic,
      value: isLoading ? "—" : (stats?.totalInterviews ?? 0),
      label: "Interviews Taken",
      color: "text-[#50C878]"
    },
    {
      icon: FileText,
      value: isLoading ? "—" : (stats?.publishedBlogs ?? 0),
      label: "Blogs Published",
      color: "text-[#D4AF37]"
    },
    {
      icon: Map,
      value: isLoading ? "—" : (stats?.availableRoadmaps ?? 0),
      label: "Roadmaps",
      color: "text-[#50C878]"
    },
    {
      icon: Award,
      value: isLoading ? "—" : (stats?.certificatesEarned ?? 0),
      label: "Certificates",
      color: "text-[#D4AF37]"
    },
  ];

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 bg-[#36454F]/50 backdrop-blur-sm border border-[#D4AF37]/20 rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#50C878]/5 pointer-events-none" />

          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
                <span className="text-2xl sm:text-3xl font-bold text-[#FFFFF0] mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-[#FAF9F6]/70">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
