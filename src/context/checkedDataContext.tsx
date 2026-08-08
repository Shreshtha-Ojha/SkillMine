"use client";

/**
 * Purpose
 * -------
 * Lightweight, cookie-based login state context for UI-only decisions
 * (show/hide nav buttons, conditional rendering) that do not need the full
 * NextAuth session object.
 *
 * Responsibilities
 * - Read the `token` cookie on mount to determine if the user is logged in.
 * - Expose `isLoggedIn` boolean to any component in the tree without a
 *   network call or session fetch.
 *
 * Used by
 * - Navbar — to show "Login" vs "Profile" links.
 * - Any component that conditionally renders based on auth state but does
 *   not need user details (email, username, etc.).
 *
 * Interview Talking Points
 * - This exists alongside `useSession()` (NextAuth) because the NextAuth
 *   session is only populated for Google OAuth users. Email/password users
 *   have a `token` cookie but no NextAuth session. This context handles both
 *   cases uniformly using the presence of the cookie as the signal.
 * - Cookie presence is a UI hint, not a security gate. The actual auth check
 *   happens server-side in `getUserFromRequest`. A user who deletes their
 *   cookie simply sees the logged-out UI — no data is exposed.
 * - The `useEffect` runs client-side only, so there's no SSR mismatch — the
 *   initial render always shows the logged-out state, then hydrates.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface CheckedDataContextType {
  isLoggedIn: boolean;
}

const CheckedDataContext = createContext<CheckedDataContextType | undefined>(undefined);

export function useCheckedData() {
  const context = useContext(CheckedDataContext);
  if (!context) {
    throw new Error("useCheckedData must be used within a CheckedDataProvider");
  }
  return context;
}

interface CheckedDataProviderProps {
  children: ReactNode;
}

export const CheckedDataProvider: React.FC<CheckedDataProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const contextValue: CheckedDataContextType = {
    isLoggedIn,
  };

  return (
    <CheckedDataContext.Provider value={contextValue}>
      {children}
    </CheckedDataContext.Provider>
  );
};
