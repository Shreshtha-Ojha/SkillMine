"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  DollarSign, Save, Loader2, AlertCircle, CheckCircle, 
  FileText, Users, Briefcase, ArrowLeft, RefreshCw, Crown
} from "lucide-react";
import Link from "next/link";
import useCurrentUser from "@/lib/useCurrentUser";
import { Mic } from "lucide-react";

interface PricingData {
  premium: number;
  updatedAt?: string;
}

export default function PricingManagementPage() {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pricing, setPricing] = useState<PricingData>({
    premium: 249,
  });
  const [originalPricing, setOriginalPricing] = useState<PricingData | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    
    if (user === null || !user?.isAdmin) {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    fetchPricing();
  }, [user]);

  const fetchPricing = async () => {
    try {
      const response = await axios.get(`/api/admin/pricing?t=${Date.now()}`, { withCredentials: true });
      if (response.data.success) {
        setPricing({ premium: response.data.pricing.premium });
        setOriginalPricing({ premium: response.data.pricing.premium, updatedAt: response.data.pricing.updatedAt });
      }
    } catch (error) {
      toast.error("Failed to fetch pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate minimum price (Instamojo min ₹9)
    if ((pricing.premium || 0) < 9) {
      toast.error("Minimum price is ₹9 (payment gateway requirement)");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put("/api/admin/pricing", { premium: pricing.premium }, { withCredentials: true });
      if (response.data.success) {
        toast.success("Pricing updated successfully!");
        setOriginalPricing({ premium: response.data.pricing.premium, updatedAt: response.data.pricing.updatedAt });
        setPricing({ premium: response.data.pricing.premium });
        // Broadcast to other tabs/clients that pricing changed (storage event)
        try { localStorage.setItem('pricing_updated_at', response.data.pricing.updatedAt || String(Date.now())); } catch(e){}
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalPricing) {
      setPricing(originalPricing);
      toast.success("Reset to saved values");
    }
  };

  const hasChanges = originalPricing && (
    pricing.premium !== originalPricing.premium
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-medium">{error}</p>
          <Link href="/" className="text-[#D4AF37] hover:underline mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const pricingItems = [
    {
      key: "premium" as const,
      label: "Premium",
      description: "All-access Premium price",
      icon: Crown,
      color: "yellow",
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "bg-[#D4AF37]/20", text: "text-[#D4AF37]", border: "border-[#D4AF37]/30" },
      purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
      green: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
      yellow: { bg: "bg-[#7E102C]/20", text: "text-[#E1D4C1]", border: "border-[#7E102C]/30" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/admin-panel"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#7E102C]/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#E1D4C1]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pricing Management</h1>
                <p className="text-xs text-gray-400">Set prices for premium features</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-[#7E102C] hover:bg-[#7E102C] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-[#7E102C]/10 border border-[#7E102C]/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#E1D4C1] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#E1D4C1] font-medium">Important</p>
            <p className="text-gray-400 text-sm">
              Minimum price is ₹9 due to payment gateway (Instamojo) requirements. 
              Changes will apply to new purchases immediately.
            </p>
          </div>
        </div>

        {/* Single Premium Pricing Card */}
        <div className="space-y-4">
          <div className={`bg-gray-900/50 border border-gray-700 rounded-2xl p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-[#7E102C]/20 rounded-xl`}>
                  <DollarSign className={`w-6 h-6 text-[#E1D4C1]`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Premium</h3>
                  <p className="text-gray-400 text-sm mt-1">Single premium plan that unlocks all premium sections</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  min={9}
                  value={pricing.premium}
                  onChange={(e) => setPricing({
                    ...pricing,
                    premium: Math.max(9, parseInt(e.target.value) || 9)
                  })}
                  className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-2xl font-bold text-white text-center focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            { (pricing.premium ?? 0) < 9 && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Minimum price is ₹9
              </div>
            ) }
          </div>
        </div>

        {/* Last Updated */}
        {originalPricing?.updatedAt && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            Last updated: {new Date(originalPricing.updatedAt).toLocaleString()}
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#7E102C]/20 border border-[#7E102C]/30 text-[#E1D4C1] px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4" />
            You have unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
