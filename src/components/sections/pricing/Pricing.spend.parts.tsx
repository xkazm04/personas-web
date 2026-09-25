"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/* Pieces of the "spend" illustration: beat-driven reveal wrappers and callouts. */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const beat = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

/** Fades and lifts its children in over one beat window; resting state (p = 1) is fully shown. */
export function Reveal({ p, from, to, className, children }: { p: MotionValue<number>; from: number; to: number; className?: string; children: ReactNode }) {
  const opacity = useTransform(p, (v) => beat(v, from, to));
  const y = useTransform(p, (v) => 8 * (1 - beat(v, from, to)));
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

/** The Cost Breakdown bar as the app draws it: input (blue) then output (amber), filling left to right. */
export function BreakdownBar({ p, inputShare }: { p: MotionValue<number>; inputShare: number }) {
  const scaleX = useTransform(p, (v) => beat(v, 0.45, 0.62));
  return (
    <div className="h-5 overflow-hidden rounded-full border border-glass bg-white/[0.03] md:h-3">
      <motion.div className="flex h-full w-full" style={{ scaleX, originX: 0 }}>
        <div className="h-full" style={{ width: `${inputShare * 100}%`, backgroundColor: tint("blue", 55) }} />
        <div className="h-full flex-1" style={{ backgroundColor: tint("amber", 55) }} />
      </motion.div>
    </div>
  );
}

/** An annotation beside the app card (page style, not app UI): a dashed leader and a short label. */
export function Callout({ brand, title, sub, className = "" }: { brand: BrandKey; title: string; sub?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-0 md:flex-row md:items-center md:gap-3 ${className}`}>
      {/* The leader: down to the callout on phones, across to it beside the card. */}
      <span aria-hidden className="ml-8 h-6 w-px border-l-2 border-dashed md:ml-0 md:h-px md:w-8 md:shrink-0 md:border-l-0 md:border-t-2" style={{ borderColor: tint(brand, 60) }} />
      <div className="w-full rounded-xl border px-3.5 py-2.5 md:w-auto md:py-2" style={{ borderColor: tint(brand, 45), backgroundColor: tint(brand, 10) }}>
        <div className="text-[15px] font-bold leading-tight md:text-base" style={{ color: BRAND_VAR[brand] }}>
          {title}
        </div>
        {sub && <div className="mt-0.5 text-[13px] leading-snug text-foreground/80 md:text-sm">{sub}</div>}
      </div>
    </div>
  );
}
