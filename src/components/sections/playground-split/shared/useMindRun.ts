"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "@/i18n/useTranslation";
import { localizeExamples } from "@/components/sections/playground-split/data";
import type { NodeStatus, PlaygroundPhase } from "@/components/sections/playground-split/types";

/**
 * The live section's simulation (sections/playground-split/
 * use-playground-simulation.ts), re-expressed as one step counter so a
 * variant can stage it: the same six beats in the same order, the same
 * active -> done rhythm (DONE_RATIO), the same rules - it refuses to start
 * while the tab is hidden, aborts to idle if the tab hides mid-run, cannot be
 * re-entered while running, and plays the first prompt once when the panel is
 * half on screen (never under reduced motion). `pace` stretches the live
 * timings so a staged beat has room to read.
 */
export const BEATS = ["parse", "select", "tools", "execute", "verify", "result"] as const;
export type BeatId = (typeof BEATS)[number];

const STEP_DELAYS = [500, 700, 900, 800, 600, 500];
const DONE_RATIO = 0.7;

export function useMindRun(panelRef: RefObject<HTMLElement | null>, pace = 1) {
  const reduced = useStillMotion();
  const isHidden = usePageVisibility();
  const { t } = useTranslation();
  const copy = t.playgroundSection;
  const lab = t.landingSections.agentMind;
  const examples = useMemo(() => localizeExamples(copy), [copy]);

  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [step, setStep] = useState(-1);
  const [stepDone, setStepDone] = useState(false);
  const [phase, setPhase] = useState<PlaygroundPhase>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const delays = useMemo(() => STEP_DELAYS.map((d) => Math.round(d * pace)), [pace]);
  const totalMs = delays.reduce((s, d) => s + d, 0) + delays[delays.length - 1] * DONE_RATIO;
  const isRunning = phase === "running";

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearAll, [clearAll]);

  const toIdle = useCallback(() => {
    setActiveExample(null);
    setStep(-1);
    setStepDone(false);
    setPhase("idle");
    setStartedAt(null);
  }, []);

  // A hidden tab aborts the run (the timers are scheduled up front and would
  // otherwise finish unseen); the visitor re-triggers on return.
  useEffect(() => {
    if (!(isHidden && isRunning)) return;
    clearAll();
    const id = setTimeout(toIdle, 0);
    return () => clearTimeout(id);
  }, [isHidden, isRunning, clearAll, toIdle]);

  const start = useCallback(
    (idx: number) => {
      if (isRunning || idx < 0 || idx >= examples.length) return;
      if (typeof document !== "undefined" && document.hidden) return;
      clearAll();
      setActiveExample(idx);
      setStep(-1);
      setStepDone(false);
      setPhase("running");
      setStartedAt(Date.now());
      let at = 0;
      delays.forEach((d, i) => {
        at += d;
        timers.current.push(setTimeout(() => { setStep(i); setStepDone(false); }, at));
        timers.current.push(
          setTimeout(() => {
            setStepDone(true);
            if (i === delays.length - 1) setPhase("done");
          }, at + d * DONE_RATIO),
        );
      });
    },
    [isRunning, examples.length, clearAll, delays],
  );

  const reset = useCallback(() => { clearAll(); toIdle(); }, [clearAll, toIdle]);

  // First prompt plays once when `panelRef` (the diagram) is half on screen.
  const inView = useInView(panelRef, { once: true, amount: 0.5 });
  const autoplayed = useRef(false);
  useEffect(() => {
    if (!inView || reduced || autoplayed.current) return;
    autoplayed.current = true;
    const id = setTimeout(() => start(0), 700);
    return () => clearTimeout(id);
  }, [inView, reduced, start]);

  const statusOf = useCallback(
    (beat: number): NodeStatus => {
      if (beat < step || (beat === step && stepDone)) return "done";
      return beat === step ? "active" : "pending";
    },
    [step, stepDone],
  );

  /** The beat under attention: the running one, or the last finished one. */
  const focus = Math.max(step, 0);
  const shown = examples[activeExample ?? 0];

  return {
    copy, lab, examples, reduced,
    activeExample, example: shown, phase, isRunning, step, stepDone, focus,
    statusOf, startedAt, totalMs, start, reset,
  };
}

export type MindRun = ReturnType<typeof useMindRun>;
