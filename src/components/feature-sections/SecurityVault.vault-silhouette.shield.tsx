"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Lock } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ROWS, SEAL, sealWindow } from "./SecurityVault.vault-silhouette.row";

/* A shield inside a ring of segments, one segment per credential row. */

const CX = 100;
const CY = 100;
const R = 86;
const SEG = 360 / ROWS.length;
const polar = (deg: number) => {
  const r = ((deg - 90) * Math.PI) / 180;
  return `${(CX + R * Math.cos(r)).toFixed(2)} ${(CY + R * Math.sin(r)).toFixed(2)}`;
};
const arc = (i: number) => `M ${polar(i * SEG + 5)} A ${R} ${R} 0 0 1 ${polar((i + 1) * SEG - 5)}`;

function RingSegment({ i, p }: { i: number; p: MotionValue<number> }) {
  const [a, b] = sealWindow(i);
  const lit = useTransform(p, [a, b], [0, 1]);
  return (
    <>
      <path d={arc(i)} fill="none" strokeWidth={9} strokeLinecap="round" className="stroke-foreground/10" />
      <motion.path
        d={arc(i)}
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        stroke={BRAND_VAR.emerald}
        style={{ opacity: lit }}
      />
    </>
  );
}

const SHIELD = "M100 42 L146 60 V98 C146 128 126 148 100 160 C74 148 54 128 54 98 V60 Z";
const RING_DONE = sealWindow(ROWS.length - 1)[1];

export function ShieldBadge({ p }: { p: MotionValue<number> }) {
  const done = useTransform(p, [RING_DONE, RING_DONE + 0.08], [0, 1]);
  const checkScale = useTransform(p, [RING_DONE, RING_DONE + 0.05, RING_DONE + 0.08], [0.4, 1.2, 1]);
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      {ROWS.map((_, i) => (
        <RingSegment key={i} i={i} p={p} />
      ))}
      <path d={SHIELD} fill="none" strokeWidth={4} strokeLinejoin="round" className="stroke-foreground/25" />
      <motion.path
        d={SHIELD}
        fill={tint(SEAL, 18)}
        stroke={BRAND_VAR.emerald}
        strokeWidth={4}
        strokeLinejoin="round"
        style={{ opacity: done }}
      />
      <motion.path
        d="M80 100 L95 115 L122 86"
        fill="none"
        stroke={BRAND_VAR.emerald}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: done, scale: checkScale, transformOrigin: "100px 100px" }}
      />
    </svg>
  );
}

export function StatusChip({
  p,
  at,
  icon: Icon,
  label,
}: {
  p: MotionValue<number>;
  at: number;
  icon: typeof Lock;
  label: string;
}) {
  const on = useTransform(p, [at, at + 0.08], [0.3, 1]);
  const y = useTransform(p, [at, at + 0.08], [6, 0]);
  return (
    <motion.span
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium"
      style={{
        opacity: on,
        y,
        color: BRAND_VAR.emerald,
        borderColor: tint(SEAL, 35),
        backgroundColor: tint(SEAL, 10),
      }}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </motion.span>
  );
}
