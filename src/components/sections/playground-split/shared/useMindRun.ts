"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useRunClock, scriptEnd, type RunScript } from "@/lib/run-script";
import { localizeExamples } from "@/components/sections/playground-split/data";
import type { NodeStatus, PlaygroundPhase } from "@/components/sections/playground-split/types";
import { playgroundSectionCopy } from "@/i18n/pending/playgroundSection";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/**
 * The live section's simulation (sections/playground-split/
 * use-playground-simulation.ts), re-expressed as one step counter so a
 * variant can stage it: the same six beats in the same order, the same
 * active -> done rhythm (DONE_RATIO), the same rules - it cannot be
 * re-entered while running, and plays the first prompt once when the panel is
 * half on screen (never under reduced motion). `pace` stretches the live
 * timings so a staged beat has room to read. The beats are data driven by the
 * shared virtual clock in lib/run-script; unlike the live section, a hidden
 * tab pauses the run instead of aborting it.
 */
export const BEATS = ["parse", "select", "tools", "execute", "verify", "result"] as const;
export type BeatId = (typeof BEATS)[number];

const STEP_DELAYS = [500, 700, 900, 800, 600, 500];
const DONE_RATIO = 0.7;

/** Beat i turns active after the cumulative delays through i and settles DONE_RATIO of its delay later. */
function buildScript(delays: number[]): RunScript {
  let at = 0;
  return {
    beats: delays.map((d, i) => {
      at += d;
      return { id: BEATS[i], start: at, duration: d * DONE_RATIO };
    }),
  };
}

export function useMindRun(panelRef: RefObject<HTMLElement | null>, pace = 1) {
  const reduced = useStillMotion();
  const isHidden = usePageVisibility();
  const copy = playgroundSectionCopy;
  const lab = landingSectionsCopy.agentMind;
  const examples = useMemo(() => localizeExamples(copy), [copy]);

  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const delays = useMemo(() => STEP_DELAYS.map((d) => Math.round(d * pace)), [pace]);
  const script = useMemo(() => buildScript(delays), [delays]);
  const totalMs = scriptEnd(script);

  // One virtual clock: a hidden tab pauses the run where it stands and the
  // visitor returns to it, rather than the run aborting to idle.
  const clock = useRunClock(script, { paused: isHidden });
  const { frame } = clock;
  const phase: PlaygroundPhase =
    clock.status === "idle" ? "idle" : frame.finished ? "done" : "running";
  const isRunning = phase === "running";
  const step = clock.status === "idle" ? -1 : frame.index;
  const stepDone = clock.status !== "idle" && frame.settled;

  const reset = useCallback(() => {
    clock.reset();
    setActiveExample(null);
    setStartedAt(null);
  }, [clock.reset]); // eslint-disable-line react-hooks/exhaustive-deps -- reset is stable

  const start = useCallback(
    (idx: number) => {
      if (isRunning || idx < 0 || idx >= examples.length) return;
      setActiveExample(idx);
      setStartedAt(Date.now());
      clock.start();
    },
    [isRunning, examples.length, clock.start], // eslint-disable-line react-hooks/exhaustive-deps -- start is stable
  );

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
