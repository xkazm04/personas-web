"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import {
  breakableConnections,
  connections,
  healingStages,
} from "./data";
import type { ConnectionStatus, NodeStatus } from "./types";

export function useHealingCycle() {
  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(-1);
  const [brokenConnectionId, setBrokenConnectionId] = useState(
    breakableConnections[0],
  );
  const [cycleIndex, setCycleIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let currentCycle = 0;

    const cycle = () => {
      const nextConnection =
        breakableConnections[currentCycle % breakableConnections.length];
      setBrokenConnectionId(nextConnection);
      setCycleIndex(currentCycle);
      setActiveStage(-1);

      let step = 0;
      const run = () => {
        timerRef.current = setTimeout(
          () => {
            setActiveStage(step);
            step++;
            if (step < healingStages.length) {
              run();
            } else {
              currentCycle++;
              timerRef.current = setTimeout(cycle, 3500);
            }
          },
          step === 0 ? 1200 : 2200,
        );
      };
      run();
    };
    cycle();
    return () => clearTimeout(timerRef.current);
  }, [prefersReducedMotion]);

  const getConnectionStatus = useCallback(
    (connId: string): ConnectionStatus => {
      if (connId !== brokenConnectionId) return "healthy";
      if (activeStage === -1) return "healthy";
      if (activeStage === 0) return "broken";
      if (activeStage === 1) return "diagnosing";
      if (activeStage === 2) return "repairing";
      return "healthy";
    },
    [activeStage, brokenConnectionId],
  );

  const getNodeStatus = useCallback(
    (nodeId: string): NodeStatus => {
      if (activeStage < 0) return "healthy";
      const conn = connections.find((c) => c.id === brokenConnectionId);
      if (!conn) return "healthy";
      if (nodeId === conn.from || nodeId === conn.to) {
        if (activeStage === 0) return "error";
        if (activeStage === 1) return "warning";
        if (activeStage === 2) return "healing";
        return "healthy";
      }
      return "healthy";
    },
    [activeStage, brokenConnectionId],
  );

  return {
    activeStage,
    brokenConnectionId,
    cycleIndex,
    getConnectionStatus,
    getNodeStatus,
  };
}
