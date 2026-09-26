"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";

/** One progress value 0..1, resting at 1 (server render, reduced motion), played once in view. */
export function usePlayOnce(duration: number): {
  ref: RefObject<HTMLDivElement | null>;
  p: MotionValue<number>;
  replay: () => void;
  still: boolean;
} {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const replay = useCallback(() => {
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    p.set(0);
    run.current = animate(p, 1, { duration, ease: "linear" });
  }, [p, still, duration]);

  useEffect(() => {
    if (inView) replay();
    return () => run.current?.stop();
  }, [inView, replay]);

  return { ref, p, replay, still };
}
