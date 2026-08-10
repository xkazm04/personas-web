"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, type BrandKey, tint } from "@/lib/brand-theme";
import { STEP } from "@/components/athena/stage/stages";

/**
 * The small state/health atoms every module draws from — pills, dots, avatar
 * stacks, bar strips — the things that make a module read as product UI
 * instead of a captioned box. Placement and reveal live in `./shell`.
 * Type floor: nothing renders below text-base.
 */

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

/**
 * Status / health pill — the state vocabulary shared by every module. `glyph`
 * replaces the leading dot when a state has something better to say than
 * "something is here": a spinner mid-handshake, a drawn check once it lands.
 */
export function StatePill({
  tone,
  label,
  pulse,
  glyph,
  reduced,
}: {
  tone: PillTone;
  label: string;
  pulse?: boolean;
  glyph?: ReactNode;
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
      {glyph ?? <Dot accent={accent} pulse={pulse} reduced={reduced} className="h-1.5 w-1.5" />}
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
 *
 * The bars GROW left to right when they arrive — a strip is a series, so it
 * should be read as one. `scaleY` keeps that off the layout entirely.
 */
export function MiniBars({
  points,
  className = "h-4",
  accentLast,
  reduced,
  lead = 0,
}: {
  points: readonly number[];
  className?: string;
  accentLast?: boolean;
  reduced?: boolean;
  lead?: number;
}) {
  return (
    <span className={`flex min-w-0 items-end gap-1 ${className}`} aria-hidden="true">
      {points.map((p, i) => (
        <motion.span
          key={i}
          className="min-w-0 flex-1 origin-bottom rounded-sm"
          style={{
            height: `${p}%`,
            backgroundColor: tint("cyan", accentLast && i === points.length - 1 ? 65 : 24),
          }}
          initial={reduced ? false : { scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={
            reduced ? { duration: 0 } : { duration: 0.4, delay: lead + i * (STEP * 0.6) }
          }
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
