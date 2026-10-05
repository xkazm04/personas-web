"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { beat } from "../shared/motion";
import AgentLoop from "./AgentLoop";
import Landmarks from "./Landmarks";
import { H, STOPS, TRAIL_D, W, pointAt, walkShare } from "./trailGeometry";

/* The map layer of V1: contour terrain, the trail (dashed ahead of you, lit
 * behind you), the numbered stops, the landmarks, the agent's loop, and you. */

const FG = "var(--foreground)";
const STOP_TONE = { install: "cyan", describe: "purple", build: "emerald", run: "amber", away: "emerald" } as const;

/** Faint contour lines: three hills drawn as nested wobbly rings. */
const HILLS: [number, number, number][] = [
  [560, 150, 120],
  [250, 560, 110],
  [880, 560, 90],
];
function contour(cx: number, cy: number, r: number, k: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const rr = r * (1 + 0.12 * Math.sin(i * 2.3 + k) + 0.06 * Math.cos(i * 3.7 + k));
    return [cx + Math.cos(a) * rr * 1.5, cy + Math.sin(a) * rr * 0.7];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[9], pts[0]);
  return (
    `M${start[0].toFixed(1)} ${start[1].toFixed(1)}` +
    pts.map((pt, i) => { const m = mid(pt, pts[(i + 1) % 10]); return ` Q${pt[0].toFixed(1)} ${pt[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }).join("") +
    "Z"
  );
}
const CONTOURS = HILLS.flatMap(([cx, cy, r], h) => [1, 0.68, 0.38].map((f) => contour(cx, cy, r * f, h * 1.7 + f * 4)));

function StopMark({ p, i }: { p: MotionValue<number>; i: number }) {
  const s = STOPS[i];
  const lit = useTransform(p, (v) => beat(v, s.at, 0.04));
  const fillOp = useTransform(lit, (l) => l * 0.22);
  const halo = useTransform(lit, (l) => 19 + l * 9);
  const c = BRAND_VAR[STOP_TONE[s.key]];
  return (
    <g>
      <motion.circle cx={s.x} cy={s.y} r={halo} fill={c} style={{ opacity: useTransform(lit, (l) => l * 0.16) }} />
      <circle cx={s.x} cy={s.y} r={19} fill="var(--background)" stroke={c} strokeWidth={2.6} />
      <motion.circle cx={s.x} cy={s.y} r={19} fill={c} style={{ opacity: fillOp }} />
      <text x={s.x} y={s.y + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={c}>
        {s.n}
      </text>
    </g>
  );
}

export default function TrailArt({ p, loop, label }: { p: MotionValue<number>; loop: MotionValue<number>; label: string }) {
  const walked = useTransform(p, walkShare);
  const youX = useTransform(walked, (f) => pointAt(f)[0]);
  const youY = useTransform(walked, (f) => pointAt(f)[1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
      <defs>
        <linearGradient id="gs1-walked" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={BRAND_VAR.cyan} />
          <stop offset="0.55" stopColor={BRAND_VAR.purple} />
          <stop offset="1" stopColor={BRAND_VAR.emerald} />
        </linearGradient>
        <pattern id="gs1-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill={FG} fillOpacity={0.12} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={28} fill="url(#gs1-dots)" />
      {CONTOURS.map((d) => (
        <path key={d} d={d} stroke={FG} strokeOpacity={0.08} strokeWidth={1.5} />
      ))}

      {/* The trail: dashed ahead, lit behind */}
      <path d={TRAIL_D} stroke={FG} strokeOpacity={0.12} strokeWidth={14} strokeLinecap="round" />
      <path d={TRAIL_D} stroke={FG} strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" />
      <motion.path d={TRAIL_D} stroke="url(#gs1-walked)" strokeOpacity={0.22} strokeWidth={16} strokeLinecap="round" style={{ pathLength: walked }} />
      <motion.path d={TRAIL_D} stroke="url(#gs1-walked)" strokeWidth={5} strokeLinecap="round" style={{ pathLength: walked }} />

      <Landmarks p={p} />
      <AgentLoop p={p} loop={loop} />
      {STOPS.slice(0, 4).map((s, i) => (
        <StopMark key={s.key} p={p} i={i} />
      ))}

      {/* You: a map pin walking the trail */}
      <motion.g style={{ x: youX, y: youY }}>
        <ellipse cx={0} cy={2} rx={10} ry={4} fill={FG} fillOpacity={0.2} />
        <path d="M0 0 C-6 -10 -15 -17 -15 -28 a15 15 0 0 1 30 0 C15 -17 6 -10 0 0 Z" fill={BRAND_VAR.cyan} stroke="var(--background)" strokeWidth={2.5} />
        <circle cx={0} cy={-28} r={5.5} fill="var(--background)" />
      </motion.g>
    </svg>
  );
}
