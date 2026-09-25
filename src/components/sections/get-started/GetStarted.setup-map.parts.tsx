"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { beat, dimToLit, type Progress } from "./GetStarted.shared";

/* Geometry and the reusable marks of the "setup-map" illustration (viewBox 900 x 420).
 * Your computer is the region x 12-730; the outside column is 740-900. */

export const VIEW_W = 900;
export const VIEW_H = 420;
export const REGION = { x: 12, y: 30, w: 718, h: 380 };

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The five stations, in step order, with the beat at which each lights. */
export const STATIONS = {
  install: { box: { x: 36, y: 86, w: 190, h: 110 }, at: 0.04, n: 1 },
  connect: { box: { x: 262, y: 86, w: 210, h: 110 }, at: 0.2, n: 2 },
  create: { box: { x: 508, y: 86, w: 198, h: 110 }, at: 0.36, n: 3 },
  run: { box: { x: 262, y: 256, w: 210, h: 136 }, at: 0.52, n: 4 },
  improve: { box: { x: 36, y: 256, w: 190, h: 136 }, at: 0.68, n: 5 },
} as const;
export type StationKey = keyof typeof STATIONS;

/** Claude Code is already on your computer before step 1: it is lit from the start. */
export const CLAUDE_CODE: Box = { x: 508, y: 272, w: 198, h: 84 };
export const OUTSIDE = {
  gmail: { x: 790, y: 112 },
  slack: { x: 790, y: 176 },
  claude: { x: 772, y: 286, w: 124, h: 64 },
};
/** Arrows between consecutive stations (drawn with the station they point to). */
export const ARROWS: { d: string; at: number }[] = [
  { d: "M 230 141 L 256 141", at: STATIONS.connect.at },
  { d: "M 476 141 L 502 141", at: STATIONS.create.at },
  { d: "M 560 200 C 540 232 500 240 478 252", at: STATIONS.run.at },
  { d: "M 258 324 L 232 324", at: STATIONS.improve.at },
];
/** Lines that leave your computer: the agent to Gmail and Slack, Claude Code to Claude. */
export const OUTBOUND = [
  { d: `M 706 124 C 730 124 740 ${OUTSIDE.gmail.y} ${OUTSIDE.gmail.x - 30} ${OUTSIDE.gmail.y}`, brand: "cyan" as BrandKey },
  { d: `M 706 168 C 730 168 740 ${OUTSIDE.slack.y} ${OUTSIDE.slack.x - 30} ${OUTSIDE.slack.y}`, brand: "cyan" as BrandKey },
  { d: `M 706 314 L ${OUTSIDE.claude.x} 316`, brand: "amber" as BrandKey },
];
export const OUT_AT = 0.82;

export function Lit({ p, at, children }: { p: Progress; at: number; children: ReactNode }) {
  const opacity = useTransform(p, (v) => dimToLit(v, at, 0.28));
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/** A line or arrow that draws itself at its beat. */
export function Draw({ p, at, d, color, head, dashed }: { p: Progress; at: number; d: string; color: string; head?: boolean; dashed?: boolean }) {
  const len = useTransform(p, (v) => beat(v, at, 0.1));
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      fill="none"
      markerEnd={head ? "url(#gs-map-head)" : undefined}
      strokeDasharray={dashed ? "5 6" : undefined}
      style={{ pathLength: len }}
    />
  );
}

export function Block({ box, brand, children }: { box: Box; brand: BrandKey | null; children?: ReactNode }) {
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={14}
        fill={brand ? tint(brand, 8) : "var(--background)"}
        stroke={brand ? tint(brand, 55) : "currentColor"}
        strokeOpacity={brand ? 1 : 0.3}
        strokeWidth={1.6}
        className="text-foreground"
      />
      {children}
    </g>
  );
}

/** The step number in a ring, with its verb, just above a station. */
export function Pin({ box, n, verb }: { box: Box; n: number; verb: string }) {
  const cx = box.x + 14;
  const cy = box.y - 22;
  return (
    <g>
      <circle cx={cx} cy={cy} r={13} fill={BRAND_VAR.cyan} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--background)">
        {n}
      </text>
      <T x={cx + 22} y={cy + 6} size={17} weight={700}>
        {verb}
      </T>
    </g>
  );
}

export function T({
  x,
  y,
  children,
  size = 16,
  weight = 600,
  anchor = "start",
  tone = "text-foreground",
  op = 0.92,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  tone?: string;
  op?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor} fill="currentColor" fillOpacity={op} className={tone}>
      {children}
    </text>
  );
}
