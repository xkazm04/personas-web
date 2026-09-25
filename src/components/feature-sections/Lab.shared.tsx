"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Transition } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useStillMotion } from "@/hooks/useStillMotion";
import type { BrandKey } from "@/lib/brand-theme";

/*
 * Shared by the three /illustrate r3 Lab variants (head-to-head, ratings, anatomy).
 *
 * useBeats: a once-in-view beat player. The resting state - first paint, reduced
 * motion, a hidden tab - is the LAST beat, so the finished picture is what renders
 * before any script decides otherwise. When the art scrolls into view it rewinds to
 * beat 0 and steps forward on timers; `pick` jumps to a beat (step controls) and
 * `play` replays. Every setState runs in an observer or timer callback.
 */
export function useBeats(count: number, stepMs: number) {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [beat, setBeat] = useState(count - 1);

  const stop = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    stop();
    if (still || document.hidden) {
      setBeat(count - 1);
      return;
    }
    setBeat(0);
    for (let i = 1; i < count; i++) {
      timers.current.push(window.setTimeout(() => setBeat(i), i * stepMs));
    }
  }, [count, stepMs, still, stop]);

  const pick = useCallback(
    (i: number) => {
      stop();
      setBeat(i);
    },
    [stop],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        play();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [play, stop]);

  return { ref, beat, play, pick, still };
}

/** Motion for a beat change: instant under reduced motion. */
export const ease = (still: boolean, delay = 0, duration = 0.5): Transition =>
  still ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] };

/** The desktop Lab's rating colours (VersionRatingCell.scoreColor): >= 80, >= 60, below. */
export const scoreKey = (v: number): BrandKey => (v >= 80 ? "emerald" : v >= 60 ? "amber" : "rose");

/** One stage: heading with a gradient tail, a plain lede, and the art slot. */
export function LabStage({
  heading,
  gradient,
  lede,
  children,
}: {
  heading: string;
  gradient: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <SectionWrapper fit="fill" id="lab">
      <div className="text-center" data-section-intro>
        <SectionHeading>
          {heading}
          <GradientText className="drop-shadow-lg">{gradient}</GradientText>
        </SectionHeading>
        <p
          data-section-lede
          className="mx-auto mt-4 max-w-3xl text-base font-light leading-relaxed text-foreground/85 md:text-lg"
        >
          {lede}
        </p>
      </div>
      <div data-stage-slot className="flex flex-col items-center justify-center">
        {children}
      </div>
    </SectionWrapper>
  );
}

export function ReplayButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-glass bg-foreground/[0.03] text-foreground/60 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
