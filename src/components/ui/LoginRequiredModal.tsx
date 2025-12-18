"use client";

import React from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Link from "next/link";

export default function LoginRequiredModal({ open, onClose, callbackUrl }: { open: boolean; onClose: () => void; callbackUrl?: string }) {
  const { signInWithGoogle } = useGoogleAuth();

  if (!open) return null;

  const cb = callbackUrl || window.location.href;

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 z-[999998]" onClick={onClose} />
      <div className="relative z-[1000001] bg-[#0b0b10] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">Sign in to continue</h3>
        <p className="text-sm text-gray-300 mb-4">You need to be signed in to start or access Skill Tests. Please sign in to continue.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white/5 rounded">Cancel</button>
          <button onClick={() => signInWithGoogle()} className="px-4 py-2 bg-blue-600 text-white rounded">Sign in with Google</button>
          <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(cb)}`} className="px-4 py-2 bg-white/5 rounded flex items-center">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
