import { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { CheckedDataProvider } from "@/context/checkedDataContext";
import { DataCacheProvider } from "@/context/DataCacheContext";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import React from 'react';
import PremiumBanner from '@/components/ui/PremiumBanner';

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
    url: "https://www.skillmine.tech",
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
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background: url('/bg.png') no-repeat center top !important;
            background-size: cover !important;
            background-color: #36454F !important;
          }
        `}} />
      </head>
      <body className="antialiased notallow">
        <AuthProvider>
          <DataCacheProvider>
            <CheckedDataProvider>
              <Toaster position="top-right" reverseOrder={false} containerStyle={{ zIndex: 999999 }} />
              <React.Suspense fallback={null}>
                <PremiumBanner />
              </React.Suspense>
              {children}
            </CheckedDataProvider>
          </DataCacheProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
