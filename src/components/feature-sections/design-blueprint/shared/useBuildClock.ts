"use client";

import { useCallback, useEffect, useReducer, useState, type RefObject } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { DimKey } from "./dims";
import type { Step } from "./timeline";

type Answers = Partial<Record<DimKey, number>>;
interface State {
  at: number;
  run: number;
  answers: Answers;
  userPlayed: boolean;
}
type Action =
  | { type: "ARM" }
  | { type: "TICK" }
  | { type: "ANSWER"; dim: DimKey; i: number; advance: boolean }
  | { type: "REPLAY" };

function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "ARM":
      return s.at === -1 ? { ...s, at: 0 } : s;
    case "TICK":
      return { ...s, at: s.at + 1 };
    case "ANSWER":
      return { ...s, answers: { ...s.answers, [a.dim]: a.i }, at: a.advance ? s.at + 1 : s.at };
    case "REPLAY":
      return { at: 0, run: s.run + 1, answers: {}, userPlayed: true };
  }
}

const INITIAL: State = { at: -1, run: 0, answers: {}, userPlayed: false };
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const ARM_RATIO = 0.35;

/**
 * Drives one build: arms the first time the art is a third on screen, then
 * steps through the timeline - only while the art is on screen and the tab is
 * foregrounded. A question step waits for the visitor's answer (or takes the
 * suggested one when its beat runs out). Reduced motion rests on the finished
 * agent; Replay is the visitor asking for the motion, so it plays.
 */
export function useBuildClock(rootRef: RefObject<HTMLElement | null>, steps: Step[], still: boolean) {
  const [s, dispatch] = useReducer(reduce, INITIAL);
  const [inView, setInView] = useState(false);
  const hidden = usePageVisibility();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const seen = entry.intersectionRatio >= ARM_RATIO;
        setInView(seen);
        if (seen && !window.matchMedia(REDUCE_QUERY).matches) dispatch({ type: "ARM" });
      },
      { threshold: [0, ARM_RATIO, 0.7] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  const moving = !still || s.userPlayed;
  const at = moving ? s.at : steps.length;
  const ticking = moving && at >= 0 && at < steps.length && inView && !hidden;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setTimeout(() => dispatch({ type: "TICK" }), steps[at].ms);
    return () => window.clearTimeout(id);
  }, [ticking, at, s.run, steps]);

  const answer = useCallback(
    (dim: DimKey, i: number) => {
      const cur = steps[at];
      dispatch({ type: "ANSWER", dim, i, advance: cur?.kind === "ask" && cur.dim === dim });
    },
    [steps, at],
  );
  const replay = useCallback(() => dispatch({ type: "REPLAY" }), []);

  return {
    /** Current step index: -1 before arming, steps.length once finished. */
    at,
    done: at >= steps.length - 1,
    /** Animate transitions (false = jump to the end state, reduced motion). */
    moving,
    /** The clock is advancing (on screen, tab foregrounded). */
    ticking,
    run: s.run,
    answers: s.answers,
    answer,
    replay,
  };
}

export type BuildClock = ReturnType<typeof useBuildClock>;
