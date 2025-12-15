"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginRequiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-[rgba(126,16,44,0.04)]" />
      <div className="fixed top-1/4 left-1/4 w-72 h-72 bg-[rgba(126,16,44,0.06)] rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-56 h-56 bg-[rgba(215,169,168,0.03)] rounded-full blur-3xl" />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Card */}
      <div className="relative w-full max-w-[380px] bg-[#111118] border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">Login Required</h1>
        <p className="text-sm text-gray-400 mb-6">
          Sign in to access interviews, leaderboard, and all premium features.
        </p>

        <Link
          href="/auth/login"
          className="inline-block w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-foreground)] text-sm font-medium rounded-lg transition-all active:scale-[0.98]"
        >
          Sign In
        </Link>

        <p className="text-xs text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[var(--color-accent)] hover:text-[var(--color-muted)] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
