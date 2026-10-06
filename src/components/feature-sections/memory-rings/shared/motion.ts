"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";

/* Timing helpers shared by the memory lab variants. Every progress value rests
 * at its resolved end state in the server render and under reduced motion, so
 * a still frame is always the complete picture; no markup depends on the
 * preference. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `from`, 1 at `to`, linear between. */
export const beat = (v: number, from: number, to: number) => clamp01((v - from) / (to - from));
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * One story progress value, 0 -> `end`, played once when `ref` is 35% in view.
 * `play()` replays from 0; `seek(to)` glides to a point of the story and holds.
 */
export function usePlay(ref: RefObject<Element | null>, duration: number, end = 1) {
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const p = useMotionValue(end);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const seek = useCallback(
    (to: number, from?: number) => {
      run.current?.stop();
      if (still) {
        p.set(to);
        return;
      }
      if (from !== undefined) p.set(from);
      const span = Math.abs(to - p.get()) / end;
      run.current = animate(p, to, {
        duration: Math.max(0.4, span * duration),
        ease: from === undefined ? "easeInOut" : "linear",
      });
    },
    [p, still, duration, end],
  );
  const play = useCallback(() => seek(end, 0), [seek, end]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(end);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p, end]);

  useEffect(() => () => run.current?.stop(), []);

  return { p, play, seek, still };
}
