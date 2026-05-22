"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Entry point for the guided tour. Hides itself while a tour is running.
 */
export default function TourLauncher() {
  const { t } = useTranslation();
  const { active, start } = useTour();
  if (active) return null;

  return (
    <motion.button
      type="button"
      onClick={start}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group inline-flex items-center gap-2.5 rounded-full border border-glass-hover bg-white/3 px-5 py-2.5 text-base font-mono tracking-wide text-muted-dark transition-colors duration-300 hover:border-brand-cyan/50 hover:bg-brand-cyan/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan transition-transform duration-300 group-hover:scale-110">
        <Play className="h-3 w-3 fill-current" />
      </span>
      {t.tour.launch}
    </motion.button>
  );
}
