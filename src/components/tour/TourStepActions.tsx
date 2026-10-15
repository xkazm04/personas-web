"use client";

import { Hand } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { TourStep } from "@/lib/tour-script";

/**
 * The caption card's controls for a step the visitor does (`advanceOn`):
 * "Show me" plays the step's demonstration (its `actions`), and on a step that
 * waits for the visitor (`waitForSignal`), "Keep looking" ends the tour without
 * acting. Nothing renders for a step the visitor only watches.
 */
export default function TourStepActions({
  step,
  onShowMe,
  onKeepLooking,
}: {
  step: TourStep;
  onShowMe: () => void;
  onKeepLooking: () => void;
}) {
  const { t } = useTranslation();
  const canShow = !!step.advanceOn && (step.actions?.length ?? 0) > 0;
  if (!canShow && !step.waitForSignal) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {canShow && (
        <button
          type="button"
          onClick={onShowMe}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/50 bg-brand-cyan/10 px-4 py-1.5 text-sm font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          <Hand aria-hidden className="h-3.5 w-3.5" />
          {t.tour.showMe}
        </button>
      )}
      {step.waitForSignal && (
        <button
          type="button"
          onClick={onKeepLooking}
          className="rounded-full border border-glass px-4 py-1.5 text-sm text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
        >
          {t.tour.keepLooking}
        </button>
      )}
    </div>
  );
}
