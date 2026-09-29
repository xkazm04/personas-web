"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * A step in a scripted sequence:
 *  - a number waits that many milliseconds,
 *  - a function runs once,
 *  - `{ t }` is called every frame with the elapsed ms since the previous frame
 *    and holds the sequence until it returns true (continuous motion, easing).
 */
export type Step = number | (() => void) | { t: (dt: number) => boolean };

/**
 * Runs scripted sequences on animation frames, so a hidden tab pauses the
 * sequence instead of letting it skip ahead. `run` cancels the one in flight.
 * Under reduced motion `run` does nothing: figures show their finished frame.
 */
export function useSequencer() {
  const still = useStillMotion();
  const token = useRef(0);

  const cancel = useCallback(() => {
    token.current += 1;
  }, []);

  const run = useCallback(
    (steps: Step[]) => {
      if (still) return;
      const mine = ++token.current;
      let i = 0;
      let acc = 0;
      let last = -1;

      const frame = (ts: number) => {
        if (mine !== token.current) return;
        let dt = last < 0 ? 0 : Math.min(64, ts - last);
        last = ts;
        while (i < steps.length) {
          const s = steps[i];
          if (typeof s === "number") {
            acc += dt;
            dt = 0;
            if (acc >= s) {
              dt = acc - s;
              acc = 0;
              i += 1;
            } else break;
          } else if (typeof s === "function") {
            s();
            i += 1;
            if (mine !== token.current) return;
          } else if (s.t(dt)) {
            i += 1;
            dt = 0;
          } else break;
        }
        if (i < steps.length) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
    [still],
  );

  useEffect(() => cancel, [cancel]);
  return { run, cancel };
}
