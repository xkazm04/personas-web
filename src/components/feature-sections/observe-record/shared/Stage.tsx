"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";

/* Frame pieces shared by the observe lab variants: the live section's heading
 * (its identity), an aspect-locked art box whose SVG layer and HTML layer share
 * one coordinate system (viewBox units), and the small chrome every variant
 * needs. The art box carries the guided tour's `data-tour-diagram="observe"`. */

export function Intro({ lede }: { lede: string }) {
  const copy = useTranslation().t.observeSection;
  return (
    <div className="text-center" data-section-intro>
      <SectionHeading>
        {copy.heading} <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
      </SectionHeading>
      <p data-section-lede className="mx-auto mt-4 max-w-4xl text-balance text-base leading-relaxed text-foreground/85 md:text-lg 2xl:text-xl">
        {lede}
      </p>
    </div>
  );
}

/** The art, sized by the stage slot to its own aspect ratio (never taller than the slot). */
export function ArtBox({
  w,
  h,
  boxRef,
  children,
}: {
  w: number;
  h: number;
  boxRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div data-stage-slot>
      <div
        ref={boxRef}
        data-stage-art
        data-tour-diagram="observe"
        className="relative mx-auto w-full"
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
    /** Absolute position (top-left) and optional size, in viewBox units. */
    place: (x: number, y: number, width?: number, height?: number): CSSProperties => ({
      position: "absolute",
      left: pct(x, w),
      top: pct(y, h),
      width: width === undefined ? undefined : pct(width, w),
      height: height === undefined ? undefined : pct(height, h),
    }),
    /** A font size of `n` viewBox units, never below `min` px. */
    fs: (n: number, min: number): CSSProperties => ({ fontSize: `max(${min}px, calc(${n} * 100cqw / ${w}))` }),
  };
}

/** The small tag that marks designed data as stylised, not a screenshot. */
export function StylisedTag({ style, className = "" }: { style: CSSProperties; className?: string }) {
  const label = useTranslation().t.featuresSections.observe.stylised;
  return (
    <span className={`pointer-events-none select-none font-mono uppercase tracking-[0.14em] text-muted-dark ${className}`} style={style}>
      {label}
    </span>
  );
}

/** A connector's real brand mark from /public/tools, as a CSS mask so it takes `currentColor`. */
export function ToolMark({ icon, className = "", style }: { icon: string; className?: string; style?: CSSProperties }) {
  const mask = `url(/tools/${icon}.svg) center / contain no-repeat`;
  return <span aria-hidden="true" className={`block bg-current ${className}`} style={{ WebkitMask: mask, mask, ...style }} />;
}
