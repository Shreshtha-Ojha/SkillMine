"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCheckedData } from "@/context/checkedDataContext";
import Cookies from "js-cookie";
import { Menu, X, ChevronDown, User, Shield, Star } from "lucide-react";
import DropdownPortal from "./DropdownPortal";

interface NavItem {
  name: string;
  link?: string;
  dropdown?: { name: string; link: string }[];
  premium?: boolean; // highlight as premium feature
  desktopOnlyDropdown?: boolean; // show dropdown only on desktop (hide from mobile menu)
  hideOnDesktop?: boolean; // hide this item from the desktop top-level nav (show on mobile)
}

export const FloatingNav = ({
  navItems,
}: {
  navItems: NavItem[];
  className?: string;
}) => {
  const { isLoggedIn: contextIsLoggedIn } = useCheckedData();
  const [isLoggedIn, setIsLoggedIn] = useState(contextIsLoggedIn);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(contextIsLoggedIn);
    const token = Cookies.get("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [contextIsLoggedIn]);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setOpenDropdown(null);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100000]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-4 py-3 theme-card theme-card--vintage bg-[#0a0a0f] border border-[#7E102C]/20 rounded-2xl"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/official_logo.png" alt="SkillMine" width={120} height={40} className="h-8 w-auto" />
          </Link>
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.filter((item) => !item.hideOnDesktop).map((item) =>
              item.link ? (
                <Link
                  key={item.name}
                  href={item.link}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${item.name === 'DSA Prep' ? 'bg-gradient-to-r from-green-400 to-green-500 text-[#0a0a0f] font-semibold shadow-lg transform hover:scale-105' : 'text-[#E1D4C1] hover:text-white hover:bg-white/5'}`}
                >
                  <span>{item.name}</span>
                </Link>
              ) : item.dropdown ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={(e) => {
                    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                    setOpenDropdown(item.name);
                    setDropdownRect((e.currentTarget as HTMLElement).getBoundingClientRect());
                  }}
                  onMouseLeave={() => {
                    // small delay to allow pointer to travel to dropdown portal
                    closeTimerRef.current = window.setTimeout(() => {
                      setOpenDropdown(null);
                      closeTimerRef.current = null;
                    }, 220);
                  }}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-all ${item.name === 'Premium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0a0a0f] font-semibold shadow-lg transform hover:scale-105' : 'text-[#E1D4C1] hover:text-white hover:bg-white/5'}`}
                    onClick={(e) => {
                      setOpenDropdown(openDropdown === item.name ? null : item.name);
                      setDropdownRect((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }}
                  >
                    {item.name === 'Premium' ? (
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-white" />
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                      </span>
                    ) : (
                      <>
                        {item.name}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  {openDropdown === item.name && dropdownRect && (
                    <DropdownPortal
                      rect={dropdownRect}
                      open
                      onMouseEnter={() => {
                        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                      }}
                      onMouseLeave={() => {
                        closeTimerRef.current = window.setTimeout(() => {
                          setOpenDropdown(null);
                          closeTimerRef.current = null;
                        }, 220);
                      }}
                    >
                      <div className="w-48 bg-[#E1D4C1] text-[#7E102C] border border-[#7E102C]/20 rounded-xl p-2 shadow-lg">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.link}
                            href={subItem.link}
                            className="block px-4 py-2 text-sm text-[#7E102C] hover:bg-[#D7A9A8]/20 transition-all"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </DropdownPortal>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin/admin-panel"
                className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}



            <Link
              href={isLoggedIn ? "/profile" : "/auth/login"}
              className="flex items-center gap-2 px-4 py-2 bg-[#7E102C] text-[#E1D4C1] text-sm font-medium rounded-lg hover:bg-[#58423F] transition-all border border-[#0a0a0f]"
            >
              <User className="w-4 h-4" />
              <span>{isLoggedIn ? "Profile" : "Login"}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-[#E1D4C1] bg-[#7E102C] hover:bg-[#6a0f27] rounded-lg transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-2 p-4 bg-[#E1D4C1] text-[#7E102C] rounded-2xl shadow-lg border border-[#7E102C]/20 max-h-[60vh] overflow-y-auto"
              style={{ color: "#7E102C", WebkitOverflowScrolling: "touch" }}
            >
              <div className="space-y-1">
                {navItems.filter((item) => !item.desktopOnlyDropdown).map((item) =>
                  item.link ? (
                    <Link
                      key={item.name}
                      href={item.link}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 hover:bg-[#D7A9A8]/20 rounded-lg transition-all ${item.premium ? 'text-yellow-300 bg-[#7E102C] font-semibold' : 'text-[#7E102C]'}`}
                    >
                      {item.name}
                    </Link>
                  ) : item.dropdown ? (
                    <div key={item.name}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#D7A9A8]/20 rounded-lg transition-all ${item.premium ? 'text-yellow-600 font-semibold' : 'text-[#7E102C]'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 border-l border-white/10"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.link}
                                href={subItem.link}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-[#7E102C] hover:bg-[#D7A9A8]/20 transition-all"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : null
                )}
                {isAdmin && (
                  <Link
                    href="/admin/admin-panel"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 bg-[#7E102C] text-[#E1D4C1] rounded-lg border border-[#0a0a0f] hover:bg-[#58423F] transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}


              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
