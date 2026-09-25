"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildFlowNodes } from "./data";
import type { ExamplePrompt, FlowNode, PlaygroundCopy, PlaygroundPhase } from "./types";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const STEP_DELAYS = [500, 700, 900, 800, 600, 500];
const DONE_RATIO = 0.7;
const TOTAL_DURATION_MS =
  STEP_DELAYS.reduce((sum, d) => sum + d, 0) +
  STEP_DELAYS[STEP_DELAYS.length - 1] * DONE_RATIO;

let invalidIdxReported = false;

export function usePlaygroundSimulation(examples: ExamplePrompt[], nodeLabels: PlaygroundCopy["nodes"]) {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [phase, setPhase] = useState<PlaygroundPhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  // When the current run started; the clock that displays it ticks on its own
  // (components/RunClock.tsx) so a run does not re-render the whole section.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isHidden = usePageVisibility();

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
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
      const reset = setTimeout(() => {
        setIsRunning(false);
        setPhase("idle");
        setStartedAt(null);
        setNodes([]);
        setActiveExample(null);
      }, 0);
      return () => clearTimeout(reset);
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
      const flowNodes = buildFlowNodes(example, nodeLabels);
      setNodes(flowNodes);
      setIsRunning(true);
      setPhase("running");
      setStartedAt(Date.now());

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
          }
        }, doneDelay);
        timeoutsRef.current.push(t2);
      });
    },
    [clearAll, examples, nodeLabels]
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
    setStartedAt(null);
  }, [clearAll]);

  return {
    activeExample,
    nodes,
    phase,
    isRunning,
    startedAt,
    totalDurationMs: TOTAL_DURATION_MS,
    handleExampleClick,
    handleReset,
  };
}
