"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmailSentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-[rgba(126,16,44,0.04)]" />
      <div className="fixed top-1/4 left-1/4 w-72 h-72 bg-[rgba(126,16,44,0.06)] rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 bg-[rgba(215,169,168,0.03)] rounded-full blur-3xl" />

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="hidden sm:inline">Close</span>
      </button>

      {/* Card */}
      <div className="relative w-full max-w-[360px] bg-[#111118] border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Success Icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
        <p className="text-sm text-gray-400 mb-6">
          We sent a verification link to your email. Please check your inbox or spam folder.
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-foreground)] text-sm font-medium rounded-lg transition-all active:scale-[0.98]"
          >
            Go to Login
          </Link>
          
          <Link
            href="/auth/resendverification"
            className="block w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium rounded-lg transition-all"
          >
            Resend Verification
          </Link>
        </div>

        <p className="text-[10px] text-gray-600 mt-5">
          Need help? <Link href="/contact-support" className="text-[var(--color-accent)] hover:text-[var(--color-muted)]">Contact support</Link>
        </p>
      </div>
    </div>
  );
}
