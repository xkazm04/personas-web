"use client";

import { motion } from "framer-motion";
import { useTour } from "@/contexts/TourContext";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { TRANSITION_NORMAL } from "@/lib/animations";

/**
 * The end of a tour the visitor finished by acting (the dashboard tour, on a
 * committed verdict). It says what they did this run, counted from the tour's
 * own signals (commands the machine applied, verdicts committed), and, when the
 * tour opened the run behind their verdict, says so. No call to action (owner,
 * 2026-10-06). Not modal: the run's detail the tour just opened owns focus, and
 * Escape (useTourKeyboard) or Close ends the tour.
 */
export default function TourRecapCard() {
  const { t } = useTranslation();
  const { recap, exit } = useTour();
  const still = useStillMotion();
  if (!recap) return null;
  const counts = t.tour.recapCounts
    .replace("{commands}", String(recap.commands))
    .replace("{verdicts}", String(recap.verdicts));

  return (
    <motion.section
      aria-label={t.tour.launch}
      data-tour-card
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={still ? { duration: 0 } : TRANSITION_NORMAL}
      className="fixed inset-x-0 bottom-6 z-[90] mx-auto flex w-[min(92vw,30rem)] items-center gap-4 rounded-2xl border border-glass-hover bg-surface/95 p-5 shadow-2xl backdrop-blur-md"
    >
      <div className="min-w-0 flex-1" role="status">
        <p className="text-base font-medium text-foreground">{counts}</p>
        {recap.openedRun && <p className="mt-1 text-sm text-muted-dark">{t.tour.recapRun}</p>}
      </div>
      <button
        type="button"
        onClick={exit}
        className="flex-none rounded-full border border-glass px-4 py-2 text-sm text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
      >
        {t.common.close}
      </button>
    </motion.section>
  );
}
