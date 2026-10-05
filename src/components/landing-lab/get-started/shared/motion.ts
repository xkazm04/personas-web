"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";

/* Timing helpers shared by the get-started lab variants. Every value rests at its
 * resolved end state in the server render and under reduced motion, so a still
 * frame is always the complete picture; no markup depends on the preference. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `at`, 1 once `at + span` is reached. */
export const beat = (v: number, at: number, span = 0.06) => clamp01((v - at) / span);

/**
 * One story progress value, 0 -> 1, played once when `ref` is 35% in view.
 * `play()` replays from 0; `seek(to)` glides to a point of the story.
 */
export function usePlay(ref: RefObject<Element | null>, duration: number) {
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const seek = useCallback(
    (to: number, from?: number) => {
      run.current?.stop();
      if (still) {
        p.set(1);
        return;
      }
      if (from !== undefined) p.set(from);
      const span = Math.abs(to - p.get());
      run.current = animate(p, to, { duration: Math.max(0.35, span * duration), ease: from === undefined ? "easeInOut" : "linear" });
    },
    [p, still, duration],
  );
  const play = useCallback(() => seek(1, 0), [seek]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(1);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => () => run.current?.stop(), []);

  return { p, play, seek, still };
}

/**
 * An ambient 0 -> 1 loop of `period` seconds. Runs only while `enabled`, in
 * view and in a foreground tab; under reduced motion it rests at `rest`.
 */
export function useLoop(ref: RefObject<Element | null>, period: number, rest: number, enabled = true): MotionValue<number> {
  const still = useStillMotion();
  const visible = useIsVisible(ref);
  const v = useMotionValue(rest);
  const running = !still && visible && enabled;

  useEffect(() => {
    if (still) {
      v.set(rest);
      return;
    }
    if (!running) return;
    let ctl: AnimationPlaybackControls | null = null;
    const lap = (from: number) => {
      ctl = animate(v, 1, {
        duration: period * (1 - from),
        ease: "linear",
        onComplete: () => {
          v.set(0);
          lap(0);
        },
      });
    };
    lap(v.get() >= 1 ? 0 : v.get());
    return () => ctl?.stop();
  }, [running, still, period, rest, v]);

  return v;
}
