"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * Reveal phases for one card. Markup (server and first client paint) is always
 * "rest": the finished, fully visible state. Motion is armed on the client only.
 *
 * - rest   : server render, reduced motion, or already on screen at mount
 * - armed  : mounted below the fold; decorative marks wait hidden OFF-screen
 * - enter  : scrolled in after being armed; marks stagger in, mechanism plays
 * - replay : already on screen at mount (e.g. variant switched); only the
 *            mechanism plays, decorative marks stay at rest
 */
export type Phase = "rest" | "armed" | "enter" | "replay";

export function useRevealPhase(ref: RefObject<HTMLElement | null>): Phase {
  const still = useStillMotion();
  const [phase, setPhase] = useState<Phase>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (entry.isIntersecting) {
            setPhase("replay");
            io.disconnect();
          } else {
            setPhase("armed");
          }
          return;
        }
        if (entry.isIntersecting) {
          setPhase("enter");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, still]);

  return still ? "rest" : phase;
}

/** Inline style for one decorative mark: hidden while armed, staggered on enter. */
export function markStyle(phase: Phase, delayMs: number, from = "scale(0.6)"): CSSProperties {
  if (phase === "armed") return { opacity: 0, transform: from };
  if (phase === "enter") {
    return {
      opacity: 1,
      transform: "none",
      transition: "opacity 420ms ease-out, transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      transitionDelay: `${delayMs}ms`,
    };
  }
  return {};
}

/** True while the mechanism should run from its first beat. */
export function playsMechanism(phase: Phase): boolean {
  return phase === "enter" || phase === "replay";
}
