"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildFlowNodes, examples } from "./data";
import type { FlowNode, PlaygroundPhase } from "./types";

export function usePlaygroundSimulation() {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [phase, setPhase] = useState<PlaygroundPhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const runSimulation = useCallback(
    (exampleIdx: number) => {
      clearAll();
      const example = examples[exampleIdx];
      const flowNodes = buildFlowNodes(example);
      setNodes(flowNodes);
      setIsRunning(true);
      setPhase("running");
      setElapsedMs(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
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
      const delays = [500, 700, 900, 800, 600, 500];

      sequence.forEach((group, stepIdx) => {
        cumDelay += delays[stepIdx];
        const activateDelay = cumDelay;

        const t1 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "active" as const } : n
            )
          );
        }, activateDelay);
        timeoutsRef.current.push(t1);

        const doneDelay = activateDelay + delays[stepIdx] * 0.7;
        const t2 = setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              group.includes(n.id) ? { ...n, status: "done" as const } : n
            )
          );

          if (stepIdx === sequence.length - 1) {
            setIsRunning(false);
            setPhase("done");
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
    handleExampleClick,
    handleReset,
  };
}
