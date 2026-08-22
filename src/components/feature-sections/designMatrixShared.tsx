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

function createFilledStatuses(): Record<CellKey, CellStatus> {
  return Object.fromEntries(
    CELLS.map((cell) => [
      cell.key,
      { state: "filled" as CellState, answer: cell.question?.picked },
    ]),
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

  const showFinal = useCallback(() => {
    clearAll();
    setUserTyped(USER_PROMPT);
    setStatuses(createFilledStatuses());
    setPhase("done");
  }, [clearAll]);

  useEffect(() => {
    if (hasRun.current) return;
    const el = sectionRef.current;
    if (!el) return;
    // Both branches are driven from the observer callback — an external-system
    // callback — rather than from the effect body, so no state is written
    // synchronously during the effect.
    //
    // This component is server-rendered (DesignEngine is a static, above-the-fold
    // import), so the reduced-motion end-state cannot be derived during render or
    // seeded in a lazy initialiser: `useReducedMotion()` reads the media query on
    // the client only, and the server always emits the pending skeleton. Deciding
    // post-mount is what keeps hydration in sync.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          // Reduced motion: skip the timed build and jump straight to the
          // resolved end-state, so the section carries its full content the
          // moment it is on screen instead of a permanently pending skeleton.
          if (prefersReducedMotion) showFinal();
          else runBuild();
          observer.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [runBuild, showFinal, prefersReducedMotion]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const replay = useCallback(() => {
    hasRun.current = false;
    // Under reduced motion replay must also use the instant path, otherwise
    // it would start the very animation the user opted out of.
    if (prefersReducedMotion) {
      showFinal();
    } else {
      runBuild();
    }
  }, [runBuild, showFinal, prefersReducedMotion]);

  return { statuses, phase, userTyped, replay, sectionRef };
}
