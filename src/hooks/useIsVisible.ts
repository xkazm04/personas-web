"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePageVisibility } from "./usePageVisibility";

interface UseIsVisibleOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Returns `true` only when the tab is foregrounded AND the observed element
 * is intersecting the viewport. Designed for gating SWR polling intervals
 * (refreshInterval: visible ? 30_000 : 0) so the network and main thread
 * stay quiet while the user is on another tab or has scrolled past the chart.
 *
 * Falls back to "always visible" in environments without IntersectionObserver
 * (older browsers, tests, SSR) so the feature degrades safely.
 */
export function useIsVisible<T extends Element>(
  ref: RefObject<T | null>,
  options: UseIsVisibleOptions = {},
): boolean {
  const tabHidden = usePageVisibility();
  const [inView, setInView] = useState(true);

  const { rootMargin = "0px", threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver in this env — leave inView at its initial
    // `true` so polling keeps running rather than pausing forever.
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin, threshold]);

  return !tabHidden && inView;
}
