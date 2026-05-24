"use client";

import { useEffect } from "react";
import type { TourStep } from "@/lib/tour-script";

/**
 * Centres the current step's spotlight target when the step changes. The
 * target lives inside a (possibly lazy) section, so if it isn't in the DOM
 * yet we scroll the always-present section wrapper into view to trigger
 * hydration, then retry until the real target can be centred.
 */
export function useTourScroll(
  enabled: boolean,
  stepIndex: number,
  steps: TourStep[],
  prefersReducedMotion: boolean | null,
): void {
  useEffect(() => {
    if (!enabled || steps.length === 0) return;
    const step = steps[stepIndex];
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const center = () => {
      const spot = document.querySelector<HTMLElement>(step.spotlightTarget);
      if (spot) {
        spot.scrollIntoView({ behavior, block: "center" });
        return true;
      }
      document
        .querySelector<HTMLElement>(step.scrollTarget)
        ?.scrollIntoView({ behavior, block: "center" });
      return false;
    };

    if (center()) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (center() || tries > 12) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [enabled, stepIndex, prefersReducedMotion, steps]);
}
