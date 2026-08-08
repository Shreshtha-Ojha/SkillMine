/**
 * Purpose
 * -------
 * Root layout — the single HTML shell that wraps every page in the application.
 *
 * Responsibilities
 * - Set global HTML metadata (title, description, Open Graph, robots).
 * - Apply the global CSS baseline and fixed background gradient.
 * - Mount all application-wide context providers in the correct nesting order.
 * - Render Vercel Analytics unconditionally (no user data sent, GDPR-safe).
 *
 * Provider nesting order (outermost → innermost):
 * 1. AuthProvider — NextAuth SessionProvider, needed by any component that
 *    calls `useSession()`.
 * 2. DataCacheProvider — SWR global config, shared across all data-fetching hooks.
 * 3. CheckedDataProvider — lightweight cookie-based login state for UI toggles
 *    that don't need the full session object.
 * 4. ClientToaster — toast notification system (must be inside all providers so
 *    toasts can be triggered from any component).
 * 5. PremiumBanner — wrapped in Suspense because it fetches pricing data.
 * 6. ErrorBoundary — catches render errors in the page tree without crashing
 *    the entire app.
 *
 * Interview Talking Points
 * - `suppressHydrationWarning` on `<html>` and `<body>` silences React's warning
 *   about server/client HTML mismatches caused by browser extensions injecting
 *   attributes (e.g. dark-mode extensions, password managers).
 * - The background gradient is injected via a `dangerouslySetInnerHTML` style
 *   tag to guarantee it renders before any CSS-in-JS or Tailwind loads,
 *   preventing a flash of unstyled background on slow connections.
 */

import { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { CheckedDataProvider } from "@/context/checkedDataContext";
import { DataCacheProvider } from "@/context/DataCacheContext";
import ClientToaster from "@/components/providers/ClientToaster";
import AuthProvider from "@/components/providers/AuthProvider";
import React from 'react';
import PremiumBanner from '@/components/ui/PremiumBanner';
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "SkillMine - Technical Roadmaps and Blogs",
  description: "Learn programming and grow your skills with technical roadmaps and blogs on SkillMine. Created by Shreshtha Ojha.",
  keywords: "programming, roadmaps, blogs, web development, machine learning, data science, programming skills, learning resources",
  authors: [{ name: "Shreshtha Ojha" }],
  robots: "index, follow",
  openGraph: {
    title: "SkillMine - Technical Roadmaps and Blogs",
    description: "SkillMine provides technical roadmaps and blogs to help you grow your skills in development, machine learning, data science, and more.",
    images: [{ url: "/official_logo.png", width: 1200, height: 630, alt: "SkillMine Logo" }],
    url: "https://skillminelearn.vercel.app",
    type: "website",
    siteName: "SkillMine",
  },
  icons: { icon: "/favicon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background-color: #0a0908 !important;
            background-image:
              radial-gradient(ellipse 80% 50% at 20% -10%, rgba(212, 175, 55, 0.12), transparent),
              radial-gradient(ellipse 80% 50% at 80% 0%, rgba(61, 184, 173, 0.10), transparent) !important;
            background-repeat: no-repeat !important;
            background-size: cover !important;
            background-attachment: fixed !important;
          }
        `}} />
      </head>
      <body className="antialiased notallow" suppressHydrationWarning>
        <AuthProvider>
          <DataCacheProvider>
            <CheckedDataProvider>
              <ClientToaster />
              <React.Suspense fallback={null}>
                <PremiumBanner />
              </React.Suspense>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </CheckedDataProvider>
          </DataCacheProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
