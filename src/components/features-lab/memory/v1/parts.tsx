"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat, clamp01, easeOut } from "../shared/motion";
import { CategoryGlyph, catColor, catTint, type CategoryKey } from "../shared/categories";
import { BOTTOM_Y, FAIL_AT, FAILS, GOAL_X, RUN1_PIECES, SHELF_Y, START_X, T } from "./geometry";

/* The animated marks of V1. Each reads the one story value p. */

export const TOKENS: CategoryKey[] = ["warning", "learning"];

export const r1Of = (p: number) => beat(p, ...T.run1);
export const r2Of = (p: number) => beat(p, ...T.run12);
/** Where on run 12 (0..1) the traveller passes token i. */
export const passAt = (i: number) => (FAILS[i].x - START_X) / (GOAL_X - START_X);

export function Run1Piece({ p, i, d }: { p: MotionValue<number>; i: number; d: string }) {
  const opacity = useTransform(p, (v) => clamp01(r1Of(v) * RUN1_PIECES - i));
  return <motion.path d={d} style={{ opacity }} />;
}

export function FailMark({ p, index }: { p: MotionValue<number>; index: number }) {
  const { x, y } = FAILS[index];
  const on = useTransform(p, (v) => easeOut(clamp01((r1Of(v) - FAIL_AT[index]) / 0.04)));
  const scale = useTransform(on, (v) => 0.4 + 0.6 * v);
  const burst = useTransform(p, (v) => clamp01((r1Of(v) - FAIL_AT[index]) / 0.16));
  const burstR = useTransform(burst, (v) => 18 + v * 34);
  const burstO = useTransform(burst, (v) => (v > 0 && v < 1 ? 0.7 * (1 - v) : 0));
  return (
    <g>
      <motion.circle cx={x} cy={y} r={burstR} stroke={BRAND_VAR.rose} strokeWidth={2} style={{ opacity: burstO }} />
      <motion.g style={{ opacity: on, scale, x, y }}>
        <circle r={18} fill={tint("rose", 16)} stroke={tint("rose", 55)} strokeWidth={1.5} />
        <path d="M-6.5 -6.5 L6.5 6.5 M6.5 -6.5 L-6.5 6.5" stroke={BRAND_VAR.rose} strokeWidth={3.5} strokeLinecap="round" />
      </motion.g>
    </g>
  );
}

/** A failure turned memory: falls to the shelf, then lights run 12 below it. */
export function MemoryToken({ p, index }: { p: MotionValue<number>; index: number }) {
  const fail = FAILS[index];
  const k = TOKENS[index];
  const c = catColor(k);
  const drop = useTransform(p, (v) => easeOut(beat(v, T.drop[0] + index * 0.035, T.drop[1] - 0.035 + index * 0.035)));
  const y = useTransform(drop, (v) => fail.y + (SHELF_Y - fail.y) * v);
  const opacity = useTransform(drop, (v) => (v > 0 ? 1 : 0));
  const streak = useTransform(drop, (v) => (v > 0 && v < 1 ? 0.75 : v >= 1 ? 0.22 : 0));
  const streakY2 = useTransform(y, (v) => v - 22);
  const recall = useTransform(p, (v) => easeOut(beat(v, T.recall[0] + index * 0.02, T.recall[1])));
  const beamY2 = useTransform(recall, (v) => SHELF_Y + 30 + (BOTTOM_Y - SHELF_Y - 44) * v);
  const beamO = useTransform(recall, (v) => 0.55 * v);
  const lit = useTransform(p, (v) => clamp01((r2Of(v) - passAt(index)) / 0.08));
  const haloR = useTransform(lit, (v) => 34 + 16 * v);
  const haloO = useTransform(lit, (v) => 0.18 + 0.3 * v);
  const spotO = useTransform(lit, (v) => 0.85 * v);
  return (
    <g>
      <motion.line x1={fail.x} x2={fail.x} y1={fail.y + 22} y2={streakY2} stroke={c} strokeWidth={2} strokeLinecap="round" style={{ opacity: streak }} />
      <motion.line x1={fail.x} x2={fail.x} y1={SHELF_Y + 30} y2={beamY2} stroke={c} strokeWidth={2.5} strokeDasharray="2 7" strokeLinecap="round" style={{ opacity: beamO }} />
      <motion.g style={{ opacity: spotO }}>
        <circle cx={fail.x} cy={BOTTOM_Y} r={22} fill={catTint(k, 12)} stroke={c} strokeWidth={2} />
        <circle cx={fail.x} cy={BOTTOM_Y} r={6} fill={c} />
      </motion.g>
      <motion.g style={{ x: fail.x, y, opacity }}>
        <motion.circle r={haloR} fill={catTint(k, 22)} style={{ opacity: haloO }} />
        <rect x={-27} y={-27} width={54} height={54} rx={16} fill="var(--background)" />
        <rect x={-27} y={-27} width={54} height={54} rx={16} fill={catTint(k, 18)} stroke={c} strokeWidth={2.2} />
        <CategoryGlyph k={k} size={28} width={2.4} />
      </motion.g>
    </g>
  );
}

export function Flag({ x, y, color, dim }: { x: number; y: number; color: string; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.45 : 1}>
      <line x1={x} x2={x} y1={y} y2={y - 52} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${x} ${y - 52} L${x + 30} ${y - 43} L${x} ${y - 34} Z`} fill={color} />
    </g>
  );
}

/** Run 12's bright head: a halo, a short tail and the dot. */
export function Comet({ p }: { p: MotionValue<number> }) {
  const x = useTransform(p, (v) => START_X + (GOAL_X - START_X) * r2Of(v));
  const on = useTransform(p, (v) => (v >= T.run12[0] - 0.02 ? 1 : 0.0));
  return (
    <motion.g style={{ x, y: BOTTOM_Y, opacity: on }}>
      <circle r={30} fill="url(#mem1-halo)" />
      <rect x={-120} y={-4} width={120} height={8} rx={4} fill="url(#mem1-tail)" />
      <circle r={9} fill={BRAND_VAR.cyan} />
      <circle r={4} fill="var(--background)" opacity={0.6} />
    </motion.g>
  );
}

export function GoalBurst({ p }: { p: MotionValue<number> }) {
  const g = useTransform(p, (v) => easeOut(beat(v, ...T.goal)));
  const r1 = useTransform(g, (v) => 14 + 30 * v);
  const r2 = useTransform(g, (v) => 14 + 52 * v);
  const o1 = useTransform(g, (v) => (v > 0 ? 0.6 * (1 - v) + 0.25 : 0));
  const o2 = useTransform(g, (v) => (v > 0 ? 0.4 * (1 - v) + 0.1 : 0));
  return (
    <g>
      <motion.circle cx={GOAL_X} cy={BOTTOM_Y} r={r1} stroke={BRAND_VAR.emerald} strokeWidth={2.5} style={{ opacity: o1 }} />
      <motion.circle cx={GOAL_X} cy={BOTTOM_Y} r={r2} stroke={BRAND_VAR.emerald} strokeWidth={1.5} style={{ opacity: o2 }} />
    </g>
  );
}
