"use client";

/**
 * Purpose
 * -------
 * Global SWR configuration provider and shared data-fetching hooks for
 * high-frequency read data (roadmaps, blogs, community stats).
 *
 * Responsibilities
 * - Configure SWR globally: 1-minute dedup window, 3 retries, no revalidation
 *   on focus (avoids Gemini/DB hits every time the user alt-tabs back).
 * - Export ready-made hooks (`useRoadmaps`, `useBlogs`, `useStats`) so
 *   any component can subscribe to this data without re-declaring fetch URLs.
 *
 * Used by
 * - `src/app/layout.tsx` — wraps the entire tree so all pages share the SWR cache.
 * - Explore page, home page, and blog list page via the exported hooks.
 *
 * Interview Talking Points
 * - `revalidateOnFocus: false` is intentional. SkillMine fetches from Gemini and
 *   MongoDB on every revalidation — revalidating on focus would hammer the DB
 *   every time a user switches tabs, creating unnecessary cost and latency.
 * - `dedupingInterval: 60000` means two components mounting simultaneously share
 *   one in-flight request rather than each issuing their own.
 * - SWR's cache is in-memory per tab; a full page refresh always re-fetches.
 *   For cross-session persistence, a service worker or localStorage layer
 *   would be needed.
 */

import React, { createContext, useContext } from 'react';
import { SWRConfig } from 'swr';
import useSWR from 'swr';

// Global fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

// SWR configuration for caching
const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Cache data for 10 minutes
  focusThrottleInterval: 600000,
};

interface DataCacheProviderProps {
  children: React.ReactNode;
}

export function DataCacheProvider({ children }: DataCacheProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

// Custom hooks for specific data fetching
export const useStats = () => {
  const { data, error, isLoading } = useSWR('/api/community/stats');
  return {
    stats: data,
    isLoading,
    error
  };
};

export const useRoadmaps = () => {
  const { data, error, isLoading } = useSWR('/api/roadmap/fetchall');
  return {
    roadmaps: data?.roadmaps || [],
    isLoading,
    error
  };
};

export const useBlogs = () => {
  const { data, error, isLoading } = useSWR('/api/blogs/fetchall');
  return {
    blogs: data?.blogs || [],
    isLoading,
    error
  };
};

// Re-export useSWR for custom usage
export { default as useSWR } from 'swr';
