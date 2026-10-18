"use client";

import type { ReactNode, RefObject } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { beat } from "./useOnAir";
import { broadcastCopy } from "./copy";

/** Broadcast graphics type: heavy, slanted, condensed-feeling caps. */
export const CAPS = "font-sans font-black uppercase italic tracking-tight";
/** The same slant without the caps - for ids like v4.2, which keep their case. */
export const SLANT = "font-sans font-black italic tracking-tight";

/**
 * One broadcast package around a segment: the network bar (LIVE bug, network
 * and segment name, the segment's own meta on the right), the picture, and a
 * lower ticker. Every tab renders through it, so all four share one shape and
 * fill the same stage box.
 */
export function BroadcastFrame({
  rootRef,
  tone,
  segment,
  meta,
  live,
  moving,
  footer,
  children,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  tone: BrandKey;
  segment: string;
  meta?: ReactNode;
  live: boolean;
  moving: boolean;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      ref={rootRef}
      className="relative flex flex-col overflow-hidden rounded-xl border border-glass bg-background/80 backdrop-blur-xl stage:h-full"
      style={{ boxShadow: `0 1.5rem 4rem -2rem ${tint(tone, 30)}` }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left"
        style={{ background: `linear-gradient(90deg, ${BRAND_VAR[tone]}, ${tint(tone, 10)})` }}
        initial={moving ? { scaleX: 0 } : false}
        animate={{ scaleX: 1 }}
        transition={beat(moving, 0.6)}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-glass px-4 py-2.5 stage:py-2">
        <div className="flex items-center gap-2">
          <LiveBug live={live} />
          <Plate tone={tone} solid>
            {broadcastCopy.network}
          </Plate>
          <span className={`${CAPS} text-base text-foreground`}>{segment}</span>
        </div>
        {meta && <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm tabular-nums">{meta}</div>}
      </div>
      <div className="relative min-h-[24rem] stage:min-h-0 stage:flex-1">{children}</div>
      {footer}
    </div>
  );
}

/** The red LIVE bug. Its dot pulses only while the ambient gate allows it. */
export function LiveBug({ live }: { live: boolean }) {
  return (
    <span className="inline-flex -skew-x-12 items-center gap-1.5 rounded-sm px-2 py-0.5" style={{ background: tint("rose", 18), border: `1px solid ${tint("rose", 55)}` }}>
      <motion.span
        aria-hidden
        className="h-2 w-2 skew-x-12 rounded-full"
        style={{ background: BRAND_VAR.rose }}
        animate={live ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
        transition={live ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      />
      <span className={`${CAPS} skew-x-12 text-sm`} style={{ color: BRAND_VAR.rose }}>
        {broadcastCopy.live}
      </span>
    </span>
  );
}

/** A slanted name plate - the basic unit of every lower third and scorebug. */
export function Plate({ tone, solid = false, children, className = "" }: { tone: BrandKey; solid?: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex -skew-x-12 items-center rounded-sm px-2 py-0.5 ${className}`}
      style={
        solid
          ? { background: BRAND_VAR[tone], color: "var(--background)" }
          : { background: tint(tone, 14), color: BRAND_VAR[tone], border: `1px solid ${tint(tone, 45)}` }
      }
    >
      <span className={`${CAPS} skew-x-12 whitespace-nowrap text-sm`}>{children}</span>
    </span>
  );
}

/**
 * The lower ticker: a label plate and one line that wipes in each time it
 * changes - once per step, never a perpetual crawl. `children` holds the
 * segment's controls (replay, activate) at the right.
 */
export function Ticker({ label, tone, text, moving, children }: { label: string; tone: BrandKey; text: string; moving: boolean; children?: ReactNode }) {
  return (
    <div className="relative flex flex-wrap items-center gap-3 border-t border-glass bg-foreground/[0.03] px-4 py-2.5 stage:flex-nowrap stage:py-2">
      <Plate tone={tone} solid>
        {label}
      </Plate>
      <div className="min-w-[12rem] flex-1 overflow-hidden stage:min-w-0" aria-live="polite">
        <motion.p
          key={text}
          className="line-clamp-2 text-base font-medium leading-snug text-foreground/90"
          initial={moving ? { clipPath: "inset(0 100% 0 0)", x: 12 } : false}
          animate={{ clipPath: "inset(0 0% 0 0)", x: 0 }}
          transition={beat(moving, 0.55)}
        >
          {text}
        </motion.p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** A footer control in the broadcast style. */
export function OnAirButton({ tone, onClick, disabled, children, label }: { tone: BrandKey; onClick: () => void; disabled?: boolean; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${CAPS} inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:border-glass-hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40`}
      style={{ borderColor: tint(tone, 50), background: tint(tone, 12), color: BRAND_VAR[tone] }}
    >
      {children}
    </button>
  );
}

/**
 * A telestrator stroke: a slightly crooked chalk loop around its box, drawn
 * on by a left-to-right wipe (a clip, so the stroke keeps its width at any
 * box size - an SVG loop stretched to the box would not).
 */
export function FreehandRing({ tone, drawn, moving, delay = 0 }: { tone: BrandKey; drawn: boolean; moving: boolean; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-[50%] border-2"
      style={{ borderColor: BRAND_VAR[tone], rotate: -1.5, boxShadow: `0 0 0.75rem ${tint(tone, 30)}` }}
      initial={false}
      animate={{ clipPath: drawn ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)", opacity: drawn ? 1 : 0 }}
      transition={beat(moving, 0.7, delay)}
    />
  );
}
