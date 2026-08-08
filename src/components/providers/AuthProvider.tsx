"use client";

/**
 * Purpose
 * -------
 * Thin wrapper around NextAuth's `SessionProvider` that makes the Google OAuth
 * session available to any client component via `useSession()`.
 *
 * Responsibilities
 * - Mount SessionProvider at the root of the client component tree.
 *
 * Used by
 * - `src/app/layout.tsx` — outermost provider in the tree.
 * - Any component that calls `useSession()` (e.g. Navbar, profile pages).
 *
 * Interview Talking Points
 * - This is a Client Component ("use client") because SessionProvider uses React
 *   context, which does not work in Server Components. Wrapping it here keeps
 *   the parent layout.tsx as a Server Component — a key Next.js App Router
 *   pattern for minimizing client bundle size.
 */

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
