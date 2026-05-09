"use client";

import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import {
  FLASH_DURATION_MS,
  TICK_BASE_DELAY_MS,
  TICK_RANDOM_RANGE_MS,
} from "./constants";

interface TickableAgent {
  status: string;
  executions: number;
}

export function useAgentTicker<T extends TickableAgent>(initialAgents: T[]) {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  const tick = useCallback(() => {
    const idx = Math.floor(Math.random() * initialAgents.length);
    const bump = 1 + Math.floor(Math.random() * 3);
    setAgents((prev) => {
      const next = [...prev];
      const agent = { ...next[idx] };
      agent.executions += bump;
      if (agent.status !== "healing" && Math.random() < 0.2) {
        agent.status = agent.status === "running" ? "idle" : "running";
      }
      next[idx] = agent;
      return next;
    });
    if (!prefersReducedMotion) {
      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), FLASH_DURATION_MS);
    }
  }, [prefersReducedMotion, initialAgents.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = TICK_BASE_DELAY_MS + Math.random() * TICK_RANDOM_RANGE_MS;
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, prefersReducedMotion]);

  return { agents, flashIdx, prefersReducedMotion };
}
