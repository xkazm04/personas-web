"use client";

import { useEffect, useState, type RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";

/**
 * Whether an ambient loop may run: motion allowed, the tab foregrounded and the
 * element on screen. Server render and reduced motion both answer false-ish
 * through props only; callers keep their markup constant and gate values.
 */
export function useLoopGate(ref: RefObject<Element | null>) {
  const still = useStillMotion();
  const visible = useIsVisible(ref, { threshold: 0.25 });
  return { still, running: !still && visible };
}

/**
 * A step counter that advances on its own while `running`. `durationOf` must
 * be stable (module scope). The timer is re-armed per step, so pausing just
 * leaves the current step on screen and resuming continues from it.
 */
export function useStepLoop(count: number, durationOf: (step: number) => number, running: boolean, initial: number) {
  const [step, setStep] = useState(initial);
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % count), durationOf(step));
    return () => clearTimeout(id);
  }, [running, step, count, durationOf]);
  return [step, setStep] as const;
}
