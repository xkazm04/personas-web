"use client";

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/* Marks and timing helpers of the get-started lifecycle illustration. Every mark
 * is always drawn (dim until its beat), so any single frame is legible. */

export type Progress = MotionValue<number>;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before `at`, 1 once `at + span` is reached. */
export const beat = (v: number, at: number, span = 0.06) => clamp01((v - at) / span);
const dimToLit = (v: number, at: number, dim: number) => dim + (1 - dim) * beat(v, at);

/**
 * One progress value, 0 -> 1, played once when `ref` comes into view. It rests at
 * 1 (the resolved end state) in the server render and under reduced motion.
 */
export function usePlayOnce(ref: RefObject<Element | null>, duration: number) {
  const still = useStillMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const p = useMotionValue(1);
  const run = useRef<AnimationPlaybackControls | null>(null);

  const play = useCallback(() => {
    run.current?.stop();
    if (still) {
      p.set(1);
      return;
    }
    p.set(0);
    run.current = animate(p, 1, { duration, ease: "linear" });
  }, [p, still, duration]);

  useEffect(() => {
    if (still) {
      run.current?.stop();
      p.set(1);
      return;
    }
    if (inView) play();
  }, [inView, still, play, p]);

  useEffect(() => () => run.current?.stop(), []);

  return { p, play, still };
}

export function Lit({ p, at, children, dim = 0.3 }: { p: Progress; at: number; children: ReactNode; dim?: number }) {
  const opacity = useTransform(p, (v) => dimToLit(v, at, dim));
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/** A line that draws itself at its beat. */
export function Draw({ p, at, d, color, dashed, width = 2.4 }: { p: Progress; at: number; d: string; color: string; dashed?: boolean; width?: number }) {
  const len = useTransform(p, (v) => beat(v, at, 0.08));
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={dashed ? "4 6" : undefined}
      style={{ pathLength: len }}
    />
  );
}

/** An icon in a ring. */
export function Mark({ x, y, Icon, brand, r = 17 }: { x: number; y: number; Icon: LucideIcon; brand: BrandKey; r?: number }) {
  const s = r * 1.05;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={tint(brand, 16)} stroke={BRAND_VAR[brand]} strokeWidth={2} />
      <Icon x={x - s / 2} y={y - s / 2} width={s} height={s} color={BRAND_VAR[brand]} strokeWidth={2.2} />
    </g>
  );
}

/** One run of the agent: a filled dot with a check; the better run carries a second ring. */
export function RunDot({ x, y, better }: { x: number; y: number; better?: boolean }) {
  const c = BRAND_VAR.emerald;
  return (
    <g>
      {better && <circle cx={x} cy={y} r={23} fill="none" stroke={c} strokeWidth={2} strokeOpacity={0.55} />}
      <circle cx={x} cy={y} r={15} fill={tint("emerald", better ? 40 : 22)} stroke={c} strokeWidth={2.2} />
      <Check x={x - 8} y={y - 8} width={16} height={16} color={c} strokeWidth={3} />
    </g>
  );
}

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  size = 17,
  weight = 600,
  tone = "text-foreground",
  op = 0.92,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  tone?: string;
  op?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill="currentColor" fillOpacity={op} className={tone}>
      {children}
    </text>
  );
}
