"use client";

import { motion } from "framer-motion";

/**
 * One phosphor trace: a wide, faint bloom under a crisp core, both drawn by
 * path length so a new reading sweeps on from left to right. `drawn` false
 * renders the trace complete (zero duration) - the still frame is the whole
 * picture, with the same DOM.
 */
export default function Trace({
  d,
  color,
  glow,
  width = 2.25,
  dim = false,
  dashed = false,
  drawn = true,
  duration = 1.1,
  delay = 0,
}: {
  d: string;
  color: string;
  glow: string;
  width?: number;
  dim?: boolean;
  dashed?: boolean;
  drawn?: boolean;
  duration?: number;
  delay?: number;
}) {
  const t = drawn ? { duration, delay, ease: [0.45, 0, 0.2, 1] as const } : { duration: 0 };
  return (
    <g style={{ opacity: dim ? 0.3 : 1, transition: "opacity 400ms" }}>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={dashed ? 0 : 0.2}
        strokeWidth={width * 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: drawn ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={t}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "4 5" : undefined}
        filter={dashed ? undefined : `url(#${glow})`}
        initial={dashed ? { opacity: drawn ? 0 : 1 } : { pathLength: drawn ? 0 : 1 }}
        animate={dashed ? { opacity: 1 } : { pathLength: 1 }}
        transition={t}
      />
    </g>
  );
}

/** Round to 0.01 so the server's and the browser's floating point agree. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
export function smooth(points: readonly { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${r2(points[0].x)} ${r2(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r2(c1x)} ${r2(c1y)}, ${r2(c2x)} ${r2(c2y)}, ${r2(p2.x)} ${r2(p2.y)}`;
  }
  return d;
}

/** Straight segments through points (a stepped/polyline trace). */
export function polyline(points: readonly { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${r2(p.x)} ${r2(p.y)}`).join(" ");
}
