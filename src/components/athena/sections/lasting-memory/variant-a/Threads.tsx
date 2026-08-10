"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { KEPT } from "./copy";
import { threadEnds, threadPath, type FieldLayout } from "./layout";

/**
 * The link back.
 *
 * Every durable thing keeps a way back to the exact conversation it came out
 * of — so here, every kept thing keeps a thread down to a real point inside
 * the settled band, and the thread DRAWS from the band downward, in the same
 * beat the thing itself arrives. The order is the argument: it comes out of
 * the mass, it does not appear beside it.
 *
 * A short bright segment rides each thread once it is drawn, and the anchor
 * inside the band opens as the thread leaves it — the mass is the source, and
 * it stays visibly the source long after the beat is over.
 *
 * The SVG deliberately does NOT lock its aspect ratio: its 100×100 viewBox is
 * the same percent space everything else is placed in, so a thread can never
 * miss the card it belongs to. It renders BEHIND the cards, so the compact
 * layout can route four threads up one gutter without knotting.
 */

const BASE_W = 0.28;
const SPARK_W = 0.7;
const DRAW = { duration: 0.7, ease: "easeOut" } as const;
const RIDE = { duration: 2.1, repeat: Infinity, ease: "easeInOut" } as const;

export default function Threads({
  layout: L,
  kept,
  reduced,
}: {
  layout: FieldLayout;
  kept: ModuleStage[];
  reduced: boolean;
}) {
  const uid = useId();
  const paths = useMemo(() => KEPT.map((_, i) => threadPath(L, i)), [L]);
  const anchors = useMemo(() => KEPT.map((_, i) => threadEnds(L, i)[0]), [L]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Firmest where it leaves the mass, softer where it comes to rest —
            the thread reads as something drawn OUT of the band. */}
        <linearGradient
          id={`${uid}-ink`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={L.band.y}
          x2="0"
          y2="100"
        >
          <stop offset="0%" stopColor={tint("cyan", 66)} />
          <stop offset="100%" stopColor={tint("cyan", 30)} />
        </linearGradient>
      </defs>

      {paths.map((d, i) => {
        const drawn = atStage(kept[i], "shell");
        const settled = atStage(kept[i], "chosen");
        return (
          <g key={KEPT[i].label}>
            <motion.path
              d={d}
              fill="none"
              stroke={`url(#${uid}-ink)`}
              strokeWidth={BASE_W}
              strokeLinecap="round"
              style={{ opacity: settled ? 1 : 0.7 }}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: drawn ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : DRAW}
            />
            {drawn && !reduced && (
              <motion.path
                d={d}
                fill="none"
                stroke={BRAND_VAR.cyan}
                strokeWidth={SPARK_W}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
                initial={{ pathLength: 0.14, pathOffset: 0, opacity: 0 }}
                animate={{ pathLength: 0.14, pathOffset: [0, 0.86], opacity: [0, 1, 1, 0] }}
                transition={{ ...RIDE, delay: i * 0.2 }}
              />
            )}
            {/* Where in the mass it came from */}
            <motion.circle
              cx={anchors[i].x}
              cy={anchors[i].y}
              r={0.85}
              fill={BRAND_VAR.cyan}
              initial={false}
              animate={{ opacity: drawn ? 1 : 0, scale: drawn ? 1 : 0.2 }}
              transition={reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
              style={{
                transformBox: "view-box",
                transformOrigin: `${anchors[i].x}px ${anchors[i].y}px`,
                filter: `drop-shadow(0 0 3px ${tint("cyan", 70)})`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
