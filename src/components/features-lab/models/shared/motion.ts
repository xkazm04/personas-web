"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { BRAND_VAR } from "@/lib/brand-theme";

/* Timing and palette shared by the models lab variants. Every value rests at its
 * resolved end state in the server render and under reduced motion, so a still
 * frame is always the complete picture; no markup depends on the preference. */

/** Claude is drawn warm, Ollama (on-device, private) in emerald. */
export const CLAUDE = BRAND_VAR.amber;
export const LOCAL = BRAND_VAR.emerald;
export const FG = "var(--foreground)";
export const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number) => t * t * (3 - 2 * t);
/** Rounded so server and browser trig agree to the digit (hydration). */
export const r2 = (n: number) => Math.round(n * 100) / 100;

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
    run.current = animate(p, 1, { duration, ease: "linear" });
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
 * An ambient 0 -> 1 loop of `period` seconds. Runs only in view and in a
 * foreground tab; under reduced motion it rests at `rest`.
 */
export function useLoop(ref: RefObject<Element | null>, period: number, rest: number): MotionValue<number> {
  const still = useStillMotion();
  const visible = useIsVisible(ref);
  const v = useMotionValue(rest);
  const running = !still && visible;

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
