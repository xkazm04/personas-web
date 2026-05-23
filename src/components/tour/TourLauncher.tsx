"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import type { TourStep } from "@/lib/tour-script";

const STORAGE_KEY = "personas-tour-seen";

/**
 * Entry point for the guided tour. Hides itself while a tour is running.
 * Each page passes its own `steps` array so one engine drives all pages.
 *
 * Extras: `?tour=1` in the URL auto-starts the tour on mount; a localStorage
 * flag remembers that a visitor has seen the tour so the first-time pulse
 * only shows once.
 */
export default function TourLauncher({ steps }: { steps: TourStep[] }) {
  const { t } = useTranslation();
  const { active, start } = useTour();
  // Default to "seen" so returning visitors don't see a one-frame pulse
  // before the effect below flips state.
  const [seen, setSeen] = useState(true);
  const autostartedRef = useRef(false);

  // Read the seen flag once on mount (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => {
      try {
        setSeen(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        // localStorage may be blocked (privacy mode); keep default seen=true.
      }
    });
  }, []);

  // Auto-start when ?tour=1 in the URL.
  useEffect(() => {
    if (autostartedRef.current) return;
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("tour") === "1") {
      autostartedRef.current = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignored */
      }
      start(steps);
    }
  }, [start, steps]);

  if (active) return null;

  const handleStart = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* localStorage may be blocked; proceed regardless. */
    }
    setSeen(true);
    start(steps);
  };

  return (
    <motion.button
      type="button"
      onClick={handleStart}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2.5 rounded-full border border-glass-hover bg-white/3 px-5 py-2.5 text-base font-mono tracking-wide text-muted-dark transition-colors duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
    >
      {/* Subtle pulsing ring for first-time visitors. */}
      {seen === false && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-0.5 rounded-full ring-2 ring-brand-cyan/50"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan transition-transform duration-300 group-hover:scale-110">
        <Play className="h-3 w-3 fill-current" />
      </span>
      {t.tour.launch}
    </motion.button>
  );
}
