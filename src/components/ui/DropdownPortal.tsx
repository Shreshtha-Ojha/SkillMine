"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DropdownPortal({
  rect,
  open,
  children,
  offset = 8,
  zIndex = 100000,
  onMouseEnter,
  onMouseLeave,
}: {
  rect: DOMRect | null;
  open: boolean;
  children: React.ReactNode;
  offset?: number;
  zIndex?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !open || !rect) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: rect.bottom + window.scrollY + offset,
    left: rect.left + window.scrollX,
    zIndex,
    minWidth: rect.width,
  };

  return createPortal(
    <div style={style} className="pointer-events-auto" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>,
    document.body
  );
}
