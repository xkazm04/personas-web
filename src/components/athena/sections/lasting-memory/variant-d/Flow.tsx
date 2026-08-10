"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { curve, foot, intakePaths, outletPaths, type FieldLayout } from "./layout";

/**
 * The material moving between the zones — the layer that turns three boxes
 * into an anatomy.
 *
 * The asymmetry is drawn here, and drawn to scale: on the way IN, one stream
 * from every scrap on the working surface, all converging on one point. On the
 * way OUT, three. Much in, little kept.
 *
 * At the moment something lands, the stream from the exact scrap it came from
 * lights the whole way back up through her — that is the link every kept thing
 * carries. The second pass shows the alternative: one candidate arrives with
 * nothing lit behind it, meets a closed gate above the shelf, and never lands.
 *
 * Renders ABOVE the cooling veil on purpose: while she rests the field goes
 * dark and the only thing still moving is what is moving through her. Strokes
 * are `non-scaling-stroke`, so the 100×100 percent viewBox can stay unlocked
 * (a stream can never miss what it feeds) without near-vertical runs rendering
 * five times thicker than near-horizontal ones.
 */

const DRAW = { duration: 0.7, ease: "easeInOut" } as const;
const RIDE = { duration: 1.5, repeat: Infinity, ease: "easeInOut" } as const;

function Stream({
  d,
  drawn,
  live,
  dim,
  dashed = false,
  reduced,
  delay = 0,
  stroke,
}: {
  d: string;
  drawn: boolean;
  live: boolean;
  dim: number;
  dashed?: boolean;
  reduced: boolean;
  delay?: number;
  stroke: string;
}) {
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 3" : undefined}
        vectorEffect="non-scaling-stroke"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: drawn ? 1 : 0, opacity: dim }}
        transition={reduced ? { duration: 0 } : { ...DRAW, delay: drawn ? delay : 0 }}
      />
      {live && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
          initial={{ pathLength: 0.16, pathOffset: 0, opacity: 0 }}
          animate={{ pathLength: 0.16, pathOffset: [0, 0.84], opacity: [0, 1, 1, 0] }}
          transition={{ ...RIDE, delay }}
        />
      )}
    </>
  );
}

export default function Flow({
  layout,
  active,
  drawing,
  keeping,
  sources,
  landing,
  refused,
  reduced,
}: {
  layout: FieldLayout;
  /** The pass is running — the streams exist at all. */
  active: boolean;
  drawing: boolean;
  keeping: boolean;
  /** Scraps whose link is lit, and shelf slots being arrived at, this beat. */
  sources: readonly number[];
  landing: readonly number[];
  refused: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const intake = useMemo(() => intakePaths(layout), [layout]);
  const outlet = useMemo(() => outletPaths(layout, layout.cols * layout.rows), [layout]);
  // The bar sits in the clear band between the beat caption and the shelf's
  // own name — a candidate is stopped BEFORE the shelf, never on it.
  const gate = useMemo(() => {
    const from = foot(layout.chamber);
    const to = { x: from.x + (layout.short ? 12 : 11), y: layout.kept.y - 6 };
    return { d: curve(from, to, 0.6), to };
  }, [layout]);

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* One field-wide ramp: faintest where material is still the
              conversation, firmest where it becomes something kept. */}
          <linearGradient id={`${uid}-ink`} gradientUnits="userSpaceOnUse" x1="0" y1={layout.now.y} x2="0" y2={layout.kept.y}>
            <stop offset="0%" stopColor={tint("cyan", 30)} />
            <stop offset="100%" stopColor={tint("cyan", 70)} />
          </linearGradient>
        </defs>

        {intake.map((d, i) => (
          <Stream
            key={`in${i}`}
            d={d}
            drawn={active}
            live={drawing}
            dim={active ? (keeping ? (sources.includes(i) ? 1 : 0.18) : 0.65) : 0}
            reduced={reduced}
            delay={drawing ? i * 0.05 : 0}
            stroke={`url(#${uid}-ink)`}
          />
        ))}

        {outlet.map((d, i) => (
          <Stream
            key={`out${i}`}
            d={d}
            drawn={keeping && landing.includes(i)}
            live={keeping && landing.includes(i)}
            dim={keeping && landing.includes(i) ? 1 : 0}
            reduced={reduced}
            delay={landing.indexOf(i) * 0.12}
            stroke={`url(#${uid}-ink)`}
          />
        ))}

        {/* Turned away: dashed the whole way, and stopped by a bar it never
            gets past. Nothing on the shelf ever arrived like this. */}
        <Stream
          d={gate.d}
          drawn={refused}
          live={false}
          dim={refused ? 0.8 : 0}
          dashed
          reduced={reduced}
          stroke={tint("cyan", 45)}
        />
        <motion.line
          x1={gate.to.x - 3}
          y1={gate.to.y}
          x2={gate.to.x + 3}
          y2={gate.to.y}
          stroke={BRAND_VAR.cyan}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ opacity: refused ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.4, delay: refused ? 0.35 : 0 }}
        />
      </svg>
    </>
  );
}
