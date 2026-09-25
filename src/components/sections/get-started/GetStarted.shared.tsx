"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";

/* Shared by the /illustrate r3 get-started variants: the intro (heading id the
 * landing address resolver needs), a play-once progress value and a replay button. */

export const HEADING = { lead: "From download to", gradient: "running agents" } as const;

export function GetStartedIntro({ lede }: { lede: string }) {
  return (
    <div className="text-center" data-section-intro>
      <SectionHeading id="get-started-heading">
        {HEADING.lead} <GradientText className="drop-shadow-lg">{HEADING.gradient}</GradientText>
      </SectionHeading>
      <p
        data-section-lede
        className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-foreground/85 md:text-lg"
      >
        {lede}
      </p>
    </div>
  );
}

/**
 * One progress value, 0 -> 1, played once when `ref` comes into view. It rests at
 * 1 (the resolved end state) in the server render and under reduced motion.
 */
export function usePlayOnce(ref: RefObject<Element | null>, duration: number) {
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

export function ReplayButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `at`, 1 once `at + span` is reached. */
export const beat = (v: number, at: number, span = 0.06) => clamp01((v - at) / span);
/** Dim until reached: a mark is always legible, and lights up at its beat. */
export const dimToLit = (v: number, at: number, dim = 0.3) => dim + (1 - dim) * beat(v, at);

export type Progress = MotionValue<number>;

/** Brand marks (Simple Icons paths, 24-unit box), drawn in currentColor. */
export const MARK_PATHS = {
  gmail:
    "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
  slack:
    "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z",
} as const;

/** A brand mark placed in SVG user space, `size` units square, centred on (x, y). */
export function Mark({ name, x, y, size }: { name: keyof typeof MARK_PATHS; x: number; y: number; size: number }) {
  const s = size / 24;
  return (
    <path
      d={MARK_PATHS[name]}
      fill="currentColor"
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}
    />
  );
}
