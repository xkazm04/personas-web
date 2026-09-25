"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { Mark, dimToLit, type Progress } from "./GetStarted.shared";
import { AGENT_Y, YOU_Y } from "./GetStarted.handoff.geometry";

/* The marks of the "handoff" illustration. Every mark is always drawn (dim until
 * its beat), so any single frame is legible; the beat only lights it. */

export function Lit({ p, at, children, dim }: { p: Progress; at: number; children: ReactNode; dim?: number }) {
  const opacity = useTransform(p, (v) => dimToLit(v, at, dim));
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/** One of your steps: an icon in a ring on the "you" line. */
export function StepMark({ x, Icon }: { x: number; Icon: LucideIcon }) {
  return (
    <g>
      <circle cx={x} cy={YOU_Y} r={17} fill={tint("cyan", 16)} stroke={BRAND_VAR.cyan} strokeWidth={2} />
      <Icon x={x - 9} y={YOU_Y - 9} width={18} height={18} color={BRAND_VAR.cyan} strokeWidth={2.2} />
    </g>
  );
}

/** A run of the agent: a filled dot with a check. */
export function RunDot({ x, brand }: { x: number; brand: BrandKey }) {
  return (
    <g>
      <circle cx={x} cy={AGENT_Y} r={15} fill={tint(brand, 22)} stroke={BRAND_VAR[brand]} strokeWidth={2.2} />
      <Check x={x - 8} y={AGENT_Y - 8} width={16} height={16} color={BRAND_VAR[brand]} strokeWidth={3} />
    </g>
  );
}

/** What each run hands you: the digest, landing in Slack on your lane. */
export function DigestChip({ x }: { x: number }) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={AGENT_Y - 17}
        y2={YOU_Y + 17}
        stroke={BRAND_VAR.emerald}
        strokeOpacity={0.55}
        strokeWidth={1.8}
        strokeDasharray="4 5"
      />
      <path d={`M ${x - 5} ${YOU_Y + 24} L ${x} ${YOU_Y + 17} L ${x + 5} ${YOU_Y + 24}`} fill="none" stroke={BRAND_VAR.emerald} strokeWidth={1.8} />
      <rect x={x - 26} y={YOU_Y - 16} width={52} height={32} rx={9} fill="var(--background)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} className="text-foreground" />
      <g className="text-foreground" opacity={0.85}>
        <Mark name="slack" x={x} y={YOU_Y} size={17} />
      </g>
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
  fillOpacity = 0.92,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  tone?: string;
  fillOpacity?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill="currentColor" fillOpacity={fillOpacity} className={tone}>
      {children}
    </text>
  );
}
