"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { BOTTOM_Y, FAIL_AT, FAILS, GOAL_X, RUN1_PIECES, START_X } from "./MemoryLayers.run-twice.geometry";

/* Beat timing and the animated marks of the "run-twice" memory illustration. */

export const CHIPS: { key: BrandKey }[] = [{ key: "amber" }, { key: "purple" }];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const beat = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

export const r1Of = (p: number) => beat(p, 0, 0.5);
export const r2Of = (p: number) => beat(p, 0.64, 0.88);

export function Run1Piece({ p, i, d }: { p: MotionValue<number>; i: number; d: string }) {
  const opacity = useTransform(p, (v) => clamp01(r1Of(v) * RUN1_PIECES - i));
  return <motion.path d={d} style={{ opacity }} />;
}

export function FailCross({ p, index }: { p: MotionValue<number>; index: number }) {
  const { x, y } = FAILS[index];
  const on = useTransform(p, (v) => easeOut(clamp01((r1Of(v) - FAIL_AT[index]) / 0.05)));
  const scale = useTransform(on, (v) => 0.4 + 0.6 * v);
  return (
    <motion.g style={{ opacity: on, scale, x, y }}>
      <circle r={17} fill={tint("rose", 14)} />
      <path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke={BRAND_VAR.rose} strokeWidth={3.5} strokeLinecap="round" />
    </motion.g>
  );
}

export function MemoryChip({ p, index }: { p: MotionValue<number>; index: number }) {
  const fail = FAILS[index];
  const color = BRAND_VAR[CHIPS[index].key];
  // Chip 1 leaves first; both land before run 12 starts.
  const drop = useTransform(p, (v) => easeOut(beat(v, 0.5 + index * 0.03, 0.61 + index * 0.03)));
  const y = useTransform(drop, (v) => fail.y + (BOTTOM_Y - fail.y) * v);
  const opacity = useTransform(drop, (v) => (v > 0 ? 1 : 0));
  const passAt = (fail.x - START_X) / (GOAL_X - START_X);
  const lit = useTransform(p, (v) => 0.22 * clamp01((r2Of(v) - passAt) / 0.06));
  const tether = useTransform(drop, (v) => 0.45 * v);
  return (
    <g>
      <motion.line
        x1={fail.x}
        x2={fail.x}
        y1={fail.y + 20}
        y2={BOTTOM_Y - 16}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3 6"
        style={{ opacity: tether }}
      />
      <motion.g style={{ x: fail.x, y, opacity }}>
        <motion.circle r={30} fill={color} style={{ opacity: lit }} />
        <rect x={-22} y={-13} width={44} height={26} rx={8} fill={tint(CHIPS[index].key, 30)} stroke={color} strokeWidth={2} />
        <rect x={-12} y={-3} width={24} height={6} rx={3} fill={color} />
      </motion.g>
    </g>
  );
}

export function Flag({ x, y, color, dim }: { x: number; y: number; color: string; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.5 : 1}>
      <line x1={x} x2={x} y1={y} y2={y - 44} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <path d={`M${x} ${y - 44} L${x + 26} ${y - 36} L${x} ${y - 28} Z`} fill={color} />
    </g>
  );
}
