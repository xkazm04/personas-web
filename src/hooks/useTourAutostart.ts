"use client";

import { useEffect, useRef } from "react";
import { useTour, type TourStartOptions } from "@/contexts/TourContext";
import type { TourId } from "@/lib/tour-script";

/** localStorage flag: this visitor has started a tour (the launcher's first-time pulse reads it). */
export const TOUR_SEEN_KEY = "personas-tour-seen";

/** The tour's steps, loaded on demand (the scripts stay out of the above-fold chunk). */
export function loadTourSteps(tourId: TourId) {
  return import("@/lib/tour-script").then((m) => m.TOURS_BY_ID[tourId]);
}

/**
 * Auto-start `tourId` when the URL carries `?tour=1`, once per mount. A tour
 * is a user-started loop, so it does not start in a background tab: it waits
 * until the tab is shown.
 */
export function useTourAutostart(tourId: TourId, options: TourStartOptions, enabled = true): void {
  const { start } = useTour();
  const startedRef = useRef(false);
  const { bridgeHref, bridge, intro } = options;

  useEffect(() => {
    if (!enabled || startedRef.current || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("tour") !== "1") return;
    const go = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      try {
        window.localStorage.setItem(TOUR_SEEN_KEY, "1");
      } catch {
        /* localStorage may be blocked; start regardless. */
      }
      void loadTourSteps(tourId).then((steps) => start(steps, { bridgeHref, bridge, intro }));
    };
    if (!document.hidden) {
      go();
      return;
    }
    const onVisible = () => {
      if (!document.hidden) go();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, tourId, start, bridgeHref, bridge, intro]);
}
