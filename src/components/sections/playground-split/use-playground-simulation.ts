"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildFlowNodes, examples } from "./data";
import type { FlowNode, PlaygroundPhase } from "./types";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const STEP_DELAYS = [500, 700, 900, 800, 600, 500];
const DONE_RATIO = 0.7;
const TOTAL_DURATION_MS =
  STEP_DELAYS.reduce((sum, d) => sum + d, 0) +
  STEP_DELAYS[STEP_DELAYS.length - 1] * DONE_RATIO;

let invalidIdxReported = false;

export function usePlaygroundSimulation() {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [phase, setPhase] = useState<PlaygroundPhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isHidden = usePageVisibility();

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearAll, [clearAll]);

  // Tab background → cancel the simulation. Browser setTimeout throttling
  // on hidden tabs is platform-specific and unreliable: with the
  // simulation's all-timers-scheduled-up-front shape, a 5s background
  // returns to a finished animation that the user never saw. Cleaner UX
  // is to abort and let the user re-trigger when they come back.
  useEffect(() => {
    if (isHidden && isRunning) {
      clearAll();
      setIsRunning(false);
      setPhase("idle");
      setElapsedMs(0);
      setNodes([]);
      setActiveExample(null);
    }
  }, [isHidden, isRunning, clearAll]);

  const runSimulation = useCallback(
    (exampleIdx: number) => {
      const example =
        Number.isInteger(exampleIdx) &&
        exampleIdx >= 0 &&
        exampleIdx < examples.length
          ? examples[exampleIdx]
          : undefined;
      if (!example) {
        if (!invalidIdxReported) {
          invalidIdxReported = true;
          captureExceptionScrubbed(
            new Error(
              `usePlaygroundSimulation: invalid exampleIdx (length=${examples.length})`,
            ),
          );
        }
        return;
      }
      clearAll();
      const flowNodes = buildFlowNodes(example);
      setNodes(flowNodes);
      setIsRunning(true);
      setPhase("running");
      setElapsedMs(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Math.min(Date.now() - startTime, TOTAL_DURATION_MS));
      }, 50);

      const toolIds = flowNodes
        .filter((n) => n.id.startsWith("tool-"))
        .map((n) => n.id);
      const sequence = [
        ["parse"],
        ["select"],
        toolIds,
        ["execute"],
        ["verify"],
        ["result"],
      ];

      let cumDelay = 0;

      sequence.forEach((group, stepIdx) => {
        cumDelay += STEP_DELAYS[stepIdx];
        const activateDelay = cumDelay;

        const t1 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "active" as const } : n
            )
          );
        }, activateDelay);
        timeoutsRef.current.push(t1);

        const doneDelay = activateDelay + STEP_DELAYS[stepIdx] * DONE_RATIO;
        const t2 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "done" as const } : n
            )
          );

          if (stepIdx === sequence.length - 1) {
            setIsRunning(false);
            setPhase("done");
            setElapsedMs(TOTAL_DURATION_MS);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }, doneDelay);
        timeoutsRef.current.push(t2);
      });
    },
    [clearAll]
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      // Refuse to start a simulation against a hidden tab — the all-
      // timers-scheduled-up-front shape would race ahead invisibly and
      // produce a "done already?" surprise on tab refocus.
      if (typeof document !== "undefined" && document.hidden) return;
      setActiveExample(idx);
      runSimulation(idx);
    },
    [isRunning, runSimulation]
  );

  const handleReset = useCallback(() => {
    clearAll();
    setActiveExample(null);
    setNodes([]);
    setIsRunning(false);
    setPhase("idle");
    setElapsedMs(0);
  }, [clearAll]);

  return {
    activeExample,
    nodes,
    phase,
    isRunning,
    elapsedMs,
    totalDurationMs: TOTAL_DURATION_MS,
    handleExampleClick,
    handleReset,
  };
}
