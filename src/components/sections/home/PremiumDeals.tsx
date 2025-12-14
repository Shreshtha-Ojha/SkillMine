"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  FileText,
  Code,
  Trophy,
  Star,
  TrendingUp,
  Users,
  BadgeCheck,
  Flame
} from "lucide-react";

interface Pricing {
  oaQuestions: number;
  resumeScreeningPremium: number;
  topInterviews: number;
  mockInterviews: number;
  skillTestPremium?: number | null;
}

export default function PremiumDeals() {
  const [pricing, setPricing] = useState<Pricing>({
    oaQuestions: 10,
    resumeScreeningPremium: 10,
    topInterviews: 10,
    mockInterviews: 10,
    skillTestPremium: null
  });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/pricing");
        if (res.ok) {
          const data = await res.json();
          if (data.pricing) {
            setPricing(data.pricing);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  const deals = [
    {
      id: "oa-questions",
      title: "Company Questions Pack",
      subtitle: "450+ OA Problems",
      price: pricing.oaQuestions,
      originalPrice: 99,
      icon: Code,
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      bgGlow: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
      features: [
        "450+ curated company questions",
        "Google, Amazon, Meta, Apple & more",
        "Frequency & acceptance data",
        "Lifetime access",
        "Regular updates"
      ],
      popular: true,
      link: "/company-problems"
    },
    {
      id: "skill-tests",
      title: "Skill Test Premium",
      subtitle: "Unlimited attempts & premium features",
      price: pricing.skillTestPremium ?? null,
      originalPrice: 99,
      icon: Crown,
      gradient: "from-indigo-500 via-blue-500 to-teal-400",
      bgGlow: "bg-indigo-500/20",
      borderColor: "border-indigo-500/30",
      features: [
        "Unlimited attempts for skill tests",
        "Per-question timers and one-time visit enforcement",
        "Priority support",
        "Lifetime access"
      ],
      popular: false,
      link: "/skill-tests"
    },



  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-6"
          >
            <Flame className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Limited Time Offers</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Premium </span>
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Deals
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Unlock your full potential with our premium features at unbeatable prices
          </p>
        </motion.div>

        {/* Deals Grid */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative group rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border ${deal.borderColor} p-6 lg:p-8 overflow-hidden`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 ${deal.bgGlow} opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500`} />
              
              {/* Popular Badge */}
              {deal.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 z-20"
                >
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/30">
                    <Star className="w-3 h-3 fill-current" />
                    POPULAR
                  </div>
                </motion.div>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${deal.gradient} p-3 mb-6 shadow-lg`}>
                  <deal.icon className="w-full h-full text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-1">{deal.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{deal.subtitle}</p>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-white">{deal.price != null ? `₹${deal.price}` : 'TBD'}</span>
                  <span className="text-gray-500 line-through text-sm">₹{deal.originalPrice}</span>
                  <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    {deal.price != null ? Math.round((1 - deal.price / deal.originalPrice) * 100) + '% OFF' : '—'}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {deal.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {deal.id === 'skill-tests' && deal.price == null ? (
                  <button className="w-full py-3 px-4 rounded-xl bg-white/5 text-gray-400 font-semibold" disabled>Price not set</button>
                ) : (
                  <a
                    href={deal.link}
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${deal.gradient} text-white font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 hover:opacity-90`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { icon: Users, label: "Happy Users", value: "150+" },
            { icon: Trophy, label: "Success Rate", value: "95%" },
            { icon: BadgeCheck, label: "Certifications", value: "50+" },
            { icon: TrendingUp, label: "Avg. Improvement", value: "30%" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <stat.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">Instant Access</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-sm">Lifetime Updates</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Premium Support</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BadgeCheck className="w-5 h-5 text-green-400" />
            <span className="text-sm">Secure Payment</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
