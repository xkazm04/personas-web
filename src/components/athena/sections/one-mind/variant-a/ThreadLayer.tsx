"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { FieldLayout } from "./layout";
import { threadPaths } from "./threads";

/**
 * What joins the conversations to the one thing they all draw on.
 *
 * Threads DRAW rather than appear (`pathLength` 0 → 1), one after another
 * inside a single tick, so the eye reads them as one structure being made
 * rather than as a spray of wire. After that they carry the whole causal chain
 * of the section, and they carry it in a direction you can see:
 *
 *   DOWN, on one thread   the thing you just said, on its way to being kept.
 *   UP, on all the others the instant it lands — every other conversation has
 *                         it now, and the pulse arriving in each one is what
 *                         "immediately" looks like.
 *   UP, on one thread     her reaching for it to answer a question in a
 *                         conversation that was never told it.
 *
 * At the close every thread brightens at once: the structure was never four
 * separate wires, it was one thing with four ways in.
 *
 * The SVG deliberately does NOT lock its aspect ratio: its 100×100 viewBox is
 * the same percent space every box is positioned in, so a thread can never
 * miss what it feeds. It renders BEHIND everything else, so a thread that
 * passes a panel simply goes behind it.
 */

/* Stroke widths are percentages of a field that is far wider than it is tall,
 * so a stroke on a near-vertical run renders thicker than the same stroke on a
 * horizontal one. Kept deliberately fine: a spark heavy enough to read as an
 * object would become a second travelling thing on a field that must only ever
 * have one. */
const BASE_W = 0.3;
const SPARK_W = 0.44;
const DRAW = { duration: 0.8, ease: "easeInOut" } as const;
const RIDE = { duration: 1.5, repeat: Infinity, ease: "easeInOut" } as const;

export type Spark = "down" | "up" | null;

function Thread({
  d,
  drawn,
  spark,
  lit,
  stroke,
  reduced,
  delay,
}: {
  d: string;
  drawn: boolean;
  spark: Spark;
  lit: boolean;
  stroke: string;
  reduced: boolean;
  delay: number;
}) {
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={BASE_W}
        strokeLinecap="round"
        style={{ opacity: lit ? 1 : 0.55 }}
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { ...DRAW, delay: drawn ? delay : 0 }}
      />
      {spark && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={SPARK_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
          initial={{ pathLength: 0.24, pathOffset: spark === "down" ? 0 : 0.76 }}
          animate={{
            pathLength: 0.24,
            pathOffset: spark === "down" ? [0, 0.76] : [0.76, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={RIDE}
        />
      )}
    </>
  );
}

export default function ThreadLayer({
  layout,
  drawn,
  sparks,
  unified,
  reduced,
}: {
  layout: FieldLayout;
  drawn: boolean;
  /** One per conversation — which way, if any, something is moving on it. */
  sparks: readonly Spark[];
  unified: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const paths = useMemo(() => threadPaths(layout), [layout]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* One field-wide ramp: faintest at the conversation, firmest where it
            reaches what she keeps — every thread runs the same way in. */}
        <linearGradient id={`${uid}-ink`} gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="96">
          <stop offset="0%" stopColor={tint("cyan", 24)} />
          <stop offset="100%" stopColor={tint("cyan", 66)} />
        </linearGradient>
      </defs>

      {paths.map((d, i) => (
        <Thread
          key={i}
          d={d}
          drawn={drawn}
          spark={sparks[i] ?? null}
          lit={unified || sparks[i] !== null}
          stroke={`url(#${uid}-ink)`}
          reduced={reduced}
          delay={i * 0.14}
        />
      ))}

      {/* Where each one meets what she keeps. They sit on the memory's own
          edge, so the join is a place you can point at. */}
      {layout.inlet.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={0.55}
          fill={BRAND_VAR.cyan}
          initial={false}
          animate={{ opacity: drawn ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: i * 0.14 }}
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 60)})` }}
        />
      ))}
    </svg>
  );
}
