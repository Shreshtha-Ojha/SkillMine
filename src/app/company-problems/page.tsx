"use client";
import React, { useState, useEffect, useCallback } from "react";
import useCurrentUser from "@/lib/useCurrentUser";
import LoginRequiredModal from '@/components/ui/LoginRequiredModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Building2, 
  ExternalLink, 
  ArrowLeft,
  Loader2,
  Code2,
  TrendingUp,
  Filter,
  ChevronDown,
  Star,
  BookOpen,
  Lock,
  Unlock,
  Crown,
  Sparkles,
  CheckCircle2,
  Flag,
  Check
} from "lucide-react";

interface Problem {
  difficulty: string;
  title: string;
  frequency: string;
  acceptance: string;
  link: string;
}

interface Company {
  name: string;
  displayName: string;
  problemCount?: number;
}

// Popular companies to feature
const FEATURED_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", 
  "Adobe", "Goldman Sachs", "Uber", "Salesforce", "Oracle", "IBM"
];

// Free companies available without purchase
const FREE_COMPANIES = ["Google", "Amazon", "Microsoft"];

export default function CompanyProblemsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState<number | null>(null);



  // Fetch dynamic pricing
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/pricing", { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.pricing?.premium) {
            setPremiumPrice(data.pricing.premium);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }
    };
    fetchPricing();    const onStorage = (e: StorageEvent) => { if (e.key === 'pricing_updated_at') fetchPricing(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);  }, []);

  // Check if user has purchased OA questions and show modal on page load
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const response = await fetch("/api/payment/oa-questions");
        if (response.ok) {
          const data = await response.json();
          setHasPurchased(data.purchased || false);
          
          // Show purchase modal on page load if user hasn't purchased
          // Check if modal was already shown in this session
          const modalShown = sessionStorage.getItem("oaModalShown");
          if (!data.purchased && !modalShown) {
            // Small delay to let page render first
            setTimeout(() => {
              setShowPurchaseModal(true);
              sessionStorage.setItem("oaModalShown", "true");
            }, 1500);
          }
        } else {
          // Not logged in - show modal to encourage purchase/signup
          const modalShown = sessionStorage.getItem("oaModalShown");
          if (!modalShown) {
            setTimeout(() => {
              setShowPurchaseModal(true);
              sessionStorage.setItem("oaModalShown", "true");
            }, 1500);
          }
        }
      } catch (err) {
        console.error("Error checking purchase status:", err);
      } finally {
        setCheckingPurchase(false);
      }
    };
    checkPurchaseStatus();
  }, []);

  const user = useCurrentUser();
  // Local sets for quick membership checks (kept in sync with server)
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set());
  const [busyProblem, setBusyProblem] = useState<string | null>(null);

  // Check if a company is free
  const isCompanyFree = (companyName: string) => {
    return FREE_COMPANIES.some(fc => 
      companyName.toLowerCase().includes(fc.toLowerCase())
    );
  };

  // Handle payment - Create payment request and redirect
  const handlePurchase = async () => {
    setProcessingPayment(true);
    setShowPurchaseModal(false);

    try {
      // Create payment request via our API
      const response = await fetch("/api/payment/create-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
        console.warn('Payment create-request failed', response.status, data);
        const errMsg = typeof data?.error === 'object' ? (data?.error?.message || JSON.stringify(data?.error)) : data?.error;
        if (data?.code === 'ALREADY_PURCHASED') {
          alert(errMsg || 'You already own this product.');
          window.location.href = '/company-problems';
          return;
        }
        alert(errMsg || "Failed to create payment request. Please try again.");
        setProcessingPayment(false);
        return;
      }

      if (data.paymentUrl) {
        // Redirect to Instamojo payment page
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

  // Fetch company list from secure API
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company-problems");
      
      if (!response.ok) throw new Error("Failed to fetch companies");
      
      const data = await response.json();
      
      // Sort companies - featured first
      const companyList: Company[] = data.companies
        .sort((a: Company, b: Company) => {
          const aFeatured = FEATURED_COMPANIES.some(c => 
            a.displayName.toLowerCase().includes(c.toLowerCase())
          );
          const bFeatured = FEATURED_COMPANIES.some(c => 
            b.displayName.toLowerCase().includes(c.toLowerCase())
          );
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return a.displayName.localeCompare(b.displayName);
        });
      
      setCompanies(companyList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch problems for selected company via secure API
  const fetchProblems = useCallback(async (companyName: string) => {
    try {
      setLoadingProblems(true);
      setError(null);
      
      // Fetch from our secure API (checks purchase status server-side)
      const response = await fetch(`/api/company-problems?company=${encodeURIComponent(companyName)}`);
      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          // User needs to purchase
          setShowPurchaseModal(true);
          setSelectedCompany(null);
        }
        throw new Error(data.error || "No problems found for this company");
      }
      
      const data = await response.json();
      setProblems(data.problems || []);
      setFilteredProblems(data.problems || []);
    } catch (err: any) {
      setError(err.message);
      setProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();


  }, [fetchCompanies]);

  // Initialize solved/review sets from user object
  useEffect(() => {
    if (user && user !== null) {
      setSolvedSet(new Set(user.solvedProblems || []));
      setReviewSet(new Set(user.reviewProblems || []));
    } else {
      setSolvedSet(new Set());
      setReviewSet(new Set());
    }
  }, [user]);

  // Filter problems based on search and difficulty
  useEffect(() => {
    let filtered = problems;
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(p => 
        p.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }
    
    setFilteredProblems(filtered);
  }, [problems, searchQuery, difficultyFilter]);

  // Filter companies based on search
  const filteredCompanies = companies.filter(c =>
    c.displayName.toLowerCase().includes(companySearch.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "MEDIUM": return "text-[#E1D4C1] bg-[#7E102C]/10 border-[#7E102C]/20";
      case "HARD": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const handleCompanySelect = (company: Company) => {
    // Check if company is locked
    if (!hasPurchased && !isCompanyFree(company.displayName)) {
      setShowPurchaseModal(true);
      return;
    }
    
    setSelectedCompany(company);
    setProblems([]);
    setSearchQuery("");
    setDifficultyFilter("all");
    fetchProblems(company.name);
  };

  // Purchase Modal Component
  const PurchaseModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setShowPurchaseModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-8 max-w-lg w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#7E102C]/20 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-[#E1D4C1]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E1D4C1] mb-3">
            Unlock 450+ Company Questions
          </h2>
          <p className="text-[#E1D3CC] mb-6">
            Get access to curated LeetCode problems from 450+ top companies including Meta, Apple, Netflix, Adobe, and many more!
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#E1D3CC]">One-time Payment</span>
              <div className="flex items-center gap-2">
                    <span className="text-[#E1D3CC] line-through text-sm">{premiumPrice ? `₹${premiumPrice + 100}` : '₹—'}</span>
                    <span className="text-2xl font-bold text-[#E1D4C1]">₹{premiumPrice}</span>
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

          {/* Purchase CTA / Login handling / Hide if already purchased */}
          {hasPurchased ? (
            <div className="text-center p-4 bg-[#071010]/50 rounded-lg">
              <p className="text-green-400 font-semibold">You already have Premium access</p>
            </div>
          ) : user === null ? (
            <div className="space-y-3">
              <p className="text-[#E1D3CC]">You need to login to purchase premium access.</p>
              <div className="flex gap-2">
                <button onClick={() => { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); }} className="w-full inline-flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-lg text-[#E1D4C1] font-semibold">Log in</button>
                <button onClick={() => { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); }} className="w-full py-3 bg-[#7E102C] text-[#E1D4C1] font-bold rounded-xl hover:bg-[#58423F] transition flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="mr-2">Pay ₹{premiumPrice} & Unlock</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={async () => {
                if (user === undefined) return; // still loading
                if (!user) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                if (hasPurchased) return; // double safety
                setProcessingPayment(true);
                try {
                  const response = await fetch('/api/payment/create-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
                  const j = await response.json();
                  if (!response.ok) {
                    if (response.status === 401) { toast.error('Please sign in to purchase Premium'); setShowLoginModal(true); return; }
                    toast.error(j.error || 'Failed to create payment request');
                    setProcessingPayment(false);
                    return;
                  }
                  if (j.paymentUrl) window.location.href = j.paymentUrl;
                } catch (err:any) {
                  toast.error(err?.message || 'Failed to initiate purchase');
                } finally { setProcessingPayment(false); }
              }}
              disabled={processingPayment}
              className="w-full py-4 bg-[#7E102C] text-[#E1D4C1] font-bold rounded-xl hover:bg-[#58423F] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="mr-2">Pay ₹{premiumPrice} & Unlock</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowPurchaseModal(false)}
            className="mt-4 text-[#E1D3CC] hover:text-[#E1D4C1] text-sm transition"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && <PurchaseModal />}
      </AnimatePresence>
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Processing Payment Overlay */}
      <AnimatePresence>
        {processingPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#E1D4C1] animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Redirecting to payment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7E102C]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => selectedCompany ? setSelectedCompany(null) : router.push('/')}
            className="flex items-center gap-2 text-[#E1D3CC] hover:text-[#E1D4C1] transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {selectedCompany ? "Back to Companies" : "Back"}
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#E1D4C1] flex items-center gap-3">
                <div className="p-2 bg-[#7E102C]/20 rounded-xl">
                  <Code2 className="w-8 h-8 text-[#E1D4C1]" />
                </div>
                {selectedCompany ? selectedCompany.displayName : "Company-Wise Problems"}
              </h1>
              <p className="text-[#E1D3CC] mt-2">
                {selectedCompany 
                  ? `LeetCode problems frequently asked at ${selectedCompany.displayName}`
                  : "Practice company-specific LeetCode problems for your dream job"
                }
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {!hasPurchased && !checkingPurchase && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="px-4 py-2 bg-[#7E102C]/10 border border-[#7E102C]/30 rounded-xl text-[#E1D4C1] font-medium flex items-center gap-2 hover:bg-[#7E102C]/20 transition"
                >
                  <Crown className="w-4 h-4" />
                  Unlock All 450+ Companies
                </button>
              )}
              {hasPurchased && (
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-medium flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Premium Access
                </span>
              )}

              {/* Solved / Marked - dedicated page */}
              <button onClick={() => router.push('/company-problems/marked')} className="px-3 py-2 bg-yellow-400 text-black rounded-xl font-semibold text-sm hover:opacity-95 transition flex items-center gap-2">
                Solved / Marked
              </button>

              {/* Analysis link (premium) */}
              <button onClick={(e)=>{ e.stopPropagation(); if(!hasPurchased) { setShowPurchaseModal(true); } else { window.location.href = '/company-problems/analysis'; } }} className="px-3 py-2 text-yellow-300 hover:text-white bg-yellow-400/5 border border-yellow-500/20 rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Analysis
                <span className="ml-1 px-2 py-0.5 text-xs bg-black/10 rounded-full">Premium</span>
              </button>

              {selectedCompany && (
                <span className="px-4 py-2 bg-[#7E102C]/10 border border-[#7E102C]/20 rounded-xl text-[#E1D4C1] font-medium">
                  {filteredProblems.length} Problems
                </span>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedCompany ? (
            /* Company List View */
            <motion.div
              key="companies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search Companies */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E1D3CC]" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#111118] border border-white/10 rounded-xl text-[#E1D4C1] placeholder:text-[#E1D3CC] focus:outline-none focus:ring-2 focus:ring-[#7E102C]/50 transition"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[#E1D4C1] animate-spin mb-4" />
                  <p className="text-[#E1D3CC]">Loading companies...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={fetchCompanies}
                    className="mt-4 px-4 py-2 bg-[#7E102C]/10 text-[#E1D4C1] rounded-lg hover:bg-[#7E102C]/20 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>


                  {/* Featured Companies */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-[#E1D4C1] mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#E1D4C1]" />
                      Featured Companies
                      {!hasPurchased && (
                        <span className="text-xs text-[#E1D3CC] font-normal ml-2">
                          ({FREE_COMPANIES.length} free, rest require purchase)
                        </span>
                      )}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredCompanies
                        .filter(c => FEATURED_COMPANIES.some(fc => 
                          c.displayName.toLowerCase().includes(fc.toLowerCase())
                        ))
                        .slice(0, 12)
                        .map((company, idx) => {
                          const isFree = isCompanyFree(company.displayName);
                          const isLocked = !hasPurchased && !isFree;
                          
                          return (
                            <motion.div
                              key={company.name}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => handleCompanySelect(company)}
                              className={`group relative p-4 bg-white/5 border rounded-xl cursor-pointer transition-all ${
                                isLocked 
                                  ? "border-white/5 hover:border-[#7E102C]/30" 
                                  : "border-white/10 hover:border-[#7E102C]/30 hover:bg-white/5"
                              }`}
                            >
                              {isLocked && (
                                <div className="absolute top-2 right-2">
                                  <Lock className="w-4 h-4 text-[#7E102C]/70" />
                                </div>
                              )}
                              {isFree && !hasPurchased && (
                                <div className="absolute top-2 right-2">
                                  <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                    FREE
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                                  isLocked 
                                    ? "bg-[#7E102C]/20" 
                                    : "bg-[#111118]/50" 
                                }`}>
                                  <Building2 className={`w-6 h-6 ${isLocked ? "text-[#E1D3CC]" : "text-[#E1D4C1]"}`} />
                                </div>
                                <h3 className={`text-sm font-medium truncate w-full ${
                                  isLocked ? "text-[#E1D3CC]" : "text-[#E1D4C1]"
                                }`}>
                                  {company.displayName}
                                </h3>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>

                  {/* All Companies */}
                  <div>
                    <h2 className="text-lg font-semibold text-[#E1D4C1] mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#E1D4C1]" />
                      All Companies ({filteredCompanies.length})
                      {!hasPurchased && (
                        <button
                          onClick={() => setShowPurchaseModal(true)}
                          className="text-xs text-[#E1D4C1] font-normal ml-auto flex items-center gap-1 hover:text-[#D7A9A8] transition"
                        >
                          <Lock className="w-3 h-3" />
                          Unlock all for ₹{premiumPrice ?? '—'} <span className="text-xs ml-2 line-through">₹{premiumPrice != null && premiumPrice > 0 ? premiumPrice + 100 : ''}</span>
                        </button>
                      )}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredCompanies.map((company, idx) => {
                        const isFree = isCompanyFree(company.displayName);
                        const isLocked = !hasPurchased && !isFree;
                        
                        return (
                          <motion.div
                            key={company.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                            onClick={() => handleCompanySelect(company)}
                            className={`group relative p-3 bg-[#111118] border rounded-xl cursor-pointer transition-all ${
                              isLocked 
                                ? "border-white/5 hover:border-[#7E102C]/20" 
                                : "border-white/5 hover:border-[#7E102C]/30 hover:bg-white/5"
                            }`}
                          >
                            {isLocked && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-3 h-3 text-[#7E102C]/50" />
                              </div>
                            )}
                            {isFree && !hasPurchased && (
                              <div className="absolute top-2 right-2">
                                <span className="text-[8px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">
                                  FREE
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                                isLocked 
                                  ? "bg-white/5 group-hover:bg-[#7E102C]/10" 
                                  : "bg-white/5 group-hover:bg-[#7E102C]/10"
                              }`}>
                                <Building2 className={`w-4 h-4 transition ${
                                  isLocked 
                                    ? "text-[#E1D3CC] group-hover:text-[#E1D4C1]" 
                                    : "text-[#E1D3CC] group-hover:text-[#E1D4C1]"
                                }`} />
                              </div>
                              <span className={`text-sm truncate transition ${
                                isLocked 
                                  ? "text-[#E1D3CC] group-hover:text-[#E1D4C1]" 
                                  : "text-[#E1D4C1] group-hover:text-[#E1D4C1]"
                              }`}>
                                {company.displayName}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            /* Problems View */
            <motion.div
              key="problems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Quick lists removed — use dedicated Solved / Marked page */}
              <div className="mb-6">
                <div className="p-3 bg-[#0f0f13] border border-white/5 rounded-xl text-sm text-[#E1D3CC] flex items-center justify-between">
                  <div>
                    Manage your solved and marked questions from the <button onClick={() => router.push('/company-problems/marked')} className="text-yellow-300 font-semibold ml-1">Solved / Marked</button> page.
                  </div>
                  <a href="/profile?tab=problems" className="text-sm text-[#E1D3CC] hover:text-[#E1D4C1]">View in profile</a>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E1D3CC]" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#111118] border border-white/10 rounded-xl text-[#E1D4C1] placeholder:text-[#E1D3CC] focus:outline-none focus:ring-2 focus:ring-[#7E102C]/50 transition"
                  />
                </div>

                <div className="flex gap-2">
                  {["all", "easy", "medium", "hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        difficultyFilter === diff
                          ? diff === "easy"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : diff === "medium"
                            ? "bg-[#7E102C]/20 text-[#E1D4C1] border border-[#7E102C]/30"
                            : diff === "hard"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-[#7E102C]/20 text-[#E1D4C1] border border-[#7E102C]/30"
                          : "bg-white/5 text-[#E1D3CC] border border-white/5 hover:bg-white/10"
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {problems.filter(p => p.difficulty === "EASY").length}
                  </div>
                  <div className="text-sm text-[#E1D3CC]">Easy</div>
                </div>
                <div className="p-4 bg-[#7E102C]/10 border border-[#7E102C]/20 rounded-xl text-center">
                  <div className="text-2xl font-bold text-[#E1D4C1]">
                    {problems.filter(p => p.difficulty === "MEDIUM").length}
                  </div>
                  <div className="text-sm text-[#E1D3CC]">Medium</div>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {problems.filter(p => p.difficulty === "HARD").length}
                  </div>
                  <div className="text-sm text-[#E1D3CC]">Hard</div>
                </div>
              </div>

              {loadingProblems ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[#E1D4C1] animate-spin mb-4" />
                  <p className="text-gray-400">Loading problems...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-[#111118] border border-white/5 rounded-2xl">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchProblems(selectedCompany.name)}
                    className="px-4 py-2 bg-[#7E102C]/10 text-[#E1D4C1] rounded-lg hover:bg-[#7E102C]/20 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="text-center py-20 bg-[#111118] border border-white/5 rounded-2xl">
                  <Code2 className="w-12 h-12 text-[#E1D3CC] mx-auto mb-4" />
                  <p className="text-[#E1D3CC]">No problems found</p>
                </div>
              ) : (
                <>
                {/* Problems Table */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                  {/* Desktop Table (md+) */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/5 text-sm font-medium text-[#E1D3CC]">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Problem</div>
                      <div className="col-span-2">Difficulty</div>
                      <div className="col-span-2">Frequency</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {filteredProblems.map((problem, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                          className="hidden md:grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition group"
                        >
                          <div className="col-span-1 text-[#E1D3CC] text-sm">{idx + 1}</div>
                          <div className="col-span-5">
                            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="text-[#E1D4C1] hover:text-[#E1D4C1] transition font-medium flex items-center gap-2">
                              {problem.title}
                              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                            </a>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-[#E1D4C1]" />
                              <span className="text-[#E1D4C1] text-sm">{problem.frequency}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-2">
                            {/* Mark Solved toggle */}
                            <button onClick={async (e) => {
                              e.stopPropagation(); if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                              const link = problem.link; if (busyProblem) return; setBusyProblem(link);
                              const willSolve = !solvedSet.has(link);
                              setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.add(link); else n.delete(link); return n; });
                              try {
                                const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleSolved' }), credentials: 'include' });
                                const j = await res.json().catch(() => ({}));
                                if (!res.ok) {
                                  setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; });
                                  alert(j?.error || 'Failed to update solved status');
                                } else { setSolvedSet(new Set(j.solvedProblems || [])); setReviewSet(new Set(j.reviewProblems || [])); }
                              } catch (err) {
                                setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; });
                                alert('Network error');
                              } finally { setBusyProblem(null); }
                            }} aria-pressed={solvedSet.has(problem.link)} className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition ${solvedSet.has(problem.link) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{solvedSet.has(problem.link) ? 'Solved' : 'Mark solved'}</span>
                            </button>

                            {/* Mark for review toggle */}
                            <button onClick={async (e) => {
                              e.stopPropagation(); if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                              const link = problem.link; if (busyProblem) return; setBusyProblem(link);
                              const willMark = !reviewSet.has(link);
                              setReviewSet(prev => { const n = new Set(prev); if (willMark) n.add(link); else n.delete(link); return n; });
                              try {
                                const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleReview' }), credentials: 'include' });
                                const j = await res.json().catch(()=>({}));
                                if (!res.ok) { setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; }); alert(j?.error || 'Failed to update review status'); }
                                else { setReviewSet(new Set(j.reviewProblems || [])); setSolvedSet(new Set(j.solvedProblems || [])); }
                              } catch (err) { setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; }); alert('Network error'); }
                              finally { setBusyProblem(null); }
                            }} aria-pressed={reviewSet.has(problem.link)} className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition ${reviewSet.has(problem.link) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                              <Flag className="w-4 h-4" />
                              <span>{reviewSet.has(problem.link) ? 'For review' : 'Mark review'}</span>
                            </button>

                            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#7E102C]/10 text-[#E1D4C1] rounded-lg hover:bg-[#7E102C]/20 transition text-sm font-medium">
                              Solve
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Cards (smaller screens) */}
                  <div className="md:hidden divide-y divide-white/5">
                    {filteredProblems.map((problem, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="text-[#E1D4C1] font-medium truncate block">
                              {problem.title}
                            </a>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#E1D3CC]">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                              <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-[#E1D4C1]" /><span className="text-[#E1D4C1] text-xs">{problem.frequency}</span></div>
                            </div>
                          </div>

                          <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-2">
                            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#7E102C]/10 text-[#E1D4C1] rounded-lg text-sm font-medium">Solve</a>

                            <div className="flex gap-2 mt-1">
                              <button onClick={async (e) => {
                                e.stopPropagation(); if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                                const link = problem.link; if (busyProblem) return; setBusyProblem(link);
                                const willSolve = !solvedSet.has(link);
                                setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.add(link); else n.delete(link); return n; });
                                try { const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleSolved' }), credentials: 'include' }); const j = await res.json().catch(() => ({})); if (!res.ok) { setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; }); alert(j?.error || 'Failed to update solved status'); } else { setSolvedSet(new Set(j.solvedProblems || [])); setReviewSet(new Set(j.reviewProblems || [])); } } catch (err) { setSolvedSet(prev => { const n = new Set(prev); if (willSolve) n.delete(link); else n.add(link); return n; }); alert('Network error'); } finally { setBusyProblem(null); }
                              }} className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${solvedSet.has(problem.link) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{solvedSet.has(problem.link) ? 'Solved' : 'Mark'}</span>
                              </button>

                              <button onClick={async (e) => {
                                e.stopPropagation(); if (!user) { window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`; return; }
                                const link = problem.link; if (busyProblem) return; setBusyProblem(link);
                                const willMark = !reviewSet.has(link);
                                setReviewSet(prev => { const n = new Set(prev); if (willMark) n.add(link); else n.delete(link); return n; });
                                try { const res = await fetch('/api/user/problem-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemLink: link, action: 'toggleReview' }), credentials: 'include' }); const j = await res.json().catch(()=>({})); if (!res.ok) { setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; }); alert(j?.error || 'Failed to update review status'); } else { setReviewSet(new Set(j.reviewProblems || [])); setSolvedSet(new Set(j.solvedProblems || [])); } } catch (err) { setReviewSet(prev => { const n = new Set(prev); if (willMark) n.delete(link); else n.add(link); return n; }); alert('Network error'); } finally { setBusyProblem(null); }
                              }} className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${reviewSet.has(problem.link) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                                <Flag className="w-4 h-4" />
                                <span>{reviewSet.has(problem.link) ? 'Marked' : 'Mark'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Company-specific quick lists removed — manage marks on the dedicated page */}
                <div className="mt-6">
                  <div className="p-3 bg-[#0f0f13] border border-white/5 rounded-xl text-sm text-[#E1D3CC]">
                    Manage solved / marked questions across companies on the <button onClick={() => router.push('/company-problems/marked')} className="text-yellow-300 font-semibold ml-1">Solved / Marked</button> page.
                  </div>
                </div>
                </>

              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
