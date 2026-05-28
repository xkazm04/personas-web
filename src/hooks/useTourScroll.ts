"use client";

import { useEffect } from "react";

/**
 * Centres the live spotlight target whenever it changes (on a step change, or
 * mid-step when a sweep moves it). The target may live inside a (possibly lazy)
 * section, so if it isn't in the DOM yet we scroll the always-present
 * `scrollTarget` wrapper into view to trigger hydration, then retry until the
 * real target can be centred.
 */
export function useTourScroll(
  enabled: boolean,
  spotlightTarget: string | null,
  scrollTarget: string | null,
  prefersReducedMotion: boolean | null,
): void {
  useEffect(() => {
    if (!enabled || !spotlightTarget) return;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const center = () => {
      const spot = document.querySelector<HTMLElement>(spotlightTarget);
      if (spot) {
        spot.scrollIntoView({ behavior, block: "center" });
        return true;
      }
      if (scrollTarget) {
        document
          .querySelector<HTMLElement>(scrollTarget)
          ?.scrollIntoView({ behavior, block: "center" });
      }
      return false;
    };

    if (center()) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (center() || tries > 12) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [enabled, spotlightTarget, scrollTarget, prefersReducedMotion]);
}
