"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";

/*
 * Shared frame for the /illustrate r3 healing variants: the stage section, its
 * heading and lede, and an art frame sized in em. On the desktop stage the art's
 * font-size follows the slot's height (`100cqh / emTall`, clamped 15-22px), so a
 * composition `emTall` em high always fits the slot and is never scaled past its
 * content: labels at 0.8em stay >= 12px on a 1366x657 laptop. Below the stage
 * the art is plain 13-14px flow (labels >= 10px on a phone).
 *
 * One progress value p drives every beat. It rests at 1 (the finished picture)
 * for the server render and reduced motion, and plays 0 -> 1 once when in view.
 */

export function useOncePlay(duration: number) {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
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

/** 0 -> 1 while p crosses [a, b]; clamped. */
export function useWindow(p: MotionValue<number>, a: number, b: number) {
  return useTransform(p, [a, b], [0, 1]);
}

/** Grows from its left edge while p crosses [a, b]. */
export function Grow({
  p,
  a,
  b,
  className,
  style,
  children,
}: {
  p: MotionValue<number>;
  a: number;
  b: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const scaleX = useWindow(p, a, b);
  return (
    <motion.div className={className} style={{ ...style, scaleX, originX: 0 }}>
      {children}
    </motion.div>
  );
}

/** Fades (and settles 0.3em) in while p crosses [a, b]. */
export function Fade({
  p,
  a,
  b,
  className,
  style,
  rise = 0,
  children,
}: {
  p: MotionValue<number>;
  a: number;
  b: number;
  className?: string;
  style?: CSSProperties;
  rise?: number;
  children?: ReactNode;
}) {
  const opacity = useWindow(p, a, b);
  const y = useTransform(opacity, (v) => `${(1 - v) * rise}em`);
  return (
    <motion.div className={className} style={{ ...style, opacity, y }}>
      {children}
    </motion.div>
  );
}

/** The words every variant supplies (its `WORDS` const). */
export interface ShellWords {
  heading: string;
  headingGradient: string;
  lede: string;
  artLabel: string;
  replay: string;
}

export default function HealingShell({
  words,
  emTall,
  maxEm,
  artRef,
  onReplay,
  still,
  phoneButtonRow = true,
  children,
}: {
  words: ShellWords;
  /** Height of the composition in em (the stage font-size divisor). */
  emTall: number;
  /** Width cap of the composition in em. */
  maxEm: number;
  artRef: RefObject<HTMLDivElement | null>;
  onReplay: () => void;
  still: boolean;
  /** Phones: give the replay button its own row above the art (off when its corner is free). */
  phoneButtonRow?: boolean;
  children: ReactNode;
}) {
  return (
    <SectionWrapper fit="fill" id="healing-circuit" className="relative overflow-hidden">
      <div className="relative z-10 text-center" data-section-intro>
        <SectionHeading>
          {words.heading} <GradientText className="drop-shadow-lg">{words.headingGradient}</GradientText>
        </SectionHeading>
        <p
          data-section-lede
          className="mx-auto mt-4 max-w-3xl text-base font-light leading-relaxed text-foreground/85 md:text-lg"
        >
          {words.lede}
        </p>
      </div>

      <div data-stage-slot className="relative z-10 mt-8 stage:mt-0 stage:flex stage:flex-col stage:justify-center">
        <div
          ref={artRef}
          className="relative mx-auto w-full text-[13px] md:text-[14px] stage:[font-size:clamp(15px,calc(100cqh/var(--art-em)),22px)]"
          style={{ "--art-em": emTall, maxWidth: `${maxEm}em` } as CSSProperties}
        >
          <div
            data-illustrate-art
            data-tour-diagram="healing"
            role="img"
            aria-label={words.artLabel}
            className={`rounded-2xl border border-glass bg-white/[0.02] px-[1.1em] pb-[1.2em] md:px-[1.6em] md:pt-[1.2em] ${phoneButtonRow ? "pt-[2.8em]" : "pt-[1.2em]"}`}
          >
            {children}
          </div>
          <button
            type="button"
            onClick={onReplay}
            disabled={still}
            aria-label={words.replay}
            className="absolute right-[0.6em] top-[0.6em] flex h-7 w-7 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
