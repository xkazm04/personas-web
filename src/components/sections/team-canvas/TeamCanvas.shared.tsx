"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, useInView, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";

/* Shared shell for the /illustrate round-3 team-canvas variants: the section
 * (stage fit "fill"), its heading, the variant's lede, and the stage slot the
 * art sizes itself inside. Throwaway with the switcher. */

const WORDS = { heading: "From goal to", headingGradient: "shipped", replay: "Replay the mission" } as const;

export function TeamCanvasShell({ lede, children }: { lede: string; children: ReactNode }) {
  return (
    <SectionWrapper fit="fill" id="team-canvas" aria-labelledby="team-canvas-heading">
      <div className="mb-8 text-center" data-section-intro>
        <SectionHeading id="team-canvas-heading">
          {WORDS.heading} <GradientText className="drop-shadow-lg">{WORDS.headingGradient}</GradientText>
        </SectionHeading>
        <p data-section-lede className="mx-auto mt-4 max-w-3xl text-base font-light leading-relaxed text-foreground/85 md:text-lg">
          {lede}
        </p>
      </div>
      <div data-stage-slot>{children}</div>
    </SectionWrapper>
  );
}

/** One progress value for a mechanism: rests at 1 (the finished mission) for the
 *  first paint and reduced motion; plays 0 -> 1 once when the art is in view. */
export function usePlayOnce(ref: RefObject<Element | null>, duration: number) {
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
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
    if (inView) play();
    return () => run.current?.stop();
  }, [inView, play]);

  return { p, play, still };
}

export function ReplayButton({ onClick, disabled, corner = "top" }: { onClick: () => void; disabled: boolean; corner?: "top" | "bottom" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={WORDS.replay}
      className={`absolute right-3 z-10 ${corner === "top" ? "top-3" : "bottom-3"} rounded-full border border-glass p-2 text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40`}
      style={{ backgroundColor: "rgba(var(--surface-overlay), 0.03)" }}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** Opacity ramps for beat lists. */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 1 inside [a, b), with short linear edges; b > 1 keeps the state at p = 1. */
export const within = (p: number, a: number, b: number, e = 0.015) =>
  clamp01(Math.min((p - a) / e, (b - p) / e));
export const after = (p: number, a: number, e = 0.03) => clamp01((p - a) / e);

/** The art's box: sized to its content (the drawing's aspect `ar` plus the
 *  frame's padding `padX` / `padY` in px), at most `maxW` px wide, and never
 *  taller than the stage slot. */
export function artStyle(ar: number, maxW: number, padX = 0, padY = 0) {
  return {
    "--art-ar": ar,
    width: `min(100%, calc((100cqh - ${4 + padY}px) * ${ar} + ${padX}px), ${maxW}px)`,
  } as CSSProperties;
}
