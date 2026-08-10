"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { citePath, citeTo, restFrac, type FieldLayout } from "./layout";
import { BREATH, SETTLE } from "./parts";

/**
 * Every citation in the scene — the section's load-bearing image.
 *
 * Each durable thing she knows is joined by a hairline to the exact
 * conversation it came out of, and the join is drawn as a physical fact
 * rather than described: nothing in this frame is allowed to float free of
 * the thing that produced it.
 *
 * The card that stops being worked from does not get a new thread when it
 * settles. It slides DOWN THE ONE IT ALREADY HAD, and the thread retracts
 * from the top while the end fixed to its conversation never moves by a
 * pixel (`pathLength` shrinks, `pathOffset` takes up the slack, so the piece
 * still showing is the piece nearest the record). That is why the moving
 * card's citation is authored with no lean — a straight run makes the
 * fraction still showing exact at every viewport instead of nearly right at
 * the one it was tuned on.
 *
 * The SVG deliberately does NOT lock its aspect ratio: its 100x100 viewBox is
 * the same percent space every card is positioned in, so a citation can never
 * miss what it points at. It renders BEHIND everything, so a hairline that
 * passes a resting card simply goes behind it.
 */

const HAIR_W = 0.18;
const SPARK_W = 0.6;
const DRAW = { duration: 0.8, ease: "easeInOut" } as const;
const RIDE = { duration: 1.5, repeat: Infinity, ease: "easeInOut" } as const;

function Cite({
  d,
  drawn,
  frac,
  linking,
  stroke,
  reduced,
}: {
  d: string;
  drawn: boolean;
  /** How much of the run is still showing — 1 while the card is in use. */
  frac: number;
  linking: boolean;
  stroke: string;
  reduced: boolean;
}) {
  const settled = frac < 1;
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={HAIR_W}
        strokeLinecap="round"
        style={{ opacity: 0.9 }}
        initial={reduced ? false : { pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: drawn ? frac : 0, pathOffset: drawn ? 1 - frac : 0 }}
        transition={reduced ? { duration: 0 } : settled ? SETTLE : DRAW}
      />
      {linking && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth={SPARK_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 70)})` }}
          initial={{ pathLength: 0.09, pathOffset: 1 - frac, opacity: 0 }}
          animate={{ pathLength: 0.09, pathOffset: [1 - frac, 0.91], opacity: [0, 1, 1, 0] }}
          transition={RIDE}
        />
      )}
    </>
  );
}

export default function Threads({
  layout,
  known,
  atRest,
  linking,
  linkIndex,
  together,
  reduced,
}: {
  layout: FieldLayout;
  known: ModuleStage[];
  atRest: boolean[];
  /** The settled card is proving its join is still there. */
  linking: boolean;
  linkIndex: number;
  together: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const paths = useMemo(() => layout.known.map((g) => citePath(layout, g)), [layout]);
  const rests = useMemo(() => layout.known.map((g) => restFrac(layout, g)), [layout]);
  const nodes = useMemo(() => layout.known.map((g) => citeTo(layout, g)), [layout]);

  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={false}
      animate={{ opacity: together && !reduced ? [1, 0.74, 1] : 1 }}
      transition={together && !reduced ? BREATH : { duration: 0.4 }}
      aria-hidden="true"
    >
      <defs>
        {/* One field-wide ramp: faintest up in the light where a thing is
            being used, firmest down at the record where it came from — the
            further from use, the more permanent the ink. */}
        <linearGradient id={`${uid}-ink`} gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="95">
          <stop offset="0%" stopColor={tint("cyan", 30)} />
          <stop offset="100%" stopColor={tint("cyan", 66)} />
        </linearGradient>
      </defs>

      {layout.known.map((g, k) => {
        const drawn = atStage(known[g.i], "detail");
        return (
          <g key={g.i}>
            <Cite
              d={paths[k]}
              drawn={drawn}
              frac={atRest[g.i] ? rests[k] : 1}
              linking={linking && g.i === linkIndex}
              stroke={`url(#${uid}-ink)`}
              reduced={reduced}
            />
            {/* Where the citation lands. A conversation that produced
                something durable carries the mark of it, permanently. */}
            <motion.circle
              cx={nodes[k].x}
              cy={nodes[k].y}
              r={0.55}
              fill={BRAND_VAR.cyan}
              initial={false}
              animate={{ opacity: drawn ? 0.9 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.5, delay: drawn ? 0.6 : 0 }}
            />
          </g>
        );
      })}
    </motion.svg>
  );
}
