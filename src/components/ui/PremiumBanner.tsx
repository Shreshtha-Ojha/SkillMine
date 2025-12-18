"use client";

import React, { useEffect, useState, useRef } from "react";
import useCurrentUser from '@/lib/useCurrentUser';
import LoginRequiredModal from '@/components/ui/LoginRequiredModal';
import { toast } from 'react-hot-toast';
import { ArrowRight, X } from 'lucide-react';

const DISMISS_KEY = 'premium_banner_dismissed_at';
const DISMISS_MS = 10 * 60 * 1000; // 10 minutes

export default function PremiumBanner() {
  const user = useCurrentUser();
  const [pricing, setPricing] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [visible, setVisible] = useState<boolean | null>(null); // null=unknown/loading
  const reappearTimer = useRef<number | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/admin/pricing', { cache: 'no-store' });
        if (res.ok) {
          const d = await res.json();
          if (d.pricing?.premium) setPricing(d.pricing.premium);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchPricing();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pricing_updated_at') fetchPricing();
      if (e.key === DISMISS_KEY) handleStorageDismissChange();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Determine whether to show banner based on dismissal timestamp and premium status
  useEffect(() => {
    if (user === undefined) return; // still loading

    // If user is premium, never show
    if (user && user.purchases?.premium?.purchased) {
      setVisible(false);
      return;
    }

    // Check dismiss timestamp
    try {
      const ts = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0;
      const now = Date.now();
      const elapsed = now - ts;
      if (ts === 0 || elapsed >= DISMISS_MS) {
        setVisible(true);
      } else {
        setVisible(false);
        // schedule re-show after remaining time
        const remaining = DISMISS_MS - elapsed;
        if (reappearTimer.current) window.clearTimeout(reappearTimer.current);
        reappearTimer.current = window.setTimeout(() => {
          setVisible(true);
          try { localStorage.removeItem(DISMISS_KEY); } catch(e){}
        }, remaining) as unknown as number;
      }
    } catch (e) {
      setVisible(true);
    }

    // cleanup on unmount
    return () => { if (reappearTimer.current) window.clearTimeout(reappearTimer.current); };
  }, [user]);

  const handleStorageDismissChange = () => {
    // recompute visibility when dismiss key changes in other tabs
    try {
      const ts = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0;
      const now = Date.now();
      const elapsed = now - ts;
      if (ts === 0 || elapsed >= DISMISS_MS) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch (e) {
      setVisible(true);
    }
  };

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    setVisible(false);
    // ensure re-show after DISMISS_MS in this tab as well
    if (reappearTimer.current) window.clearTimeout(reappearTimer.current);
    reappearTimer.current = window.setTimeout(() => {
      setVisible(true);
      try { localStorage.removeItem(DISMISS_KEY); } catch(e){}
    }, DISMISS_MS) as unknown as number;
  };

  if (visible === null) return null; // still deciding
  if (!visible) return null;

  // Only show to users who don't have premium
  if (user && user.purchases?.premium?.purchased) return null;

  const handleBuy = async () => {
    if (user === undefined) return; // still loading
    if (!user) { toast.error('Please sign in to purchase Premium'); setShowLogin(true); return; }

    setProcessing(true);
    try {
      const res = await fetch('/api/payment/create-request', { method: 'POST', credentials: 'include' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) { toast.error('Please sign in to purchase Premium'); setShowLogin(true); return; }
        toast.error(j.error || 'Failed to create payment request');
        return;
      }
      if (j.paymentUrl) window.location.href = j.paymentUrl;
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[999998] w-[calc(100vw-32px)] sm:w-80 md:w-96 max-w-md">
        <div className="relative bg-[#0b0b10]/95 border border-white/10 rounded-lg p-3 sm:p-3 pt-8 shadow-lg flex items-center gap-3 overflow-visible">
          {/* Dismiss button - prominent and mobile-friendly */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss premium banner"
            title="Dismiss"
            className="absolute -top-3 -right-3 bg-white/6 text-[#E1D4C1] hover:bg-white/10 hover:text-white p-1.5 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-[1000002]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 pr-2">
            <div className="text-sm text-[#E1D4C1] font-semibold">Upgrade to <span className="text-yellow-400">Premium</span></div>
            <div className="text-xs text-[#E1D3CC] mt-1">Unlock company problems, full skill tests & complete practice.</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleBuy}
              disabled={processing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-400 text-black rounded font-semibold hover:opacity-95 disabled:opacity-60 whitespace-nowrap"
            >
              {processing ? 'Processing...' : (pricing ? `Buy ₹${pricing}` : 'Buy')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <LoginRequiredModal open={showLogin} onClose={() => setShowLogin(false)} callbackUrl={typeof window !== 'undefined' ? window.location.href : '/'} />
    </>
  );
}
