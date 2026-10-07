"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { RotateCcw } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import { memorySectionCopy } from "@/i18n/pending/memorySection";

/* Frame pieces shared by the memory lab variants: the live section shell (its
 * `memory-layers` id, heading and lede), an aspect-locked art box whose SVG
 * layer and HTML text layer share one coordinate system (viewBox units), and
 * the small replay button and "stylised" tag. */

export function MemoryShell({ children }: { children: ReactNode }) {
  const copy = memorySectionCopy;
  return (
    <SectionWrapper fit="fill" id="memory-layers" className="overflow-hidden">
      <div className="relative z-10 text-center" data-section-intro>
        <SectionHeading>
          {copy.heading} <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
        </SectionHeading>
        <p data-section-lede className="mx-auto mt-4 max-w-2xl text-base font-light text-foreground/85 md:text-lg 2xl:text-xl">
          {copy.lede}
        </p>
      </div>
      {children}
    </SectionWrapper>
  );
}

/**
 * The art, sized by the stage slot to its own aspect ratio (never taller than
 * the slot). Children are positioned in viewBox units through `place`/`fs`.
 * Carries the guided tour's `data-tour-diagram="memory"` anchor.
 */
export function ArtBox({
  w,
  h,
  boxRef,
  label,
  children,
}: {
  w: number;
  h: number;
  boxRef?: RefObject<HTMLDivElement | null>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10" data-stage-slot>
      <div
        ref={boxRef}
        data-stage-art
        data-tour-diagram="memory"
        role="group"
        aria-label={label}
        className="relative mx-auto mt-8 w-full max-w-6xl lg:mt-0"
        style={{ "--art-ar": w / h } as CSSProperties}
      >
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

export function ReplayButton({ onClick, disabled, style }: { onClick: () => void; disabled: boolean; style?: CSSProperties }) {
  const label = memorySectionCopy.replay;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={style}
      className="absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border border-glass bg-background/70 text-foreground/70 backdrop-blur transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:opacity-40"
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** The small tag that marks designed art as not a screenshot. */
export function StylisedTag({ style }: { style: CSSProperties }) {
  const label = useTranslation().t.featuresSections.memory.stylised;
  return (
    <span aria-hidden className="pointer-events-none select-none font-mono uppercase tracking-[0.14em] text-muted-dark/80" style={style}>
      {label}
    </span>
  );
}
