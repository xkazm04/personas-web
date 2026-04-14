"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface UseAutoCycleOptions {
  /** Number of items to cycle through. */
  count: number;
  /** Interval in ms between transitions. */
  intervalMs: number;
  /** External pause flag (e.g. user interaction, hover). */
  paused?: boolean;
  /** Initial active index. Defaults to 0. */
  initial?: number;
  /** Whether to honor `prefers-reduced-motion`. Defaults to true. */
  respectReducedMotion?: boolean;
}

/**
 * useAutoCycle — drives an active index through a fixed-length list on a
 * recurring interval, pausing when `paused === true` or when the user has
 * `prefers-reduced-motion` enabled.
 *
 * Replaces the manual `useEffect(() => setInterval(...))` autocycle pattern
 * that appeared in OrchestrationHub, GetStarted, AgentsChat, AgentsTimeline,
 * WhyAgents, PlaygroundTimeline, etc. The hook also exposes `setActive` so
 * callers can jump to a specific index (e.g. when a chip is clicked) and the
 * cycle resumes from that index on the next tick.
 *
 * @example
 *   const { active, setActive, paused, setPaused } = useAutoCycle({
 *     count: TRIGGERS.length,
 *     intervalMs: 3200,
 *     paused: hovered,
 *   });
 */
export function useAutoCycle({
  count,
  intervalMs,
  paused = false,
  initial = 0,
  respectReducedMotion = true,
}: UseAutoCycleOptions) {
  const reducedMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(initial);
  const [internalPaused, setInternalPaused] = useState(false);

  const isPaused = paused || internalPaused || (respectReducedMotion && reducedMotion);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(t);
  }, [isPaused, count, intervalMs]);

  return {
    active,
    setActive,
    /** True when the cycle is currently halted (external pause OR reduced motion). */
    paused: isPaused,
    /** Toggle the internal pause flag (use this for click-to-pause behavior). */
    setPaused: setInternalPaused,
  };
}
