"use client";

import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Download, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useActiveSection from "@/hooks/useActiveSection";

const preloadHowImage = () => {
  if (document.querySelector('link[data-preload-how-bg]')) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = "/imgs/illustration_photo.jpg";
  link.setAttribute("data-preload-how-bg", "");
  document.head.appendChild(link);
};

const routes = [
  { label: "Personas", href: "/" },
  { label: "How it works", href: "/how" },
  { label: "Connections", href: "/connections" },
  { label: "Roadmap", href: "/roadmap" },
];

const landingSections = [
  { id: "hero", label: "Hero" },
  { id: "use-cases", label: "Tools" },
  { id: "vision", label: "Vision" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "download", label: "Download" },
];

const BADGE_VISIBLE_MS = 1500;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const activeSection = useActiveSection(isLanding ? landingSections : []);

  // Transient badge: show on section change, hide after 1.5s
  const [visibleBadge, setVisibleBadge] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSectionRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip "Hero" — no badge needed at the top
    if (!activeSection || activeSection === "Hero") {
      prevSectionRef.current = activeSection;
      setVisibleBadge(null);
      return;
    }

    if (activeSection !== prevSectionRef.current) {
      prevSectionRef.current = activeSection;
      setVisibleBadge(activeSection);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisibleBadge(null), BADGE_VISIBLE_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeSection]);

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll and handle Escape key when panel is open
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMobile();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [mobileOpen, closeMobile]);

  // Auto-focus first link when panel opens
  useEffect(() => {
    if (mobileOpen && panelRef.current) {
      const first = panelRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [mobileOpen]);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-white/4 bg-background/70 backdrop-blur-2xl shadow-[0_1px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/imgs/logo.png"
                alt="Personas logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">Personas</span>
          </Link>

          {/* Active section badge */}
          <AnimatePresence mode="wait">
            {isLanding && visibleBadge && (
              <motion.span
                key={visibleBadge}
                initial={{ opacity: 0, x: -6, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 4, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/15 bg-brand-cyan/6 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-brand-cyan/80 backdrop-blur-sm"
              >
                <span className="h-1 w-1 rounded-full bg-brand-cyan/60 section-badge-dot" />
                {visibleBadge}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Route tabs */}
          <div className="hidden items-center gap-1 rounded-full border border-white/6 bg-white/2 p-1 backdrop-blur-sm md:flex">
            {routes.map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onMouseEnter={route.href === "/how" ? preloadHowImage : undefined}
                  className={`relative rounded-full px-6 py-1.5 min-h-11 flex items-center text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white/8 text-foreground shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                      : "text-muted hover:text-foreground hover:bg-white/3"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full border border-brand-cyan/20 bg-brand-cyan/6"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{route.label}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA — hidden on mobile, shown in slide-in panel instead */}
          <Link
            href="/#download"
            className="group relative hidden items-center gap-2 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-2 text-sm font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/12 md:flex"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Download className="relative h-3.5 w-3.5" />
            <span className="relative">Download</span>
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center min-w-11 min-h-11 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l border-white/6 bg-background/95 backdrop-blur-2xl shadow-2xl md:hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                <span className="text-sm font-semibold tracking-tight text-foreground/80">Menu</span>
                <button
                  onClick={closeMobile}
                  className="flex items-center justify-center min-w-11 min-h-11 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Active section badge — mobile */}
              <AnimatePresence mode="wait">
                {isLanding && visibleBadge && (
                  <motion.div
                    key={visibleBadge}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mx-5 mt-4"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/15 bg-brand-cyan/6 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-brand-cyan/80">
                      <span className="h-1 w-1 rounded-full bg-brand-cyan/60 section-badge-dot" />
                      {visibleBadge}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Route links */}
              <div className="flex flex-col gap-1 px-4 mt-4">
                {routes.map((route) => {
                  const isActive = pathname === route.href;
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={closeMobile}
                      className={`relative rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-brand-cyan/8 text-foreground border border-brand-cyan/15"
                          : "text-muted hover:text-foreground hover:bg-white/4 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan/70" />
                        )}
                        <span>{route.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Download CTA */}
              <div className="px-4 pb-6">
                <Link
                  href="/#download"
                  onClick={closeMobile}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-2.5 text-sm font-medium text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/12 w-full"
                >
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Download className="relative h-3.5 w-3.5" />
                  <span className="relative">Download</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
