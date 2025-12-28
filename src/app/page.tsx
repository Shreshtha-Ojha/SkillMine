"use client";
import { useEffect, useState, memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
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

import { gsap } from "gsap";
import Loading from "@/components/ui/Loading";
import Head from "next/head";

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
const MemoizedFooter = memo(Footer);

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Memoized nav items - simplified for new navbar
  const navItems = useMemo(() => [
    { name: "About", link: "/about" },
    { name: "Roadmaps", link: "/explore" },
    {
      name: "DSA Prep",
      dropdown: [
        { name: "Company-wise DSA", link: "/company-problems" },
        { name: "Practice", link: "/practice" },
        { name: "Skill Tests", link: "/skill-tests" },
      ],
      desktopOnlyDropdown: true,
    },
    // Mobile-only top level access so menu works on small screens
    { name: "Practice", link: "/practice", hideOnDesktop: true },
    { name: "Top Questions", link: "/company-problems", hideOnDesktop: true },
    { name: "Skill Tests", link: "/skill-tests", hideOnDesktop: true },
    { name: "ATS Lab", link: "/ats-checker" },
    {
      name: "Tools",
      dropdown: [
        { name: "Resume Builder", link: "/resume-builder" },
        { name: "Resume Screening", link: "/resume-screening/bulk" },
        { name: "Mock Interviews", link: "/interview" },
        { name: "Coding Arena", link: "/top-interviews" },
        { name: "Compensation Data", link: "/placement-data" },
        { name: "GitHub Wrapped", link: "/github-wrapped" },
        { name: "LeetCode Wrapped", link: "/leetcode-wrapped" },
        { name: "Codeforces Wrapped", link: "/codeforces-wrapped" },
      ],
    },
    {
      name: "Interview Prep",
      dropdown: [
        { name: "Blogs", link: "/blogs" },
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
      const timer = setTimeout(() => setLoading(false), 1500);
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
          scale: 1.05,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        }
      );
    }
  }, [loading]);


  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      {loading ? (
        <Loading />
      ) : (
        <div className="relative overflow-x-hidden min-h-screen" data-scroll-container>
          {/* Navigation */}
          <FloatingNav navItems={navItems} />

          {/* Main Content */}
          <main className="relative z-10 flex flex-col pt-20 pb-0">
            {/* New Modern Sections */}
            <MemoizedNewHero />
            <MemoizedStatsSection />
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
