"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import { TRANSITION_NORMAL } from "@/lib/animations";
import AthenaCompanion from "./AthenaCompanion";

/**
 * Welcome pop-up shown when a tour with `intro` starts: dims the page and
 * introduces Athena (the companion) plus what to expect, before the guided
 * steps begin. "Begin" starts the walkthrough; "Skip" exits.
 */
export default function TourIntroCard() {
  const { t } = useTranslation();
  const { beginTour, exit } = useTour();

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(8,11,20,0.82)] backdrop-blur-sm"
        onClick={exit}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.tour.introTitle}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={TRANSITION_NORMAL}
        className="relative flex w-[min(94vw,32rem)] flex-col items-center gap-5 rounded-3xl border border-glass-hover bg-surface/95 p-8 text-center shadow-2xl backdrop-blur-md"
      >
        <AthenaCompanion size={132} />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t.tour.introTitle}
          </h2>
          <p className="text-base leading-relaxed text-muted-dark">
            {t.tour.introBody}
          </p>
        </div>

        <div className="mt-1 flex w-full items-center justify-center gap-3">
          <button
            type="button"
            onClick={beginTour}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-brand-cyan/50 bg-brand-cyan/10 px-6 py-3 text-base font-medium text-brand-cyan transition-colors duration-200 hover:bg-brand-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
          >
            {t.tour.begin}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={exit}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-glass px-5 py-3 text-base text-muted-dark transition-colors duration-200 hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
          >
            <X className="h-4 w-4" />
            {t.tour.skip}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
