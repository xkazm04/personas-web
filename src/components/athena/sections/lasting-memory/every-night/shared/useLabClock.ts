"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The deterministic tick clock every memory-lab variant runs on.
 *
 * - Runs only while the section is at least 40% on screen AND the tab is in
 *   the foreground (the loop is ambient, so a backgrounded tab costs nothing).
 * - Rewinds to tick 0 on every entry, so nobody joins the story halfway.
 * - Reduced motion: no interval at all; the phase is pinned to `still`, a
 *   calm, complete mid-scene frame chosen by the variant.
 * - Before the section has ever been seen it parks on `park`.
 *
 * Rewind uses the render-time prev-state pattern (React 19 forbids a
 * synchronous setState in an effect body).
 */
export function useLabClock(
  ref: RefObject<Element | null>,
  { cycle, tickMs, still, park }: { cycle: number; tickMs: number; still: number; park: number },
) {
  const reduced = useStillMotion();
  const inView = useInView(ref, { amount: 0.4 });
  const hidden = usePageVisibility();
  const [tick, setTick] = useState(park);

  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(0);
  }

  const running = !reduced && inView && !hidden;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  return { phase: (reduced ? still : tick) % cycle, reduced };
}
