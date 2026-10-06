"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { motion, type MotionValue } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import { fill } from "./motion";

/* Frame pieces shared by the timeline lab variants: the live heading through
 * SectionIntro, an aspect-locked art box whose SVG and HTML layers share one
 * coordinate system, the scenario picker and the small replay/pause chrome. */

export const useTimelineCopy = () => useTranslation().t.howSections.timeline;

export function Intro({ lede }: { lede: string }) {
  const h = useTimelineCopy().heading;
  return <SectionIntro heading={h.lead} gradient={h.gradient} trailing={h.trailing} description={lede} descriptionMaxWidth="max-w-3xl" className="mb-6" />;
}

/** The art, sized by the stage slot to its own aspect ratio (never taller than the slot). */
export function ArtBox({ w, h, boxRef, children, onPointerEnter, onPointerLeave }: {
  w: number;
  h: number;
  boxRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <div data-stage-slot className="max-lg:-mx-4 max-lg:overflow-x-auto max-lg:px-4">
      <div ref={boxRef} data-stage-art className="relative mx-auto w-full max-lg:min-w-[60rem]" style={{ "--art-ar": w / h } as CSSProperties} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
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

/** Marks designed art as not a screenshot. */
export function StylisedTag({ className = "" }: { className?: string }) {
  const label = useTimelineCopy().stylised;
  return <span className={`pointer-events-none absolute select-none font-mono text-xs uppercase tracking-[0.14em] text-muted-dark/80 ${className}`}>{label}</span>;
}

const ICON_BTN =
  "[@media(min-width:100rem)_and_(min-height:78rem)]:h-12 [@media(min-width:100rem)_and_(min-height:78rem)]:text-base flex h-10 items-center gap-2 rounded-full border border-glass bg-background/70 px-4 text-sm font-medium text-foreground/80 backdrop-blur transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:opacity-40";

export function ReplayButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  const label = useTimelineCopy().replay;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={ICON_BTN}>
      <RotateCcw className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

export function PauseButton({ paused, onClick, disabled = false }: { paused: boolean; onClick: () => void; disabled?: boolean }) {
  const c = useTimelineCopy();
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={paused} className={ICON_BTN}>
      {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
      {paused ? c.resume : c.pause}
    </button>
  );
}

/** Scenario picker: real buttons; the active one can carry the story clock as a fill. */
export function ScenarioChips({ names, index, onPick, progress, children }: {
  names: string[];
  index: number;
  onPick: (i: number) => void;
  progress?: MotionValue<number>;
  children?: ReactNode;
}) {
  const c = useTimelineCopy();
  return (
    <div className="relative z-10 mb-4 flex flex-wrap items-center justify-center gap-2" role="group" aria-label={c.scenariosLabel}>
      {names.map((name, i) => {
        const on = i === index;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={on}
            aria-label={fill(c.showScenario, { n: i + 1, name })}
            className={`relative h-10 overflow-hidden rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan 2xl:text-base [@media(min-width:100rem)_and_(min-height:78rem)]:h-12 [@media(min-width:100rem)_and_(min-height:78rem)]:px-5 [@media(min-width:100rem)_and_(min-height:78rem)]:text-lg ${
              on ? "border-brand-cyan/50 bg-brand-cyan/10 text-foreground" : "border-glass bg-background/50 text-foreground/75 hover:border-glass-hover hover:text-foreground"
            }`}
          >
            {on && progress && (
              <motion.span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-cyan" style={{ scaleX: progress }} />
            )}
            {name}
          </button>
        );
      })}
      {children}
    </div>
  );
}
