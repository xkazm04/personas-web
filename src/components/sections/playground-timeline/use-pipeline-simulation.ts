"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { examples } from "./data";
import type { StageStatus, TimelinePhase } from "./types";

export function usePipelineSimulation() {
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>([]);
  const [phase, setPhase] = useState<TimelinePhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const runSimulation = useCallback(
    (exampleIdx: number, playbackSpeed: 1 | 2 = 1) => {
      clearAll();
      const example = examples[exampleIdx];
      const stageCount = example.stages.length;
      const initialStatuses: StageStatus[] = Array(stageCount).fill("locked");
      setStageStatuses(initialStatuses);
      setActiveStageIdx(-1);
      setIsRunning(true);
      setPhase("running");

      const speedMultiplier = 1 / playbackSpeed;
      let cumDelay = 0;

      example.stages.forEach((stage, idx) => {
        const activateDelay = cumDelay;

        const t1 = setTimeout(() => {
          setActiveStageIdx(idx);
          setStageStatuses((prev) => {
            const next = [...prev];
            next[idx] = "active";
            return next;
          });
        }, activateDelay * speedMultiplier);
        timeoutsRef.current.push(t1);

        const doneDuration = stage.duration;
        const t2 = setTimeout(() => {
          setStageStatuses((prev) => {
            const next = [...prev];
            next[idx] = "done";
            return next;
          });

          if (idx === stageCount - 1) {
            setIsRunning(false);
            setPhase("done");
          }
        }, (activateDelay + doneDuration) * speedMultiplier);
        timeoutsRef.current.push(t2);

        cumDelay += doneDuration;
      });
    },
    [clearAll]
  );

  const handleExampleClick = useCallback(
    (idx: number) => {
      if (isRunning) return;
      setActiveExample(idx);
      runSimulation(idx, speed);
    },
    [isRunning, runSimulation, speed]
  );

  const handleReset = useCallback(() => {
    clearAll();
    setActiveExample(null);
    setActiveStageIdx(-1);
    setStageStatuses([]);
    setIsRunning(false);
    setPhase("idle");
  }, [clearAll]);

  const handleReplay = useCallback(() => {
    if (activeExample === null || isRunning) return;
    runSimulation(activeExample, speed);
  }, [activeExample, isRunning, runSimulation, speed]);

  const toggleSpeed = useCallback(() => {
    setSpeed((s) => (s === 1 ? 2 : 1));
  }, []);

  return {
    activeExample,
    activeStageIdx,
    stageStatuses,
    phase,
    isRunning,
    speed,
    handleExampleClick,
    handleReset,
    handleReplay,
    toggleSpeed,
  };
}
