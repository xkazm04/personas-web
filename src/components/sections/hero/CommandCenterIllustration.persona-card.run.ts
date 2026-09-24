"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { DONE_STEP, STAGES, TRIGGER_BEAT } from "./CommandCenterIllustration.persona-card.data";

/**
 * The run's single progress value. The resting state (server render, first
 * paint, reduced motion) is DONE_STEP: the completed run. When the card comes
 * into view with motion allowed, the run replays ONCE through the beat list:
 * step 0 = the schedule fires, step i+1 = stage i active, DONE_STEP = completed.
 * `replay()` plays it again on request; nothing loops on its own.
 */
export function usePersonaRun(reduced: boolean) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [step, setStep] = useState(DONE_STEP);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Every state change happens inside a timer, never synchronously here.
    timers.push(setTimeout(() => setStep(0), 0));
    let at = TRIGGER_BEAT;
    STAGES.forEach((stage, i) => {
      timers.push(setTimeout(() => setStep(i + 1), at));
      at += stage.beat;
    });
    timers.push(setTimeout(() => setStep(DONE_STEP), at));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced, runId]);

  return {
    ref,
    // A mid-run switch to reduced motion lands on the completed state.
    step: reduced ? DONE_STEP : step,
    replay: () => setRunId((n) => n + 1),
  };
}

export type StageState = "pending" | "active" | "done";

export function stageState(step: number, index: number): StageState {
  if (step > index + 1) return "done";
  if (step === index + 1) return "active";
  return "pending";
}
