"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [prevCount, setPrevCount] = useState(count);
  const [internalPaused, setInternalPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clamp the active index when the source list shrinks (e.g. items removed
  // by a hot reload or upstream data change). Using the prev-state pattern
  // here is required — calling setActive inside a useEffect is forbidden by
  // the React 19 compiler rules in this repo.
  if (count !== prevCount) {
    setPrevCount(count);
    if (count > 0 && active >= count) {
      setActive(count - 1);
    }
  }

  const isPaused = paused || internalPaused || (respectReducedMotion && reducedMotion);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    if (!Number.isFinite(intervalMs)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[useAutoCycle] non-finite intervalMs (${String(intervalMs)}); skipping cycle.`,
        );
      }
      return;
    }
    const safeInterval = Math.max(intervalMs, 16);
    if (process.env.NODE_ENV !== "production" && safeInterval !== intervalMs) {
      console.warn(
        `[useAutoCycle] intervalMs=${intervalMs} clamped to ${safeInterval}ms (likely seconds-vs-ms confusion).`,
      );
    }
    const t = setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, safeInterval);
    return () => clearInterval(t);
  }, [isPaused, count, intervalMs]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, []);

  const setPaused = useCallback<typeof setInternalPaused>((value) => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setInternalPaused(value);
  }, []);

  const pauseFor = useCallback((ms: number) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setInternalPaused(true);
    if (!Number.isFinite(ms) || ms <= 0) return;
    resumeTimerRef.current = setTimeout(() => {
      setInternalPaused(false);
      resumeTimerRef.current = null;
    }, ms);
  }, []);

  return {
    active,
    setActive,
    /** True when the cycle is currently halted (external pause OR reduced motion). */
    paused: isPaused,
    /** Toggle the internal pause flag (use this for click-to-pause behavior). */
    setPaused,
    /**
     * Pause the cycle, then auto-resume after `ms`. Use this when a tap/click
     * should pause briefly (so the user can read) but must not get stuck
     * paused on touch devices, where there is no `mouseleave`/`pointerleave`
     * paired with the tap that selected an item.
     */
    pauseFor,
  };
}
