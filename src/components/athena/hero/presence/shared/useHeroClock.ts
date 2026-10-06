"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The deterministic tick clock every hero variant runs on.
 *
 * - Ticks only while the hero is on screen (40%) AND the tab is foregrounded;
 *   `live` carries the same verdict to the ambient framer loops (glow, spin),
 *   so nothing decodes or repaints for a hero nobody is looking at.
 * - Rewinds to tick 0 on every entry (render-time prev-state pattern: React 19
 *   forbids a synchronous setState in an effect body).
 * - Reduced motion: no interval at all; `phase` pins `initial`, a calm,
 *   complete mid-scene frame chosen by each variant's data module.
 */
export function useHeroClock<T extends Element>(
  ref: RefObject<T | null>,
  { cycle, tickMs, initial }: { cycle: number; tickMs: number; initial: number },
) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = useState(0);

  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView) setTick(0);
  }

  const live = !reduced && inView && !hidden;

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((t) => t + 1), tickMs);
    return () => window.clearInterval(id);
  }, [live, tickMs]);

  return { phase: reduced ? initial : tick % cycle, tick: reduced ? initial : tick, live, reduced };
}
