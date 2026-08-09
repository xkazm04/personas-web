"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Phase sequence for the Conductor hero loop:
 *   listen  — waveform animates, the spoken sentence types out
 *   plan    — the fleet plan card lands (dealt-card spring)
 *   edit    — one row is visibly edited (effort chip bumped)
 *   confirm — the sequence PAUSES; the Confirm button invites the visitor's
 *             click (participatory beat). `confirm()` ignites immediately;
 *             if nobody clicks within AUTO_CONFIRM_MS the loop auto-confirms
 *             so it never stalls.
 *   ignite  — terminal tiles light in sequence (claim-before-spawn)
 *   hold    — full scene holds, then the loop restarts
 *
 * `active` (viewport visibility) gates the timers: leaving the viewport
 * clears them, re-entering restarts the whole cycle (kp REPLAY lesson).
 * The first tick of each activation is kicked off via a 0ms timeout so no
 * setState runs synchronously inside the effect body (React 19 rules).
 *
 * Reduced motion: no timers at all — the hook reports the final composed
 * frame (sentence typed, card edited, all terminals lit) and `confirm()`
 * is a no-op.
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
const IGNITE_MS = 260; // per terminal tile
const HOLD_MS = 3600; // full-scene hold before the loop restarts
const AUTO_CONFIRM_MS = 4000; // grace before the loop confirms on its own

export function useConductorCycle(
  sentenceLength: number,
  terminalCount: number,
  active: boolean,
) {
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<ConductorPhase>("listen");
  const [typedCount, setTypedCount] = useState(0);
  const [litCount, setLitCount] = useState(0);
  /** Set only while the confirm beat is waiting; the button calls through it. */
  const igniteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (reduced || !active) return;
    let disposed = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!disposed) fn();
      }, ms);
      timers.push(id);
    };

    const run = () => {
      timers.length = 0; // previous cycle's timers have all fired
      let ignited = false;

      const ignite = () => {
        if (disposed || ignited) return; // click + auto-confirm both route here
        ignited = true;
        igniteRef.current = null;
        setPhase("ignite");
        for (let i = 1; i <= terminalCount; i++) {
          later(() => setLitCount(i), 200 + i * IGNITE_MS);
        }
        const end = 200 + terminalCount * IGNITE_MS;
        later(() => setPhase("hold"), end + 600);
        later(run, end + 600 + HOLD_MS);
      };

      setPhase("listen");
      setTypedCount(0);
      setLitCount(0);
      for (let i = 1; i <= sentenceLength; i++) {
        later(() => setTypedCount(i), 700 + i * TYPE_MS);
      }
      const t = 700 + sentenceLength * TYPE_MS;
      later(() => setPhase("plan"), t + 800);
      later(() => setPhase("edit"), t + 2300);
      later(() => {
        setPhase("confirm");
        igniteRef.current = ignite; // hand the beat to the visitor…
        later(ignite, AUTO_CONFIRM_MS); // …but never stall the loop
      }, t + 3900);
    };

    later(run, 0); // async kick-off — no sync setState in the effect body
    return () => {
      disposed = true;
      igniteRef.current = null;
      timers.forEach(clearTimeout);
    };
  }, [reduced, active, sentenceLength, terminalCount]);

  /** The visitor's Confirm click. No-op outside the confirm beat. */
  const confirm = useCallback(() => {
    igniteRef.current?.();
  }, []);

  if (reduced) {
    // Static composed frame: sentence fully typed, card shown & edited,
    // Confirm pressed, every terminal lit.
    return {
      phase: "hold" as ConductorPhase,
      typedCount: sentenceLength,
      litCount: terminalCount,
      confirm,
      reduced,
    };
  }
  return { phase, typedCount, litCount, confirm, reduced };
}
