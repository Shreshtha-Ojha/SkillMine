"use client";

import { useState, useEffect } from "react";

/**
 * Hook that returns true only after the component has hydrated on the client.
 * Use this to defer rendering of client-only content to avoid hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

export default useHydrated;
