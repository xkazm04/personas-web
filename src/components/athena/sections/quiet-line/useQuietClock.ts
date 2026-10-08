"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The section's deterministic tick clock.
 *
 * - Ticks only while the section is on screen (40%) AND the tab is
 *   foregrounded; `live` carries the same verdict to the ambient framer loops
 *   (river, ruler, voice), so nothing repaints for a line nobody is watching.
 * - Rewinds to tick 0 on every entry (render-time prev-state pattern: React 19
 *   forbids a synchronous setState in an effect body), so every visit starts
 *   in the quiet and earns its first sentence.
 * - Reduced motion: no interval at all; `phase` pins `initial`, a calm,
 *   complete mid-sentence frame chosen by `./data`.
 */
export function useQuietClock({ cycle, tickMs, initial }: { cycle: number; tickMs: number; initial: number }) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const ref = useRef<HTMLElement | null>(null);
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

  return { ref, phase: reduced ? initial : tick % cycle, live, reduced };
}
