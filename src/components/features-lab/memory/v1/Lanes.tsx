"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { BOTTOM_Y, FAILS, GOAL_X, H, LANE_BOTTOM, LANE_TOP, RUN1_CHUNKS, RUN1_D, SHELF_Y, START_X, TOP_Y, W, run1At } from "./geometry";
import { Comet, FailMark, Flag, GoalBurst, MemoryToken, Run1Piece, r1Of, r2Of } from "./parts";

/* The drawn picture of V1: two lit lanes, the same start and goal, the memory
 * shelf between them, run 1's wander, the failures turned tokens, and run 12's
 * straight line with its bright head. */

const FG = "var(--foreground)";

export default function Lanes({ p }: { p: MotionValue<number> }) {
  const t1x = useTransform(p, (v) => run1At(r1Of(v)).x);
  const t1y = useTransform(p, (v) => run1At(r1Of(v)).y);
  const run2Scale = useTransform(p, (v) => r2Of(v));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
      <defs>
        <linearGradient id="mem1-track" gradientUnits="userSpaceOnUse" x1={START_X} x2={GOAL_X} y1={0} y2={0}>
          <stop offset="0%" stopColor={BRAND_VAR.cyan} />
          <stop offset="100%" stopColor={BRAND_VAR.emerald} />
        </linearGradient>
        <linearGradient id="mem1-lane-top" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={FG} stopOpacity={0.05} />
          <stop offset="100%" stopColor={FG} stopOpacity={0.015} />
        </linearGradient>
        <linearGradient id="mem1-lane-bottom" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0.09} />
          <stop offset="100%" stopColor={BRAND_VAR.emerald} stopOpacity={0.07} />
        </linearGradient>
        <linearGradient id="mem1-shelf" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={BRAND_VAR.purple} stopOpacity={0} />
          <stop offset="50%" stopColor={BRAND_VAR.purple} stopOpacity={0.16} />
          <stop offset="100%" stopColor={BRAND_VAR.purple} stopOpacity={0} />
        </linearGradient>
        <radialGradient id="mem1-halo">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0.55} />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="mem1-tail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0} />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0.8} />
        </linearGradient>
        <radialGradient id="mem1-goal">
          <stop offset="0%" stopColor={BRAND_VAR.emerald} stopOpacity={0.3} />
          <stop offset="100%" stopColor={BRAND_VAR.emerald} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Lanes: run 1 on neutral glass, run 12 on lit glass */}
      <rect x={20} y={LANE_TOP.y} width={W - 40} height={LANE_TOP.h} rx={26} fill="url(#mem1-lane-top)" stroke={FG} strokeOpacity={0.08} />
      <rect x={20} y={LANE_BOTTOM.y} width={W - 40} height={LANE_BOTTOM.h} rx={26} fill="url(#mem1-lane-bottom)" stroke={tint("cyan", 30)} />
      <line x1={44} x2={W - 44} y1={LANE_BOTTOM.y + 1} y2={LANE_BOTTOM.y + 1} stroke={tint("cyan", 45)} strokeWidth={1} />

      {/* Memory shelf */}
      <rect x={20} y={SHELF_Y - 46} width={W - 40} height={92} fill="url(#mem1-shelf)" />
      <line x1={START_X - 20} x2={GOAL_X} y1={SHELF_Y} y2={SHELF_Y} stroke={BRAND_VAR.purple} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="2 8" strokeLinecap="round" />

      {/* Start and goal columns */}
      {[START_X, GOAL_X].map((x) => (
        <line key={x} x1={x} x2={x} y1={TOP_Y} y2={BOTTOM_Y} stroke={FG} strokeOpacity={0.16} strokeDasharray="2 7" />
      ))}
      <circle cx={GOAL_X} cy={BOTTOM_Y} r={70} fill="url(#mem1-goal)" />

      {/* Run 1: a faint ghost of the whole wander, drawn over piece by piece */}
      <path d={RUN1_D} stroke={FG} strokeOpacity={0.07} strokeWidth={3.5} />
      <g stroke={FG} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5}>
        {RUN1_CHUNKS.map((d, i) => (
          <Run1Piece key={i} p={p} i={i} d={d} />
        ))}
      </g>
      {FAILS.map((_, i) => (
        <FailMark key={i} p={p} index={i} />
      ))}

      {/* Run 12: straight, fast, lit */}
      <line x1={START_X} x2={GOAL_X} y1={BOTTOM_Y} y2={BOTTOM_Y} stroke={FG} strokeOpacity={0.1} strokeWidth={3} strokeLinecap="round" />
      <motion.g style={{ scaleX: run2Scale, originX: 0, transformBox: "fill-box" }}>
        <line x1={START_X} x2={GOAL_X} y1={BOTTOM_Y} y2={BOTTOM_Y} stroke="url(#mem1-track)" strokeWidth={6} strokeLinecap="round" />
      </motion.g>

      {FAILS.map((_, i) => (
        <MemoryToken key={i} p={p} index={i} />
      ))}

      {/* Starts and goals */}
      <circle cx={START_X} cy={TOP_Y} r={9} stroke={FG} strokeOpacity={0.5} strokeWidth={2.5} fill="var(--background)" />
      <circle cx={START_X} cy={BOTTOM_Y} r={9} stroke={BRAND_VAR.cyan} strokeWidth={2.5} fill="var(--background)" />
      <Flag x={GOAL_X} y={TOP_Y} color={FG} dim />
      <Flag x={GOAL_X} y={BOTTOM_Y} color={BRAND_VAR.emerald} />
      <GoalBurst p={p} />

      {/* Travellers */}
      <motion.circle r={14} fill={FG} fillOpacity={0.1} style={{ x: t1x, y: t1y }} />
      <motion.circle r={7} fill={FG} fillOpacity={0.75} style={{ x: t1x, y: t1y }} />
      <Comet p={p} />
    </svg>
  );
}
