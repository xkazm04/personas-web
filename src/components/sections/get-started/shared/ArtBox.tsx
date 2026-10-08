"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { RotateCcw } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { getStartedSectionCopy } from "@/i18n/pending/getStartedSection";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/* Frame pieces shared by the get-started lab variants: the section intro (keeps
 * the live heading and its `get-started-heading` id, which the landing's address
 * resolver finds the section by), and an aspect-locked art box whose SVG layer
 * and HTML text layer share one coordinate system (viewBox units). */

export function Intro({ lede }: { lede: string }) {
  const copy = getStartedSectionCopy;
  return (
    <div className="text-center" data-section-intro>
      <SectionHeading id="get-started-heading">
        {copy.heading} <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
      </SectionHeading>
      <p data-section-lede className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-foreground/85 md:text-lg 2xl:text-xl">
        {lede}
      </p>
    </div>
  );
}

/**
 * The art, sized by the stage slot to its own aspect ratio (never taller than
 * the slot). Children are positioned in viewBox units through `place`/`fs`.
 */
export function ArtBox({ w, h, boxRef, children }: { w: number; h: number; boxRef?: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div data-stage-slot>
      <div ref={boxRef} data-stage-art className="relative mx-auto w-full" style={{ "--art-ar": w / h } as CSSProperties}>
        <div className="relative w-full [container-type:inline-size]" style={{ aspectRatio: `${w} / ${h}` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Position helpers for an art box of `w` x `h` viewBox units. */
export function frame(w: number, h: number) {
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return {
    /** Absolute position (top-left) and optional width, in viewBox units. */
    place: (x: number, y: number, width?: number): CSSProperties => ({
      position: "absolute",
      left: pct(x, w),
      top: pct(y, h),
      width: width === undefined ? undefined : pct(width, w),
    }),
    /** A font size of `n` viewBox units, never below `min` px. */
    fs: (n: number, min: number): CSSProperties => ({ fontSize: `max(${min}px, calc(${n} * 100cqw / ${w}))` }),
  };
}

export function ReplayButton({ onClick, disabled, className = "" }: { onClick: () => void; disabled: boolean; className?: string }) {
  const label = landingSectionsCopy.getStarted.replay;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border border-glass bg-background/70 text-foreground/70 backdrop-blur transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:opacity-40 ${className}`}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** The small "stylised" tag that marks designed art as not a screenshot. */
export function StylisedTag({ style }: { style: CSSProperties }) {
  const label = landingSectionsCopy.getStarted.stylised;
  return (
    <span className="pointer-events-none select-none font-mono uppercase tracking-[0.14em] text-muted-dark/80" style={style}>
      {label}
    </span>
  );
}
