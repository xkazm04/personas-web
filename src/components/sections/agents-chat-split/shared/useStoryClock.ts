"use client";

import { useCallback, useEffect, useReducer, useState, type RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";

/* One story clock for a How lab chat variant: which scenario is showing and how
 * many story seconds have passed since the customer hit send. It ticks only
 * while the art is on screen in a foreground tab; under reduced motion it rests
 * at the end of the story, so the still frame is the complete outcome and
 * nothing auto-advances. A picked scenario plays once and holds (auto-play off)
 * until the visitor resumes. */

const TICK_MS = 80;

interface State {
  index: number;
  t: number;
}
type Action =
  | { type: "tick"; dt: number; length: number; dwell: number; held: boolean; count: number }
  | { type: "select"; index: number };

function reduce(state: State, action: Action): State {
  if (action.type === "select") return { index: action.index, t: 0 };
  const { dt, length, dwell, held, count } = action;
  if (held && state.t >= length) return state;
  const t = state.t + dt;
  if (t >= length + dwell && !held) return { index: (state.index + 1) % count, t: 0 };
  return { index: state.index, t: held ? Math.min(t, length) : t };
}

interface Options {
  count: number;
  /** Story seconds until the scenario's last beat. */
  length: (index: number) => number;
  /** Story seconds per real second. */
  rate: number;
  /** Story seconds the finished frame holds before the next scenario. */
  dwell: number;
}

export function useStoryClock(ref: RefObject<Element | null>, { count, length, rate, dwell }: Options) {
  const still = useStillMotion();
  const visible = useIsVisible(ref);
  const [state, dispatch] = useReducer(reduce, { index: 0, t: 0 });
  const [held, setHeld] = useState(false);
  const len = length(state.index);
  const finished = state.t >= len;
  const ticking = !still && visible && !(held && finished);

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => {
      dispatch({ type: "tick", dt: (TICK_MS / 1000) * rate, length: len, dwell, held, count });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [ticking, rate, len, dwell, held, count]);

  const select = useCallback((index: number) => {
    setHeld(true);
    dispatch({ type: "select", index });
  }, []);
  const replay = useCallback(() => dispatch({ type: "select", index: state.index }), [state.index]);

  const t = still ? len : state.t;
  return {
    index: state.index,
    /** Story seconds since send. */
    t,
    still,
    /** The clock is ticking now (in view, foreground, not finished-and-held). */
    running: ticking,
    held,
    toggleHeld: () => setHeld((h) => !h),
    select,
    replay,
    /** 0..1 through the scenario including its dwell (drives the chip fill). */
    progress: still ? 1 : Math.min(1, state.t / (len + (held ? 0 : dwell))),
  };
}

export type StoryClock = ReturnType<typeof useStoryClock>;
