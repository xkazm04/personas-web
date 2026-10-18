"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { useLoopGate } from "@/hooks/useLoopGate";

/**
 * The broadcast's run sheet: a step counter that plays a segment ONCE, one
 * beat per step, then holds the final frame. It advances only while the panel
 * is on screen and the tab is foregrounded (useLoopGate: useStillMotion +
 * usePageVisibility + useIsVisible), so a parked panel resumes where it left.
 * Reduced motion rests on the final frame; Replay is the visitor asking for
 * the motion, so it plays - but refuses to start while the tab is hidden.
 * `msOf` must be stable (module scope).
 */
export function useOnAir<T extends Element>(
  ref: RefObject<T | null>,
  count: number,
  msOf: (step: number) => number,
) {
  const gate = useLoopGate(ref);
  const onScreen = !gate.vetoedBy.includes("foreground") && !gate.vetoedBy.includes("in-view");
  const [clock, setClock] = useState({ step: 0, played: false, run: 0 });
  const moving = !gate.still || clock.played;
  const at = moving ? Math.min(clock.step, count) : count;
  const ticking = moving && onScreen && at < count;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setTimeout(() => setClock((c) => ({ ...c, step: c.step + 1 })), msOf(at));
    return () => window.clearTimeout(id);
  }, [ticking, at, msOf]);

  const replay = useCallback(() => {
    if (document.hidden) return;
    setClock((c) => ({ step: 0, played: true, run: c.run + 1 }));
  }, []);

  return {
    /** Current step: 0..count; `count` is the held final frame. */
    at,
    done: at >= count,
    /** Animate transitions (false = jump to the end pose). */
    moving,
    /** The clock is advancing right now. */
    ticking,
    /** Ambient decoration (the LIVE bug pulse) may loop. */
    live: gate.run,
    /** Bumps on every replay, for state that resets with the run. */
    run: clock.run,
    replay,
  };
}

/** A transition that collapses to an instant jump when motion is off. */
export const beat = (moving: boolean, duration = 0.45, delay = 0) =>
  moving ? { duration, delay, ease: [0.22, 1, 0.36, 1] as const } : { duration: 0 };
