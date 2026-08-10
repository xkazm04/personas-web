"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, type BrandKey, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import type { Point, Rect } from "../layout";

/**
 * The shared vocabulary every module in the stylized app draws from: percent
 * placement, the target panel that glows when the brackets lock, and the
 * small state/health atoms (pills, dots, avatar stacks, bar strips) that make
 * a module read as product UI instead of a captioned box.
 * Type floor: nothing renders below text-base.
 */

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** Content header: section name on the left, a live hint on the right. */
export function SectionLabel({
  at,
  w,
  text,
  hint,
}: {
  at: Point;
  w: number;
  text: string;
  hint?: string;
}) {
  return (
    <div
      className="absolute flex items-baseline gap-2"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${w}%` }}
    >
      <span className={`${ANNOTATION_DIM} normal-case`}>{text}</span>
      {hint && (
        <span className="ml-auto hidden truncate text-base text-muted-dark sm:block">{hint}</span>
      )}
    </div>
  );
}

/** A walkthrough target: glows while locked — the rest is never dimmed. */
export function TargetPanel({
  rect,
  locked,
  className = "",
  children,
}: {
  rect: Rect;
  locked: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute flex overflow-hidden rounded-xl border transition-all duration-500 ${
        locked ? "border-glass-hover" : "border-glass"
      } ${className}`}
      style={{
        ...rectStyle(rect),
        backgroundColor: locked ? tint("cyan", 8) : undefined,
        boxShadow: locked ? brandShadow("cyan", 22, 24) : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** A status dot — optionally breathing while something is in flight. */
export function Dot({
  accent,
  pulse,
  reduced,
  className = "h-2 w-2",
}: {
  accent: BrandKey;
  pulse?: boolean;
  reduced?: boolean;
  className?: string;
}) {
  const live = pulse && !reduced;
  return (
    <motion.span
      className={`shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: BRAND_VAR[accent] }}
      animate={live ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
      transition={live ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      aria-hidden="true"
    />
  );
}

export type PillTone = "brand" | "ok" | "muted";

const PILL = "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-base";

/** Status / health pill — the state vocabulary shared by every module. */
export function StatePill({
  tone,
  label,
  pulse,
  reduced,
}: {
  tone: PillTone;
  label: string;
  pulse?: boolean;
  reduced?: boolean;
}) {
  if (tone === "muted") {
    return <span className={`${PILL} border-glass text-muted-dark`}>{label}</span>;
  }
  const accent: BrandKey = tone === "ok" ? "emerald" : "cyan";
  return (
    <span
      className={PILL}
      style={{
        borderColor: tint(accent, 40),
        backgroundColor: tint(accent, 10),
        color: BRAND_VAR[accent],
      }}
    >
      <Dot accent={accent} pulse={pulse} reduced={reduced} className="h-1.5 w-1.5" />
      {label}
    </span>
  );
}

/** Overlapping agent avatars — "these three run this template". */
export function AvatarStack({ tints = [32, 20, 12] }: { tints?: readonly number[] }) {
  return (
    <span className="flex shrink-0 items-center -space-x-1.5" aria-hidden="true">
      {tints.map((a) => (
        <span
          key={a}
          className="h-5 w-5 rounded-full border border-glass-hover"
          style={{ backgroundColor: tint("cyan", a) }}
        />
      ))}
    </span>
  );
}

/**
 * Bar strip — health per day on a card, run volume on the monitor.
 * The caller owns the box (`h-5 flex-1` inside a row, `h-8 w-full shrink-0`
 * inside a column): a baked-in `flex-1` lets a column parent collapse the
 * strip to a few pixels, which is exactly how it read before.
 */
export function MiniBars({
  points,
  className = "h-4",
  accentLast,
}: {
  points: readonly number[];
  className?: string;
  accentLast?: boolean;
}) {
  return (
    <span className={`flex min-w-0 items-end gap-1 ${className}`} aria-hidden="true">
      {points.map((p, i) => (
        <span
          key={i}
          className="min-w-0 flex-1 rounded-sm"
          style={{
            height: `${p}%`,
            backgroundColor: tint("cyan", accentLast && i === points.length - 1 ? 65 : 24),
          }}
        />
      ))}
    </span>
  );
}

/** Placeholder row — the list obviously continues past the fold. */
export function SkeletonRow({ widths }: { widths: readonly number[] }) {
  return (
    <span className="flex shrink-0 items-center gap-2" aria-hidden="true">
      {widths.map((w) => (
        <span
          key={w}
          className="h-2 rounded-full bg-foreground/10"
          style={{ width: `${w}%` }}
        />
      ))}
    </span>
  );
}
