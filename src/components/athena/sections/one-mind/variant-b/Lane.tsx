"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { dropPath, legPath, risePath, type SceneLayout } from "./layout";

/**
 * The one line under everything.
 *
 * It is deliberately the quietest thing on the field for twenty seconds: a
 * hairline that leaves the first conversation, crosses the dark twice, and
 * comes up in two conversations that never asked for it. Nothing rides it,
 * nothing pulses along it — she is the only light that travels here, and a
 * section about not being made to repeat yourself should not be busy.
 *
 * Each crossing carries a gradient that goes faint in its middle and firm
 * again at both ends. That is the days: the line is quiet for a while, and it
 * is still the same line when it arrives. It renders BEHIND the conversations,
 * so a leg passing under a panel simply goes behind it.
 *
 * At the close every piece lights in sequence along its own length, which
 * takes about a second and reveals what was true the whole time — it was
 * never five lines.
 *
 * The SVG does NOT lock its aspect ratio: its 100×100 viewBox is the same
 * percent space the conversations are placed in, so a line can never miss the
 * words it belongs to. The cost is that stroke width scales with the field,
 * which on a hairline reads as ink rather than as a defect.
 */

const BASE_W = 0.3;
const SWEEP_W = 0.62;
const DRAW = { duration: 0.9, ease: "easeInOut" } as const;

/** How far along the whole run each piece sits — the closing light crosses
 *  them in this order, so it reads as ONE line rather than five. */
const SWEEP = [
  { delay: 0, duration: 0.3 },
  { delay: 0.24, duration: 0.4 },
  { delay: 0.6, duration: 0.28 },
  { delay: 0.6, duration: 0.45 },
  { delay: 1, duration: 0.28 },
] as const;

function Segment({
  d,
  drawn,
  closed,
  stroke,
  sweep,
  reduced,
}: {
  d: string;
  drawn: boolean;
  closed: boolean;
  stroke: string;
  sweep: (typeof SWEEP)[number];
  reduced: boolean;
}) {
  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={BASE_W}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0, opacity: closed ? 1 : 0.62 }}
        transition={reduced ? { duration: 0 } : DRAW}
      />
      {closed && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke={tint("cyan", 85)}
          strokeWidth={SWEEP_W}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${tint("cyan", 60)})` }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0.55] }}
          transition={{ ...sweep, ease: "easeInOut" }}
        />
      )}
    </>
  );
}

export default function Lane({
  layout,
  drop,
  legs,
  risers,
  closed,
  reduced,
}: {
  layout: SceneLayout;
  drop: boolean;
  legs: boolean[];
  risers: boolean[];
  closed: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const paths = useMemo(
    () => ({
      drop: dropPath(layout),
      legs: [legPath(layout, 0), legPath(layout, 1)],
      risers: [risePath(layout, 0), risePath(layout, 1)],
    }),
    [layout],
  );
  const solid = tint("cyan", 52);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {layout.stations.slice(0, 2).map((s, i) => (
          <linearGradient
            key={i}
            id={`${uid}-gap${i}`}
            gradientUnits="userSpaceOnUse"
            x1={s.x}
            y1={s.y}
            x2={layout.stations[i + 1].x}
            y2={layout.stations[i + 1].y}
          >
            <stop offset="0%" stopColor={tint("cyan", 52)} />
            <stop offset="50%" stopColor={tint("cyan", 15)} />
            <stop offset="100%" stopColor={tint("cyan", 52)} />
          </linearGradient>
        ))}
      </defs>

      <Segment
        d={paths.drop}
        drawn={drop}
        closed={closed}
        stroke={solid}
        sweep={SWEEP[0]}
        reduced={reduced}
      />
      {paths.legs.map((d, i) => (
        <Segment
          key={`leg${i}`}
          d={d}
          drawn={legs[i]}
          closed={closed}
          // The days go quiet in the middle of a crossing — until the close,
          // where the whole run has to read as one unbroken line and the
          // gradient would be the only thing still saying otherwise.
          stroke={closed ? solid : `url(#${uid}-gap${i})`}
          sweep={SWEEP[i === 0 ? 1 : 3]}
          reduced={reduced}
        />
      ))}
      {paths.risers.map((d, i) => (
        <Segment
          key={`rise${i}`}
          d={d}
          drawn={risers[i]}
          closed={closed}
          stroke={solid}
          sweep={SWEEP[i === 0 ? 2 : 4]}
          reduced={reduced}
        />
      ))}

      {/* Where a line meets the words it belongs to. */}
      {layout.ports.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={0.62}
          fill={tint("cyan", 80)}
          initial={false}
          animate={{ opacity: (i === 0 ? drop : risers[i - 1]) ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4 }}
        />
      ))}
    </svg>
  );
}
