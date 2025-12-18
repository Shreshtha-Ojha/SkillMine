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
className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E1D4C1]/10 border border-[#E1D4C1]/20 mb-6"
            >
            <Flame className="w-4 h-4 text-[#E1D4C1]" />
            <span className="text-[#E1D4C1] text-sm font-medium">Limited Time Offers</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[#E1D4C1]">Premium </span>
            <span className="text-[#D7A9A8]">
              Deals
            </span>
          </h2>
          
          <p className="text-[#E1D4C1]/80 text-lg md:text-xl max-w-2xl mx-auto">
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
              className={`relative group rounded-3xl theme-card theme-card--vintage border border-[#7E102C]/14 p-6 lg:p-8 overflow-hidden`}   
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-[#E1D4C1]/6 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500`} />
              
              {/* Popular Badge */}
              {deal.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 z-20"
                >
                  <div className="bg-[#E1D4C1] text-[#7E102C] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-black/20">
                    <Star className="w-3 h-3 fill-current" />
                    POPULAR
                  </div> 
                </motion.div>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#E1D4C1] p-3 mb-6 shadow-lg">
                  <deal.icon className="w-full h-full text-[#7E102C]" />
                </div> 

                {/* Title */}
                <h3 className="text-xl font-bold text-[#E1D4C1] mb-1">{deal.title}</h3>
                <p className="text-[#E1D3CC] text-sm mb-6">{deal.subtitle}</p>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-6">
                  {deal.price != null ? (
                    (() => {
                      const original = computeOriginalPrice(deal.price) ?? deal.originalPrice ?? null;
                      const percent = computeDiscountPercent(deal.price, original);
                      return (
                        <>
                          <span className="text-3xl font-bold text-[#E1D4C1]">₹{deal.price}</span>
                          {original ? <span className="text-[#E1D3CC] line-through text-sm">₹{original}</span> : null}
                          <span className="text-[#D7A9A8] text-xs font-medium bg-[#D7A9A8]/10 px-2 py-1 rounded-full">
                            {percent != null ? `${percent}% OFF` : '—'}
                          </span>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-[#E1D4C1]">TBD</span>
                      <span className="text-[#D7A9A8] text-xs font-medium bg-[#D7A9A8]/10 px-2 py-1 rounded-full">—</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {deal.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#7E102C] mt-0.5 flex-shrink-0" />
                      <span className="text-[#E1D4C1] text-sm">{feature}</span>
                    </div>
                  ))}
                </div> 

                {/* CTA Button */}
                {deal.id === 'skill-tests' && deal.price == null ? (
                  <button className="w-full py-3 px-4 rounded-xl bg-white/5 text-[#E1D3CC] font-semibold" disabled>Price not set</button>
                ) : deal.id === 'premium' && user?.purchases?.premium?.purchased ? (
                  <a href={deal.link} className={`w-full py-3 px-4 rounded-xl bg-white/5 text-[#E1D3CC] font-semibold flex items-center justify-center gap-2`}>
                    You're Premium — Explore
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={deal.link}
                    className={`w-full py-3 px-4 rounded-xl bg-[#7E102C] text-[#E1D4C1] font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 hover:opacity-90`} 
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
              className="text-center p-4 md:p-6 rounded-2xl theme-card theme-card--vintage border border-[#7E102C]/14"
            >
              <stat.icon className="w-6 h-6 text-[#E1D4C1] mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-[#E1D4C1] mb-1">{stat.value}</div>
              <div className="text-[#E1D3CC] text-sm">{stat.label}</div>
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
          <div className="flex items-center gap-2 text-[#E1D3CC]">
            <Zap className="w-5 h-5 text-[#D7A9A8]" />
            <span className="text-sm">Instant Access</span>
          </div>
          <div className="flex items-center gap-2 text-[#E1D3CC]">
            <Crown className="w-5 h-5 text-[#E1D4C1]" />
            <span className="text-sm">Lifetime Updates</span>
          </div>
          <div className="flex items-center gap-2 text-[#E1D3CC]">
            <Sparkles className="w-5 h-5 text-[#E1D4C1]" />
            <span className="text-sm">Premium Support</span>
          </div>
          <div className="flex items-center gap-2 text-[#E1D3CC]">
            <BadgeCheck className="w-5 h-5 text-[#7E102C]" />
            <span className="text-sm">Secure Payment</span>
          </div>

          {/* Social / Tools links (GitHub, LinkedIn, Codeforces Wrap) */}
          <div className="flex items-center gap-3 mt-2">
            <a href={process.env.NEXT_PUBLIC_GITHUB_URL || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#E1D3CC] hover:text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.09 3.29 9.41 7.86 10.94.57.11.78-.25.78-.55 0-.27-.01-1.02-.01-1.99-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.98 10.98 0 012.87-.39c.97.01 1.95.13 2.87.39 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.71 5.39-5.29 5.67.41.36.77 1.08.77 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.2.67.79.55A11.53 11.53 0 0023.5 12C23.5 5.74 18.27.5 12 .5z" />
              </svg>
              <span className="text-sm">GitHub</span>
            </a>
            <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#E1D3CC] hover:text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6 1.12 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.88 1 4.98 2.12 4.98 3.5zM.22 8.98H4.78V24H.22zM8.98 8.98H13.4V11.2H13.5C14.2 9.7 16.1 8.98 18 8.98 22 8.98 24 11.6 24 16.2V24H19.44V16.9C19.44 14.7 18.7 13.4 16.9 13.4 15.5 13.4 14.6 14.4 14.2 15.3 14 16 13.9 17.2 13.9 18.5V24H9.36z"/></svg>
              <span className="text-sm">LinkedIn</span>
            </a>
            <a href={process.env.NEXT_PUBLIC_CODEFORCES_URL || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#E1D3CC] hover:text-white">
              <Code className="w-5 h-5" />
              <span className="text-sm">Codeforces</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
