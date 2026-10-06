"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { BRAND_VAR } from "@/lib/brand-theme";

/* Timing and palette shared by the timeline lab variants. Every story value
 * rests at its resolved end (p = 1) under reduced motion, so a still frame is
 * always the complete picture; no markup depends on the preference. */

export const FG = "var(--foreground)";
export const BG = "var(--background)";
export const RULES = BRAND_VAR.rose;
export const WARN = BRAND_VAR.amber;
export const AGENT = BRAND_VAR.emerald;
export const CYAN = BRAND_VAR.cyan;
export const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of `p` through the window [a, b], clamped to 0..1. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
/** Rounded so the numbers stay stable across renders. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));

type StoryOptions = {
  /** Seconds the finished story holds before the next scenario plays. */
  hold?: number;
  /** Freezes the clock and the auto-advance (a Pause control). */
  paused?: boolean;
  /** Stops only the auto-advance (pointer over the art). */
  holdCycle?: boolean;
};

/**
 * One story clock per scenario: `p` runs 0 -> 1 over `durationOf(index)`
 * seconds once the art is 30% in view, then the next scenario plays after
 * `hold`. Picking a scenario plays it and stops the auto-advance. The clock
 * pauses off-screen and in a hidden tab; under reduced motion `p` rests at 1
 * and nothing advances on its own.
 */
export function useStory(ref: RefObject<Element | null>, count: number, durationOf: (i: number) => number, opts: StoryOptions = {}) {
  const { hold = 3.5, paused = false, holdCycle = false } = opts;
  const still = useStillMotion();
  const visible = useIsVisible(ref);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [picked, setPicked] = useState(false);
  const [doneKey, setDoneKey] = useState("");
  const p = useMotionValue(1);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const key = `${index}:${run}`;
  const duration = durationOf(index);
  const halted = paused || !visible;

  useEffect(() => {
    ctl.current?.stop();
    ctl.current = null;
    if (still) {
      p.set(1);
      return;
    }
    if (!inView) return;
    p.set(0);
    const c = animate(p, 1, {
      duration,
      ease: "linear",
      onComplete: () => {
        ctl.current = null;
        setDoneKey(key);
      },
    });
    ctl.current = c;
    return () => c.stop();
  }, [key, still, inView, duration, p]);

  useEffect(() => {
    const c = ctl.current;
    if (!c) return;
    if (halted) c.pause();
    else c.play();
  }, [halted, key, inView]);

  const done = still || doneKey === key;
  const auto = !still && !picked && !paused && !holdCycle && visible && done && count > 1;
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), hold * 1000);
    return () => clearTimeout(t);
  }, [auto, hold, count]);

  const choose = useCallback((i: number) => {
    setIndex(i);
    setPicked(true);
    setRun((r) => r + 1);
  }, []);
  const replay = useCallback(() => setRun((r) => r + 1), []);

  return { p, index, choose, replay, done, still, picked };
}
