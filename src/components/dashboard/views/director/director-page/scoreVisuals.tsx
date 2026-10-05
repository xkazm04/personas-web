"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { scoreTone, sparklinePoints } from "./directorMeta";

/**
 * Inline SVG sparkline over an agent's recent 0–5 verdicts (oldest → newest),
 * anchored to the fixed verdict range with a trailing dot in the latest
 * score's tone. Falls back to an em dash under two scores.
 */
export function ScoreSparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return <span className="text-sm text-muted-dark">—</span>;
  const width = 64;
  const height = 20;
  const points = sparklinePoints(scores, width, height);
  const color = scoreTone(scores[scores.length - 1]).series;
  const [lastX, lastY] = points.split(" ").at(-1)!.split(",");
  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}

/** Signed review-over-review verdict delta; renders nothing at zero. */
export function ScoreDelta({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const rising = delta > 0;
  const Icon = rising ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${rising ? "text-brand-emerald" : "text-brand-rose"}`}
    >
      <Icon className="h-3 w-3" />
      {rising ? "+" : ""}
      {delta}
    </span>
  );
}
