"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Phase sequence for the Conductor hero loop:
 *   listen  — waveform animates, the spoken sentence types out
 *   plan    — the fleet plan card materializes
 *   edit    — one row is visibly edited (effort chip bumped)
 *   confirm — the Confirm button pulses (nothing has spawned yet)
 *   ignite  — terminal tiles light in sequence (claim-before-spawn)
 *   hold    — full scene holds, then the loop restarts
 *
 * Modeled on `feature-sections/healing-circuit/useHealingCycle.ts`, with one
 * refinement: the first cycle is kicked off via a 0ms timeout so no setState
 * runs synchronously inside the effect body (React 19 compiler rules).
 *
 * Reduced motion: no timers at all — the hook reports the final composed
 * frame (everything typed, everything lit) per the animation contract's
 * content-bearing rule in `src/lib/animations.ts`.
 */

export type ConductorPhase =
  | "listen"
  | "plan"
  | "edit"
  | "confirm"
  | "ignite"
  | "hold";

const ORDER: Record<ConductorPhase, number> = {
  listen: 0,
  plan: 1,
  edit: 2,
  confirm: 3,
  ignite: 4,
  hold: 5,
};

/** True when `phase` is at or past `min` in the sequence. */
export function phaseAtLeast(phase: ConductorPhase, min: ConductorPhase): boolean {
  return ORDER[phase] >= ORDER[min];
}

const TYPE_MS = 52; // per typed character
const IGNITE_MS = 300; // per terminal tile
const HOLD_MS = 3400; // full-scene hold before the loop restarts

export function useConductorCycle(sentenceLength: number, terminalCount: number) {
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<ConductorPhase>("listen");
  const [typedCount, setTypedCount] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    const timers = timersRef.current;
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!disposed) fn();
      }, ms);
      timers.push(id);
    };

    const run = () => {
      timers.length = 0; // previous cycle's timers have all fired
      setPhase("listen");
      setTypedCount(0);
      setLitCount(0);
      for (let i = 1; i <= sentenceLength; i++) {
        later(() => setTypedCount(i), 700 + i * TYPE_MS);
      }
      const t = 700 + sentenceLength * TYPE_MS;
      later(() => setPhase("plan"), t + 800);
      later(() => setPhase("edit"), t + 2300);
      later(() => setPhase("confirm"), t + 3900);
      later(() => setPhase("ignite"), t + 5100);
      for (let i = 1; i <= terminalCount; i++) {
        later(() => setLitCount(i), t + 5300 + i * IGNITE_MS);
      }
      const end = t + 5300 + terminalCount * IGNITE_MS;
      later(() => setPhase("hold"), end + 700);
      later(run, end + 700 + HOLD_MS);
    };

    later(run, 0); // async kick-off — no sync setState in the effect body
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, [reduced, sentenceLength, terminalCount]);

  if (reduced) {
    // Static composed frame: sentence fully typed, card shown & edited,
    // Confirm pressed, every terminal lit.
    return {
      phase: "hold" as ConductorPhase,
      typedCount: sentenceLength,
      litCount: terminalCount,
      reduced,
    };
  }
  return { phase, typedCount, litCount, reduced };
}
