"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";

/* Frame pieces shared by the "Built to grow" lab variants: the section shell
 * (the live `platform-layers` id, eyebrow and heading), an aspect-locked art
 * box whose SVG layer and HTML text layer share one coordinate system, and the
 * tag that marks designed art as stylised. */

export function LayersShell({ lede, children }: { lede: string; children: ReactNode }) {
  const c = useTranslation().t.howLab.layers;
  return (
    <SectionWrapper fit="fill" id="platform-layers" className="overflow-clip">
      <SectionIntro
        eyebrow={c.eyebrow}
        eyebrowBrand="purple"
        heading={c.heading}
        gradient={c.headingGradient}
        trailing={c.headingTrailing}
        description={lede}
        descriptionMaxWidth="max-w-3xl"
      />
      {children}
    </SectionWrapper>
  );
}

/**
 * The art, sized by the stage slot to its own aspect ratio (never taller than
 * the slot). Children are positioned in design units through `frame()`.
 */
export function ArtBox({
  w,
  h,
  label,
  boxRef,
  children,
}: {
  w: number;
  h: number;
  label: string;
  boxRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10" data-stage-slot>
      <div
        ref={boxRef}
        data-stage-art
        role="group"
        aria-label={label}
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

/** Position helpers for an art box of `w` x `h` design units. */
export function frame(w: number, h: number) {
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return {
    /** Absolute box in design units. */
    box: (x: number, y: number, bw?: number, bh?: number): CSSProperties => ({
      position: "absolute",
      left: pct(x, w),
      top: pct(y, h),
      width: bw === undefined ? undefined : pct(bw, w),
      height: bh === undefined ? undefined : pct(bh, h),
    }),
    /** A length of `n` design units, as CSS. */
    u: (n: number) => `calc(${n} * 100cqw / ${w})`,
    /** A font size of `n` design units, never below `min` px. */
    fs: (n: number, min: number): CSSProperties => ({ fontSize: `max(${min}px, calc(${n} * 100cqw / ${w}))` }),
  };
}

/** The small tag that marks designed art as not a screenshot. */
export function StylisedTag({ style }: { style?: CSSProperties }) {
  const label = useTranslation().t.howLab.layers.stylised;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute select-none font-mono text-xs uppercase tracking-[0.16em] text-muted-dark"
      style={style}
    >
      {label}
    </span>
  );
}
