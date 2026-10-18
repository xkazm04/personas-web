"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { usePageVisibility } from "@/hooks/usePageVisibility";

/*
 * Clocks for the Specimen plates, in the sibling sections' motion language:
 * an ambient loop runs only while motion is allowed, the tab is foregrounded
 * and the plate is on screen; a sequence the visitor starts refuses to start
 * in a hidden tab; every still frame is the complete, resolved picture.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `from`, 1 at `to`, linear between. */
export const beat = (v: number, from: number, to: number) => clamp01((v - from) / (to - from));

const tabIsHidden = () => typeof document !== "undefined" && document.hidden;

/** Whether an ambient loop may run (useIsVisible folds in tab visibility). */
export function useCultureGate(ref: RefObject<Element | null>) {
  const still = useStillMotion();
  const visible = useIsVisible(ref, { threshold: 0.25 });
  return { still, running: !still && visible };
}

/**
 * A step counter advanced by a re-armed timeout while `running`; pausing
 * leaves the current step on screen. `durationOf` must be module-stable.
 * `loop: false` stops at the last step instead of wrapping.
 */
export function useStepClock(
  count: number,
  durationOf: (step: number) => number,
  running: boolean,
  initial: number,
  loop = true,
) {
  const [step, setStep] = useState(initial);
  useEffect(() => {
    if (!running) return;
    if (!loop && step >= count - 1) return;
    const id = setTimeout(() => setStep((s) => (loop ? (s + 1) % count : Math.min(count - 1, s + 1))), durationOf(step));
    return () => clearTimeout(id);
  }, [running, step, count, durationOf, loop]);
  /** Visitor-started restart: refused while the tab is hidden. */
  const restart = useCallback(() => {
    if (tabIsHidden()) return;
    setStep(0);
  }, []);
  return [step, setStep, restart] as const;
}

/**
 * One growth progress value 0 -> 1, played once when the plate is 30% in
 * view, parked while the tab is hidden, resolved to 1 under reduced motion.
 * `play()` regrows from 0 (refused in a hidden tab).
 */
export function useGrowth(ref: RefObject<Element | null>, duration: number) {
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const p = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const done = useRef(false);

  const play = useCallback(() => {
    if (tabIsHidden()) return;
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    done.current = false;
    p.set(0);
    run.current = animate(p, 1, {
      duration,
      ease: "linear",
      onComplete: () => {
        done.current = true;
      },
    });
  }, [p, still, duration]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(1);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => {
    const c = run.current;
    if (!c || done.current) return;
    if (hidden) c.pause();
    else c.play();
  }, [hidden]);

  useEffect(() => () => run.current?.stop(), []);

  return { p, play, still };
}
