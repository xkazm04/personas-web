"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { RotateCcw } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";

/* Frame pieces shared by the models lab variants: the section intro (the live
 * heading template with its product names as gradient text), an aspect-locked
 * art box whose SVG and HTML layers share one coordinate system, and the small
 * replay / "stylised" chrome. */

const HEADING_NAMES: Record<string, string> = { "{claude}": "Claude", "{ollama}": "Ollama" };

export function Intro({ lede }: { lede: string }) {
  const heading = useTranslation().t.aiModelsSection.heading;
  return (
    <div className="text-center" data-section-intro>
      <SectionHeading>
        {heading.split(/(\{claude\}|\{ollama\})/).map((part, i) =>
          HEADING_NAMES[part] ? (
            <GradientText key={i} className="drop-shadow-lg">
              {HEADING_NAMES[part]}
            </GradientText>
          ) : (
            part
          ),
        )}
      </SectionHeading>
      <p data-section-lede className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-foreground/85 md:text-lg 2xl:text-xl">
        {lede}
      </p>
    </div>
  );
}

/** The art, sized by the stage slot to its own aspect ratio (never taller than the slot). */
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
  const label = useTranslation().t.aiModelsSection.replay;
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

/** Marks designed art as not a screenshot. */
export function StylisedTag({ className = "" }: { className?: string }) {
  const label = useTranslation().t.featuresSections.models.stylised;
  return (
    <span className={`pointer-events-none absolute select-none font-mono text-xs uppercase tracking-[0.14em] text-muted-dark/80 ${className}`}>
      {label}
    </span>
  );
}
