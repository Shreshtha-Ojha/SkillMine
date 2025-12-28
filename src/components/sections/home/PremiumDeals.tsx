"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useCurrentUser from '@/lib/useCurrentUser';
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
  Flame,
  Github
} from "lucide-react";
import { computeOriginalPrice, computeDiscountPercent } from "@/lib/priceUtils";

interface Pricing {
  premium: number;
}

export default function PremiumDeals() {
  const [pricing, setPricing] = useState<Pricing>({
    premium: 249,
  });

  const user = useCurrentUser();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/pricing", { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.pricing?.premium) {
            setPricing({ premium: data.pricing.premium });
          }
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }
    };
    fetchPricing();
    // Listen for cross-tab pricing updates and re-fetch when it happens
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pricing_updated_at') {
        fetchPricing();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);  }, []);

  const deals = [
    {
      id: "free",
      title: "Free",
      subtitle: "Core features at no cost",
      price: 0,
      originalPrice: null,
      icon: Users,
      features: [
        "Limited company problems",
        "Sample skill tests",
        "Basic practice questions",
        "Community content"
      ],
      popular: false,
      link: "/explore"
    },
    {
      id: "premium",
      title: "Premium",
      subtitle: "All access — one price",
      price: pricing.premium,
      originalPrice: null,
      icon: Crown,
      features: [
        "Unlock all company problems",
        "Full skill tests & unlimited attempts",
        "Complete practice access",
        "Priority support & lifetime updates"
      ],
      popular: true,
      link: "/company-problems"
    }
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[color:var(--color-bg-dark)]/100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(225,212,193,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(215,169,168,0.06),transparent_50%)]" />
      
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
className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF9F6]/10 border border-[#FAF9F6]/20 mb-6"
            >
            <Flame className="w-4 h-4 text-[#FAF9F6]" />
            <span className="text-[#FAF9F6] text-sm font-medium">Limited Time Offers</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[#FAF9F6]">Premium </span>
            <span className="text-[#E5C76B]">
              Deals
            </span>
          </h2>
          
          <p className="text-[#FAF9F6]/80 text-lg md:text-xl max-w-2xl mx-auto">
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
              className={`relative group rounded-3xl theme-card theme-card--vintage border border-[#D4AF37]/14 p-6 lg:p-8 overflow-hidden`}   
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-[#FAF9F6]/6 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500`} />
              
              {/* Popular Badge */}
              {deal.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 z-20"
                >
                  <div className="bg-[#FAF9F6] text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-black/20">
                    <Star className="w-3 h-3 fill-current" />
                    POPULAR
                  </div> 
                </motion.div>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] p-3 mb-6 shadow-lg">
                  <deal.icon className="w-full h-full text-[#D4AF37]" />
                </div> 

                {/* Title */}
                <h3 className="text-xl font-bold text-[#FAF9F6] mb-1">{deal.title}</h3>
                <p className="text-[#FFFFF0] text-sm mb-6">{deal.subtitle}</p>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-6">
                  {deal.price != null ? (
                    (() => {
                      const original = computeOriginalPrice(deal.price) ?? deal.originalPrice ?? null;
                      const percent = computeDiscountPercent(deal.price, original);
                      return (
                        <>
                          <span className="text-3xl font-bold text-[#FAF9F6]">₹{deal.price}</span>
                          {original ? <span className="text-[#FFFFF0] line-through text-sm">₹{original}</span> : null}
                          <span className="text-[#E5C76B] text-xs font-medium bg-[#E5C76B]/10 px-2 py-1 rounded-full">
                            {percent != null ? `${percent}% OFF` : '—'}
                          </span>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-[#FAF9F6]">TBD</span>
                      <span className="text-[#E5C76B] text-xs font-medium bg-[#E5C76B]/10 px-2 py-1 rounded-full">—</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {deal.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                      <span className="text-[#FAF9F6] text-sm">{feature}</span>
                    </div>
                  ))}
                </div> 

                {/* CTA Button */}
                {deal.id === 'skill-tests' && deal.price == null ? (
                  <button className="w-full py-3 px-4 rounded-xl bg-white/5 text-[#FFFFF0] font-semibold" disabled>Price not set</button>
                ) : deal.id === 'premium' && user?.purchases?.premium?.purchased ? (
                  <a href={deal.link} className={`w-full py-3 px-4 rounded-xl bg-white/5 text-[#FFFFF0] font-semibold flex items-center justify-center gap-2`}>
                    You're Premium — Explore
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={deal.link}
                    className={`w-full py-3 px-4 rounded-xl bg-[#D4AF37] text-[#FAF9F6] font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 hover:opacity-90`} 
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
              className="text-center p-4 md:p-6 rounded-2xl theme-card theme-card--vintage border border-[#D4AF37]/14"
            >
              <stat.icon className="w-6 h-6 text-[#FAF9F6] mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-[#FAF9F6] mb-1">{stat.value}</div>
              <div className="text-[#FFFFF0] text-sm">{stat.label}</div>
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
          <div className="flex items-center gap-2 text-[#FFFFF0]">
            <Zap className="w-5 h-5 text-[#E5C76B]" />
            <span className="text-sm">Instant Access</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFFFF0]">
            <Crown className="w-5 h-5 text-[#FAF9F6]" />
            <span className="text-sm">Lifetime Updates</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFFFF0]">
            <Sparkles className="w-5 h-5 text-[#FAF9F6]" />
            <span className="text-sm">Premium Support</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFFFF0]">
            <BadgeCheck className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm">Secure Payment</span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
