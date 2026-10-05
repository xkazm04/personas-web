"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { FINAL, START, STEPS, nextEngine, type AgentKey, type Patch } from "./geometry";

/**
 * The patch of V3. In view (once) the demo re-patches three cables, the private
 * journal first; a visitor's click takes over (cycles that agent's engine) and
 * ends the demo. The replay button restarts it. Under reduced motion the patch
 * shown is the resolved FINAL one until the visitor changes it - derived, never
 * set from an effect - and the demo never runs. A hidden tab never starts it.
 */
export function usePatch(ref: RefObject<Element | null>) {
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [patch, setPatch] = useState<Patch>(START);
  const [touched, setTouched] = useState(false);
  const [run, setRun] = useState(0);
  const [manual, setManual] = useState(false);
  const timers = useRef<number[]>([]);

  const shown = still && !touched ? FINAL : patch;

  useEffect(() => {
    if (still || manual || !inView || hidden) return;
    const ids = timers.current;
    STEPS.forEach(([a, e], i) => {
      ids.push(window.setTimeout(() => setPatch((p) => ({ ...p, [a]: e })), 900 + i * 1500));
    });
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [still, manual, inView, hidden, run]);

  const swap = useCallback(
    (a: AgentKey) => {
      setManual(true);
      setTouched(true);
      setPatch({ ...shown, [a]: nextEngine(shown, a) });
    },
    [shown],
  );

  const replay = useCallback(() => {
    setManual(false);
    setTouched(false);
    setPatch(START);
    setRun((r) => r + 1);
  }, []);

  return { patch: shown, swap, replay, still };
}
