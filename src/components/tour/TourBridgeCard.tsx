"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import { TRANSITION_NORMAL } from "@/lib/animations";

/**
 * End-of-tour bridge prompt. Shown when a tour run finishes its last step and
 * a `bridgeHref` was set (e.g. the homepage tour offering to continue into
 * /features). Accepting navigates; declining ends the tour.
 */
export default function TourBridgeCard() {
  const { t } = useTranslation();
  const { confirmBridge, dismissBridge } = useTour();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t.tour.bridgePrompt}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={TRANSITION_NORMAL}
      className="fixed inset-x-0 bottom-6 z-[90] mx-auto flex w-[min(92vw,30rem)] flex-col gap-5 rounded-2xl border border-glass-hover bg-surface/95 p-6 shadow-2xl backdrop-blur-md"
    >
      <p className="text-lg font-medium leading-relaxed text-foreground">
        {t.tour.bridgePrompt}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={confirmBridge}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-brand-cyan/50 bg-brand-cyan/10 px-5 py-2.5 text-base font-medium text-brand-cyan transition-colors duration-200 hover:bg-brand-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          {t.tour.bridgeConfirm}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={dismissBridge}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-glass px-5 py-2.5 text-base text-muted-dark transition-colors duration-200 hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          <X className="h-4 w-4" />
          {t.tour.bridgeDismiss}
        </button>
      </div>
    </motion.div>
  );
}
