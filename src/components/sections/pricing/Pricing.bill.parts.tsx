"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { BEAT_START, along, beat, type Box, type Pt } from "./Pricing.bill.geometry";

/* Drawn pieces of the "bill" illustration: nodes, the travelling run, the coin. */

export function Node({ box, icon: Icon, label, brand, font }: { box: Box; icon: LucideIcon; label: string; brand: BrandKey; font: number }) {
  const icon = font * 1.35;
  const cy = box.y + box.h / 2;
  // Icon and label centred together in the box.
  const labelW = label.length * font * 0.56;
  const x0 = box.x + (box.w - (icon + 10 + labelW)) / 2;
  return (
    <g>
      {/* Opaque base so the lane behind never runs through a label. */}
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="var(--background)" />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill={tint(brand, 12)} stroke={BRAND_VAR[brand]} strokeOpacity={0.7} strokeWidth={2} />
      <Icon x={x0} y={cy - icon / 2} width={icon} height={icon} color={BRAND_VAR[brand]} strokeWidth={2} />
      <text x={x0 + icon + 10} y={cy + font * 0.36} fontSize={font * 1.12} fontWeight={700} fill="var(--foreground)">
        {label}
      </text>
    </g>
  );
}

export function Legend({ at, anchor = "start", text, brand }: { at: Pt; anchor?: "start" | "end"; text: string; brand?: BrandKey }) {
  return (
    <text
      x={at[0]}
      y={at[1]}
      textAnchor={anchor}
      fontSize={16}
      fontWeight={600}
      letterSpacing={0.6}
      fill={brand ? BRAND_VAR[brand] : "var(--foreground)"}
      fillOpacity={brand ? 1 : 0.75}
    >
      {text}
    </text>
  );
}

/** The run: out to Claude, a working pulse, then back to Personas. */
export function RunDot({ lane, p }: { lane: Pt[]; p: MotionValue<number> }) {
  const f = (v: number) => (v < 0.45 ? beat(v, 0, 0.3) : 1 - beat(v, 0.45, 0.62));
  const x = useTransform(p, (v) => along(lane, f(v))[0]);
  const y = useTransform(p, (v) => along(lane, f(v))[1]);
  const opacity = useTransform(p, (v) => (v >= 0.66 ? 0 : 1));
  return (
    <motion.g style={{ x, y, opacity }}>
      <circle r={11} fill={tint("cyan", 25)} />
      <circle r={6} fill={BRAND_VAR.cyan} />
    </motion.g>
  );
}

export function WorkPulse({ at, p }: { at: Pt; p: MotionValue<number> }) {
  const k = useTransform(p, (v) => beat(v, 0.3, 0.45));
  const scale = useTransform(k, (v) => 0.6 + 0.8 * v);
  const opacity = useTransform(k, (v) => (v > 0 && v < 1 ? 0.6 * (1 - v) : 0));
  return <motion.circle cx={at[0]} cy={at[1]} r={60} fill="none" stroke={BRAND_VAR.amber} strokeWidth={3} style={{ scale, opacity, transformBox: "fill-box", originX: 0.5, originY: 0.5 }} />;
}

export function Coin({ money, p }: { money: Pt[]; p: MotionValue<number> }) {
  const k = useTransform(p, (v) => beat(v, 0.7, 0.92));
  const x = useTransform(k, (v) => along(money, v)[0]);
  const y = useTransform(k, (v) => along(money, v)[1]);
  const opacity = useTransform(k, (v) => (v > 0 && v < 1 ? 1 : 0));
  return (
    <motion.g style={{ x, y, opacity }}>
      <circle r={10} fill={BRAND_VAR.amber} />
      <circle r={5} fill="none" stroke="var(--background)" strokeWidth={2} />
    </motion.g>
  );
}

/** A beat caption on the step axis: dim until its beat starts, lit after. */
export function BeatCaption({ at, index, text, p, font }: { at: Pt; index: number; text: string; p: MotionValue<number>; font: number }) {
  const opacity = useTransform(p, (v) => (v >= BEAT_START[index] ? 1 : 0.4));
  return (
    <motion.g style={{ opacity }}>
      <circle cx={at[0] + 12} cy={at[1] - 5} r={12} fill={tint("cyan", 18)} stroke={BRAND_VAR.cyan} strokeWidth={1.5} />
      <text x={at[0] + 12} y={at[1]} textAnchor="middle" fontSize={14} fontWeight={700} fill={BRAND_VAR.cyan}>
        {index + 1}
      </text>
      <text x={at[0] + 32} y={at[1]} fontSize={font * 0.9} fill="var(--foreground)" fillOpacity={0.85}>
        {text}
      </text>
    </motion.g>
  );
}
