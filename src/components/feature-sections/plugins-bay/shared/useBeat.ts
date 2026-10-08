"use client";

import { useEffect, useState, type RefObject } from "react";
import { useLoopGate } from "@/hooks/useLoopGate";

/**
 * A scene's clock: one step every `ms` while the loop gate allows it
 * (motion allowed, on screen, tab visible). While stopped the scene is given
 * `stillStep`, a complete frame chosen to tell the whole story at once, so
 * reduced motion is a finished picture rather than a blank first beat.
 */
export function useBeat<T extends Element>(ref: RefObject<T | null>, ms: number, stillStep: number) {
  const { run } = useLoopGate(ref);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setStep((s) => s + 1), ms);
    return () => clearInterval(id);
  }, [run, ms]);

  return { step: run ? step : stillStep, run };
}
