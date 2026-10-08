"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The one clock every "Always the same person" lab variant runs on.
 *
 * Deterministic: a tick counter and nothing else, so every frame of a scene
 * is a pure function of `phase`. The clock only runs while the section is at
 * least 40% on screen AND the tab is in front, and it rewinds to tick 0 on
 * every entry so nobody joins a scene half-drawn.
 *
 * Reduced motion pins `still` - a calm, complete frame chosen by the scene -
 * and never rewinds. Before the section has ever been on screen the clock
 * parks on `park`, so a section scrolled past at speed shows an assembled
 * frame rather than an empty one.
 *
 * `running` is the guard for every ambient framer loop in the scene: an
 * infinite repeat must stop when the clock stops (off screen, tab hidden,
 * reduced motion) - that is what usePageVisibility is for.
 */
export function useLoop({
  cycle,
  tickMs,
  still,
  park = cycle - 1,
}: {
  cycle: number;
  tickMs: number;
  still: number;
  park?: number;
}) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [tick, setTick] = useState(park);

  // Rewind on (re-)entry. Render-time prev-state pattern: React 19 forbids a
  // synchronous setState inside an effect body.
  const [prevInView, setPrevInView] = useState(inView);
  if (inView !== prevInView) {
    setPrevInView(inView);
    if (inView && !reduced) setTick(0);
  }

  const running = !reduced && inView && !hidden;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((n) => n + 1), tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  const phase = (reduced ? still : tick) % cycle;
  return { ref, phase, reduced, running };
}
