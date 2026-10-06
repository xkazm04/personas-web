"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useLoopGate } from "@/hooks/useLoopGate";

/* Timing helpers shared by the observe lab variants. Every value rests at its
 * resolved end state in the first render and under reduced motion, so a still
 * frame is always the complete picture; no markup depends on the preference. */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `at`, 1 once `at + span` is reached. */
export const beat = (v: number, at: number, span = 0.06) => clamp01((v - at) / span);

/** One story progress value, 0 -> 1, played once when `ref` is 35% in view; `play()` replays. */
export function usePlay(ref: RefObject<Element | null>, duration: number) {
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    p.set(0);
    run.current = animate(p, 1, { duration, ease: "easeInOut" });
  }, [p, still, duration]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(1);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => () => run.current?.stop(), []);

  return { p, play, still };
}

/**
 * A monotonic clock in seconds for feeds that accumulate (counts, spend). Runs
 * only while the loop gate lets it; pausing keeps the time. Under reduced
 * motion it rests at `rest`.
 */
export function useClock(ref: RefObject<Element | null>, rest: number): MotionValue<number> {
  const { run, still } = useLoopGate(ref);
  const v = useMotionValue(rest);

  useEffect(() => {
    if (still) {
      v.set(rest);
      return;
    }
    if (!run) return;
    const ctl = animate(v, v.get() + 3600, { duration: 3600, ease: "linear" });
    return () => ctl.stop();
  }, [run, still, rest, v]);

  return v;
}

/** Deterministic PRNG (mulberry32) for stylised data built at module scope. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
