"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * The deterministic tick clock every "Nothing quietly rots" lab variant runs
 * on, in one place so the three directions share the same discipline:
 *
 *   - in-view gate (40%) and a rewind to tick 0 on every entry, so nobody
 *     joins the story mid-way;
 *   - stops while the tab is backgrounded (an ambient loop must);
 *   - reduced motion never runs an interval and pins `pinned` - a calm,
 *     complete mid-scene frame, never a faster loop.
 *
 * `live` is the gate every ambient framer loop in the scene also keys on, so
 * off-screen or hidden, nothing in the section animates at all.
 */
export function useSceneClock({
  cycle,
  tickMs,
  park,
  pinned,
}: {
  cycle: number;
  tickMs: number;
  /** Where the clock waits before the section has ever been seen. */
  park: number;
  /** The reduced-motion still. */
  pinned: number;
}) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = useState(park);

  // Render-time prev-state rewind - React 19 forbids sync setState in effects.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(0);
  }

  const live = !reduced && inView && !hidden;

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((t) => t + 1), tickMs);
    return () => clearInterval(id);
  }, [live, tickMs]);

  const phase = (reduced ? pinned : tick) % cycle;
  return { ref, phase, reduced, live };
}
