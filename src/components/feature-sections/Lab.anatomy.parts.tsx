"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { ease } from "./Lab.shared";

/* Pieces of the "anatomy" lab variant: the weighted parts of a rating, a stacked
 * column, a reference line across the plot, and a key entry. */

/** score_weights.rs SCORE_WEIGHTS, bottom of the stack first. */
export const PARTS: { key: BrandKey; weight: number }[] = [
  { key: "cyan", weight: 0.4 },
  { key: "purple", weight: 0.4 },
  { key: "amber", weight: 0.2 },
];

/** The composite rating, rounded as the desktop table shows it. */
export const rate = (scores: readonly number[]) =>
  Math.round(scores.reduce((sum, s, i) => sum + s * PARTS[i].weight, 0));

export function Column({
  scores,
  rating,
  grown,
  chipsOn,
  chip,
  still,
  delay,
}: {
  scores: readonly number[];
  rating: number;
  grown: boolean;
  chipsOn: boolean;
  chip?: { text: string; key: BrandKey; icon?: LucideIcon };
  still: boolean;
  delay: number;
}) {
  const Icon = chip?.icon;
  return (
    <div className="flex h-full flex-col items-center justify-end">
      {chip && (
        <motion.span
          initial={false}
          animate={{ opacity: chipsOn ? 1 : 0, y: chipsOn ? 0 : 6 }}
          transition={ease(still, 0, 0.4)}
          className="relative z-10 mb-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold sm:text-sm"
          style={{
            color: BRAND_VAR[chip.key],
            backgroundColor: `color-mix(in srgb, ${BRAND_VAR[chip.key]} 16%, var(--background))`,
          }}
        >
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
          {chip.text}
        </motion.span>
      )}
      {/* The stack: each part's height is its weighted score, so the parts add up to the rating. */}
      <motion.div
        initial={false}
        animate={{ scaleY: grown ? 1 : 0 }}
        transition={ease(still, delay, 0.6)}
        className="flex w-full max-w-[88px] shrink-0 flex-col-reverse overflow-hidden rounded-t-md"
        style={{ height: `${rating}%`, transformOrigin: "50% 100%" }}
      >
        {PARTS.map((p, i) => (
          <span
            key={p.key}
            className="block w-full border-t border-background/40 first:border-t-0"
            style={{ height: `${((scores[i] * p.weight) / rating) * 100}%`, backgroundColor: tint(p.key, 72) }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function Line({
  at,
  label,
  shown,
  still,
  dashed,
  color,
  below,
}: {
  at: number;
  label: string;
  shown: boolean;
  still: boolean;
  dashed?: boolean;
  color?: string;
  below?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${at}%` }}>
      <motion.span
        initial={false}
        animate={{ scaleX: shown ? 1 : 0 }}
        transition={ease(still, 0, 0.6)}
        className={`absolute inset-x-0 block border-t-2 ${dashed ? "border-dashed" : ""} ${color ? "" : "border-foreground/60"}`}
        style={{ borderColor: color, transformOrigin: "0% 50%" }}
      />
      <motion.span
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={ease(still, shown ? 0.4 : 0, 0.3)}
        className={`absolute right-0 whitespace-nowrap text-xs font-semibold sm:text-sm ${
          below ? "top-1" : "bottom-1"
        } ${color ? "" : "text-foreground/85"}`}
        style={{ color }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function Key({ color, name, weight }: { color: BrandKey; name: string; weight: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: tint(color, 72) }} aria-hidden />
      <span className="text-sm font-medium text-foreground sm:text-base">{name}</span>
      <span className="sm:ml-auto font-mono text-sm font-semibold tabular-nums text-foreground/70 sm:text-base">{weight}</span>
    </div>
  );
}
