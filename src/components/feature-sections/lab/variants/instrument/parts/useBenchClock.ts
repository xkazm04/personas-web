"use client";

import { useEffect, useState } from "react";

/**
 * The bench's step clock: a counter that advances on its own while `running`
 * (motion allowed, tab foregrounded, screen on view - see useLoopGate). The
 * timer is re-armed per step, so a pause leaves the current reading on screen
 * and resuming continues from it. `durationOf` must be module-scoped.
 * `loop: false` stops at the last step instead of wrapping.
 */
export function useBenchClock(
  count: number,
  durationOf: (step: number) => number,
  running: boolean,
  initial = 0,
  loop = true,
) {
  const [step, setStep] = useState(initial);
  useEffect(() => {
    if (!running) return;
    if (!loop && step >= count - 1) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % count), durationOf(step));
    return () => clearTimeout(id);
  }, [running, step, count, durationOf, loop]);
  return [step, setStep] as const;
}

/** A replay the visitor starts: refuse while the tab is backgrounded. */
export function canStart(): boolean {
  return typeof document === "undefined" || !document.hidden;
}
