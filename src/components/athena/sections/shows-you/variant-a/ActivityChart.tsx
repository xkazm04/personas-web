"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CHART_POINTS, COPY, type Rect } from "./data";

/**
 * Monitoring module — a miniature gradient-area sparkline that draws itself
 * in on mount (hand-rolled SVG; gated: reduced motion renders the finished
 * chart). Header row: activity icon + label + run stat + live pill.
 */

const W = 100;
const H = 24;

function linePath(): string {
  const step = W / (CHART_POINTS.length - 1);
  return CHART_POINTS.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y}`).join(" ");
}

export function ActivityChart({ rect, reduced }: { rect: Rect; reduced: boolean }) {
  const uid = useId();
  const c = COPY.canvas;
  const Icon = c.activityIcon;
  const line = linePath();
  return (
    <div
      className="absolute hidden flex-col gap-1.5 rounded-xl border border-glass p-3 lg:flex"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 shrink-0 text-brand-cyan" aria-hidden="true" />
        <span className="text-base text-muted-dark">{c.activityLabel}</span>
        <span className="ml-auto font-mono text-base text-foreground/70">{c.activityStat}</span>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-glass px-2 py-0.5 text-base text-brand-cyan"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
            transition={reduced ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          {c.activityPill}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="min-h-0 w-full flex-1" aria-hidden="true">
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
    </div>
  );
}
