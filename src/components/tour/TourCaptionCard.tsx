"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import { TRANSITION_NORMAL } from "@/lib/animations";

const BTN_BASE =
  "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Floating narration + controls for the guided tour. Sits above the
 * spotlight overlay; auto-advance keeps running while it is shown.
 */
export default function TourCaptionCard() {
  const { t } = useTranslation();
  const { steps, stepIndex, playing, next, prev, goTo, togglePlay, exit } = useTour();
  if (steps.length === 0) return null;
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t.tour.launch}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={TRANSITION_NORMAL}
      className="fixed inset-x-0 bottom-6 z-[90] mx-auto flex w-[min(92vw,30rem)] flex-col gap-4 rounded-2xl border border-glass-hover bg-surface/95 p-5 shadow-2xl backdrop-blur-md"
    >
      {/* Narration — announced to assistive tech as it changes. */}
      <div className="min-h-[3.75rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={TRANSITION_NORMAL}
            className="text-base leading-relaxed text-foreground"
          >
            {t.tour[step.narration]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots — also jump-to controls. */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1} / ${steps.length}`}
            aria-current={i === stepIndex}
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 ${
              i === stepIndex
                ? "w-6 bg-brand-cyan"
                : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Controls. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={isFirst}
          aria-label={t.tour.previous}
          className={`${BTN_BASE} border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? t.tour.pause : t.tour.play}
          className={`${BTN_BASE} border-brand-cyan/50 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20`}
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={next}
          aria-label={t.tour.next}
          className={`${BTN_BASE} border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={exit}
          aria-label={t.tour.exit}
          className={`${BTN_BASE} ml-auto border-glass text-muted-dark hover:border-glass-hover hover:text-foreground`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
