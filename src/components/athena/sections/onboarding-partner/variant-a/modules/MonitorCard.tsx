"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { BAR_POINTS, CHART_POINTS, COPY } from "../data";
import type { Rect } from "../layout";
import { MiniBars, StatePill, rectStyle } from "./primitives";

/**
 * Monitoring module — dashboard texture, not a captioned sparkline: header
 * with a live pill, a three-up stat row (runs / success / avg duration), the
 * gradient area chart that draws itself in on mount, and a run-volume bar
 * series underneath. md+ only.
 *
 * Motion is gated: reduced motion renders the finished chart with no draw-in
 * and a steady live dot.
 */

const W = 100;
const H = 24;

const linePath = (): string => {
  const step = W / (CHART_POINTS.length - 1);
  return CHART_POINTS.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y}`).join(" ");
};

export function MonitorCard({ rect, reduced }: { rect: Rect; reduced: boolean }) {
  const uid = useId();
  const c = COPY.canvas;
  const Icon = c.activityIcon;
  const line = linePath();
  return (
    <div
      className="absolute hidden flex-col gap-2 rounded-xl border border-glass px-3 py-2.5 md:flex"
      style={rectStyle(rect)}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
        <span className="truncate text-base font-semibold text-foreground">{c.activityLabel}</span>
        <span className="ml-auto">
          <StatePill tone="brand" label={c.activityPill} pulse reduced={reduced} />
        </span>
      </div>

      <div className="flex items-end gap-3">
        {c.stats.map((s) => (
          <span key={s.label} className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xl font-semibold tabular-nums text-foreground">
              {s.value}
            </span>
            <span className={`truncate normal-case ${ANNOTATION_DIM}`}>{s.label}</span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="min-h-0 w-full flex-1"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-spark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint("cyan", 35)} />
            <stop offset="100%" stopColor={tint("cyan", 0)} />
          </linearGradient>
        </defs>
        {/* Gradient area fades up under the line */}
        <motion.path
          d={`${line} L${W} ${H} L0 ${H} Z`}
          fill={`url(#${uid}-spark)`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, delay: 0.7 }}
        />
        {/* The line draws itself in */}
        <motion.path
          d={line}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 1.4, ease: "easeInOut" }}
        />
      </svg>

      <MiniBars points={BAR_POINTS} className="h-8 w-full shrink-0" accentLast />
    </div>
  );
}
