"use client";

import { useCallback, useEffect, useMemo, useReducer, useState, type RefObject } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { DimKey } from "./dims";
import { clockReducer, INITIAL_CLOCK, type Step } from "./timeline";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const ARM_RATIO = 0.35;

/**
 * Drives one build: arms the first time the art is a third on screen, then
 * steps through the timeline - only while the art is on screen and the tab is
 * foregrounded. A question step waits for the visitor's answer (or takes the
 * suggested one when its beat runs out). Reduced motion rests on the finished
 * agent; Replay is the visitor asking for the motion, so it plays. Once
 * stamped, `revise` re-answers a question and replays only the finale.
 */
export function useBuildClock(rootRef: RefObject<HTMLElement | null>, steps: Step[], still: boolean) {
  const reduce = useMemo(() => clockReducer(steps), [steps]);
  const [s, dispatch] = useReducer(reduce, INITIAL_CLOCK);
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
  /**
   * Re-answer a question on the stamped sheet. With motion it replays the
   * finale only; under reduced motion, or while the tab is hidden (a re-run the
   * visitor starts must not start unseen), the parts re-ink in place and the
   * finale shows its end pose.
   */
  const revise = useCallback(
    (dim: DimKey, i: number) => {
      if (moving && !document.hidden) dispatch({ type: "REVISE", dim, i });
      else dispatch({ type: "ANSWER", dim, i, advance: false, revised: true });
    },
    [moving],
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
    /** The sheet is finished and stamped: revision is offered. */
    stamped: at >= steps.length,
    run: s.run,
    build: s.build,
    revised: s.revised,
    answers: s.answers,
    answer,
    revise,
    replay,
  };
}

export type BuildClock = ReturnType<typeof useBuildClock>;
