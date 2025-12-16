"use client";
import { useEffect, useState, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, CheckCircle2, Loader2, X } from "lucide-react";
// Old imports - commented out for new design
// import { HeroPage } from "@/components/sections/HeroPage";
// import { IconMessage, IconUser, IconCoffee } from "@tabler/icons-react";
// import { FloatingNav } from "@/components/ui/Navbar";
// import KeyFeatures from "@/components/sections/KeyFeatures";
// import FeaturesSection from "@/components/sections/FeaturesSection";
// import PlatformOverview from "@/components/sections/PlatformOverview";
// import CompensationSection from "@/components/sections/CompensationSection";
// import InterviewPreparation from "@/components/sections/InterviewPreparation";
// import FAQ from "@/components/sections/FAQ";
// import CertificateShowcase from "@/components/sections/CertificateShowcase";

// New modern imports
import { Footer } from "@/components/sections/Footer";
import { FloatingNav } from "@/components/ui/NewNavbar";
import NewHero from "@/components/sections/home/NewHero";
import FeaturesGrid from "@/components/sections/home/FeaturesGrid";
import StatsSection from "@/components/sections/home/StatsSection";
import PrepareSection from "@/components/sections/home/PrepareSection";
import HowItWorks from "@/components/sections/home/HowItWorks";
import FAQSection from "@/components/sections/home/FAQSection";
import CTASection from "@/components/sections/home/CTASection";
import GitHubWrappedPromo from "@/components/sections/home/GitHubWrappedPromo";
import PremiumDeals from "@/components/sections/home/PremiumDeals";

import { gsap } from "gsap";
import Loading from "@/components/ui/Loading";
import Head from "next/head";
import useLocomotiveScroll from "@/hooks/useLocomotiveScroll";

// Memoized Components for better performance
// Old components - commented out
// const MemoizedHeroPage = memo(HeroPage);
// const MemoizedPlatformOverview = memo(PlatformOverview);
// const MemoizedInterviewPreparation = memo(InterviewPreparation);
// const MemoizedCompensationSection = memo(CompensationSection);
// const MemoizedFeaturesSection = memo(FeaturesSection);
// const MemoizedCertificateShowcase = memo(CertificateShowcase);
// const MemoizedFAQ = memo(FAQ);

// New modern components - memoized
const MemoizedNewHero = memo(NewHero);
const MemoizedStatsSection = memo(StatsSection);
const MemoizedFeaturesGrid = memo(FeaturesGrid);
const MemoizedPrepareSection = memo(PrepareSection);
const MemoizedHowItWorks = memo(HowItWorks);
const MemoizedFAQSection = memo(FAQSection);
const MemoizedCTASection = memo(CTASection);
const MemoizedGitHubWrappedPromo = memo(GitHubWrappedPromo);
const MemoizedPremiumDeals = memo(PremiumDeals);
const MemoizedFooter = memo(Footer);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [oaPrice, setOaPrice] = useState<number>(10);

  // Fetch dynamic pricing
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/pricing");
        if (res.ok) {
          const data = await res.json();
          if (data.pricing?.oaQuestions) {
            setOaPrice(data.pricing.oaQuestions);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  // Check if user should see purchase modal on first visit
  useEffect(() => {
    const checkAndShowModal = async () => {
      // Check if modal was already shown in this session
      const modalShown = sessionStorage.getItem("homeOaModalShown");
      if (modalShown) return;

      // Check if user has already purchased
      try {
        const response = await fetch("/api/payment/oa-questions");
        if (response.ok) {
          const data = await response.json();
          if (data.purchased) return; // User already purchased, don't show modal
        }
      } catch (err) {
        // If error checking, still show modal
      }

      // Show modal after a short delay
      setTimeout(() => {
        setShowPurchaseModal(true);
        sessionStorage.setItem("homeOaModalShown", "true");
      }, 3000); // Show after 3 seconds
    };

    if (!loading) {
      checkAndShowModal();
    }
  }, [loading]);

  // Handle payment
  const handlePurchase = async () => {
    setProcessingPayment(true);
    setShowPurchaseModal(false);

    try {
      const response = await fetch("/api/payment/create-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
        console.warn('Payment create-request failed', response.status, data);
        const errMsg = typeof data?.error === 'object' ? (data?.error?.message || JSON.stringify(data.error)) : data?.error;
        if (data?.code === 'ALREADY_PURCHASED') {
          alert(errMsg || 'You already own this product.');
          // optional: redirect to content
          window.location.href = '/company-problems';
          return;
        }
        alert(errMsg || "Failed to create payment request. Please try again.");
        setProcessingPayment(false);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Payment URL not received. Please try again.");
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Purchase Modal Component
  const PurchaseModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setShowPurchaseModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0f] border border-[#7E102C]/20 rounded-2xl p-8 max-w-lg w-full relative"
      >
        {/* Close button */}
        <button
          onClick={() => setShowPurchaseModal(false)}
          className="absolute top-4 right-4 p-2 text-[#E1D4C1] hover:text-[#D7A9A8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#E1D4C1]/20 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-[#7E102C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E1D4C1] mb-3">
            🎉 Special Offer: 450+ Company Questions
          </h2>
          <p className="text-[#E1D4C1]/80 mb-6">
            Get access to curated LeetCode problems from 450+ top companies including Google, Amazon, Meta, Apple, Netflix, and many more!
          </p>

          <div className="bg-[#E1D3CC]/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#E1D3CC]">One-time Payment</span>
              <div className="flex items-center gap-2">
                    <span className="text-[#E1D3CC] line-through text-sm">{`₹${oaPrice > 0 ? oaPrice + 100 : 99}`}</span>
                    <span className="text-2xl font-bold text-[#E1D4C1]">₹{oaPrice}</span>
                  </div>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-[#E1D4C1]">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Lifetime access to all company questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#E1D4C1]">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Regular updates with new problems</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#E1D4C1]">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Frequency & acceptance data</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={processingPayment}
            className="w-full py-4 bg-[#7E102C] text-[#E1D4C1] font-bold rounded-xl hover:bg-[#6a0f27] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="mr-2">Pay ₹{oaPrice} & Unlock Now</span>
                <span className="text-xs text-gray-300 line-through">₹{oaPrice > 0 ? oaPrice + 100 : ''}</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowPurchaseModal(false)}
            className="mt-4 text-[#E1D4C1] hover:text-[#D7A9A8] text-sm transition"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Memoized nav items - simplified for new navbar
  const navItems = useMemo(() => [
    { name: "About", link: "/about" },
    { name: "Roadmaps", link: "/explore" },
    { name: "Top Questions", link: "/company-problems", premium: true },
    { name: "Skill Tests", link: "/skill-tests", premium: true },
    { name: "ATS Lab", link: "/ats-checker" },
    {
      name: "Tools",
      dropdown: [
        { name: "Resume Builder", link: "/resume-builder" },
        { name: "Resume Screening", link: "/resume-screening/bulk" },
        { name: "Mock Interviews", link: "/interview" },
        { name: "Coding Arena", link: "/top-interviews" },
        { name: "Compensation Data", link: "/placement-data" },
      ],
    },
    {
      name: "Interview Prep",
      dropdown: [
        { name: "Blogs", link: "/blogs" },
        { name: "Core CS Notes", link: "/about" },
        { name: "Interview Experiences", link: "/interview-experiences" },
      ],
    },
  ], []);

  // Memoized loading effect callback
  const handleLoadingEffect = useCallback(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setLoading(true);
      localStorage.setItem("hasVisited", "true");
      const timer = setTimeout(() => setLoading(false), 1500); // Reduced from 2000ms
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return handleLoadingEffect();
  }, [handleLoadingEffect]);

  // Simplified GSAP animation - reduced intensity
  useEffect(() => {
    const coffeeBtn = document.querySelector(".coffee-btn");
    if (coffeeBtn) {
      gsap.fromTo(
        coffeeBtn,
        { scale: 1 },
        {
          scale: 1.05, // Reduced from 1.1
          duration: 2, // Increased duration for smoother animation
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        }
      );
    }
  }, [loading]); // Only run after loading is complete


  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && <PurchaseModal />}
      </AnimatePresence>

      {/* Processing Payment Overlay */}
      <AnimatePresence>
        {processingPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#E1D4C1] animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Redirecting to payment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Loading />
      ) : (
        <div className="relative bg-[#0a0a0f] overflow-x-hidden min-h-screen" data-scroll-container>
          {/* Navigation */}
          <FloatingNav navItems={navItems} />
          
          {/* Main Content */}
          <main className="relative z-10 flex flex-col pt-20 pb-0">
            {/* New Modern Sections */}
            <MemoizedNewHero />
            <MemoizedStatsSection />
            <MemoizedPremiumDeals />
            <MemoizedFeaturesGrid />
            <MemoizedGitHubWrappedPromo />
            <MemoizedPrepareSection />
            <MemoizedHowItWorks />
            <MemoizedFAQSection />
            <MemoizedCTASection />
            <MemoizedFooter />

            {/* Old Sections - Commented Out
            <MemoizedHeroPage />
            <MemoizedPlatformOverview />
            <MemoizedInterviewPreparation />
            <MemoizedCompensationSection />
            <MemoizedFeaturesSection />
            <MemoizedCertificateShowcase />
            <MemoizedFAQ />
            */}
          </main>
        </div>
      )}
    </>
  );
}
