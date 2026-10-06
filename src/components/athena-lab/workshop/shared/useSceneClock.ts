"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The deterministic tick clock every workshop variant runs on.
 *
 * - Ticks only while the section is on screen (useInView, 40%) AND the tab is
 *   foregrounded: an ambient loop must not burn a backgrounded tab.
 * - Rewinds to `start` on every entry, so nobody joins a scene mid-argument.
 *   (Render-time prev-state pattern: React 19 forbids sync setState in an
 *   effect body.)
 * - Reduced motion never starts the interval and pins `still`, a calm and
 *   complete mid-scene frame - never blank, never a faster loop.
 *
 * Returns the phase (tick modulo `cycle`) - every scene derives its whole
 * state from that one number through pure functions.
 */
export function useSceneClock({
  cycle,
  still,
  tickMs,
  start = 0,
}: {
  cycle: number;
  still: number;
  tickMs: number;
  start?: number;
}) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const ref = useRef<HTMLElement | null>(null);
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

  const phase = (reduced ? still : tick) % cycle;
  return { ref, phase, reduced };
}
