"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The deterministic clock every fleet-lab scene runs on.
 *
 * - Ticks only while the section is on screen (40%) AND the tab is in front:
 *   a scene nobody can see spends nothing.
 * - Rewinds to `start` on every entry, so nobody joins a sentence half-typed.
 *   Render-time prev-state pattern - React 19 forbids sync setState in an
 *   effect body.
 * - Reduced motion never starts the interval and pins `still`, a calm,
 *   complete mid-scene frame chosen by the scene's own data module.
 */
export function useSceneTick(
  ref: RefObject<Element | null>,
  { cycle, tickMs, still, start = 0 }: { cycle: number; tickMs: number; still: number; start?: number },
) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = useState(still);

  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(start);
  }

  useEffect(() => {
    if (reduced || !inView || hidden) return;
    const id = setInterval(() => setTick((t) => t + 1), tickMs);
    return () => clearInterval(id);
  }, [reduced, inView, hidden, tickMs]);

  return { phase: (reduced ? still : tick) % cycle, reduced };
}
