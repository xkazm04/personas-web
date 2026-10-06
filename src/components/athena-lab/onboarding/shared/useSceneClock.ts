"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/**
 * The deterministic tick clock every onboarding lab variant runs on (the
 * DevToolsGrid pattern the live /athena sections share):
 *
 *   - ticks only while the section is at least 40% on screen AND the tab is
 *     in front, so nothing advances where nobody can see it;
 *   - rewinds to tick 0 on every entry, so nobody joins the story mid-sentence
 *     (render-time prev-state pattern: React 19 forbids a sync setState in an
 *     effect body);
 *   - under reduced motion never ticks at all and pins `still`, a calm,
 *     complete mid-story frame.
 *
 * `live` says whether ambient loops (packets, pulses) may run right now.
 */
export function useSceneClock({ cycle, tickMs, still }: { cycle: number; tickMs: number; still: number }) {
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [tick, setTick] = useState(still);

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

  const phase = (reduced ? still : tick) % cycle;
  return { sectionRef, phase, reduced, live: running };
}
