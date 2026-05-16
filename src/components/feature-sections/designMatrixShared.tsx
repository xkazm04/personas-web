"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import {
  CELLS,
  USER_PROMPT,
  type CellKey,
} from "./design-matrix/designMatrixCells";

export {
  CELLS,
  USER_PROMPT,
  type CellDef,
  type CellKey,
} from "./design-matrix/designMatrixCells";

export type CellState = "pending" | "thinking" | "asking" | "answered" | "filled";

export interface CellStatus {
  state: CellState;
  answer?: number;
}

export interface PersonaMatrixState {
  statuses: Record<CellKey, CellStatus>;
  phase: "idle" | "running" | "done";
  userTyped: string;
  replay: () => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

function createPendingStatuses(): Record<CellKey, CellStatus> {
  return Object.fromEntries(
    CELLS.map((cell) => [cell.key, { state: "pending" as CellState }]),
  ) as Record<CellKey, CellStatus>;
}

export function usePersonaMatrixBuild(): PersonaMatrixState {
  const prefersReducedMotion = useReducedMotion();
  const [statuses, setStatuses] = useState<Record<CellKey, CellStatus>>(createPendingStatuses);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [userTyped, setUserTyped] = useState("");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRun = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const setCell = useCallback((key: CellKey, state: CellState) => {
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], state } }));
  }, []);

  const runBuild = useCallback(() => {
    clearAll();
    setPhase("running");
    setUserTyped("");
    setStatuses(createPendingStatuses());

    let cumulative = 0;
    const typeSpeed = 90;
    for (let i = 1; i <= USER_PROMPT.length; i++) {
      const timeout = setTimeout(
        () => setUserTyped(USER_PROMPT.slice(0, i)),
        cumulative,
      );
      timeoutsRef.current.push(timeout);
      cumulative += typeSpeed;
    }
    cumulative += 1200;

    CELLS.forEach((cell) => {
      const thinkTimeout = setTimeout(
        () => setCell(cell.key, "thinking"),
        cumulative,
      );
      timeoutsRef.current.push(thinkTimeout);
      cumulative += 1650;

      if (cell.question) {
        const askTimeout = setTimeout(() => setCell(cell.key, "asking"), cumulative);
        timeoutsRef.current.push(askTimeout);
        cumulative += 4200;

        const answerTimeout = setTimeout(
          () => setCell(cell.key, "answered"),
          cumulative,
        );
        timeoutsRef.current.push(answerTimeout);
        cumulative += 1800;
      }

      const fillTimeout = setTimeout(() => setCell(cell.key, "filled"), cumulative);
      timeoutsRef.current.push(fillTimeout);
      cumulative += 1200;
    });

    const doneTimeout = setTimeout(() => setPhase("done"), cumulative + 600);
    timeoutsRef.current.push(doneTimeout);
  }, [clearAll, setCell]);

  useEffect(() => {
    if (prefersReducedMotion || hasRun.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          runBuild();
          observer.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [runBuild, prefersReducedMotion]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const replay = useCallback(() => {
    hasRun.current = false;
    runBuild();
  }, [runBuild]);

  return { statuses, phase, userTyped, replay, sectionRef };
}
