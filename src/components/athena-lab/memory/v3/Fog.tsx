"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { tint } from "@/lib/brand-theme";
import type { MapGeo } from "./geometry";

/**
 * The fog over what she does not know yet.
 *
 * One layer, masked: the mask is white (fog) everywhere except soft holes -
 * a permanent one at each end of the road (where you are, and where the
 * errand ends, are never in doubt) and one per landmark that opens a little
 * while she is asking and all the way once you have answered. A hole never
 * closes again inside the loop: the map only ever gets clearer.
 *
 * A few banks of mist drift slowly inside it. That drift is ambient, so it
 * stops under reduced motion and while the tab is in the background.
 */

/** Hole radius by landmark state: fog, asking, answered, known. */
const OPEN = [0, 0.32, 0.5, 1] as const;
/** Banks of mist, as shares of the map. */
const MIST = [
  { x: 0.3, y: 0.32, rx: 0.3, ry: 0.32 },
  { x: 0.7, y: 0.66, rx: 0.34, ry: 0.3 },
  { x: 0.92, y: 0.2, rx: 0.2, ry: 0.26 },
] as const;

export default function Fog({ geo, marks, reduced }: { geo: MapGeo; marks: number[]; reduced: boolean }) {
  const id = useId().replace(/:/g, "");
  const hidden = usePageVisibility();
  const still = reduced || hidden;
  const ends = [geo.stops[0], geo.stops[geo.stops.length - 1]];

  return (
    <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-mist`}>
          <stop offset="0" stopColor={tint("cyan", 9)} />
          <stop offset="0.6" stopColor={tint("cyan", 4)} />
          <stop offset="1" stopColor={tint("cyan", 0)} />
        </radialGradient>
        <radialGradient id={`${id}-hole`}>
          <stop offset="0" stopColor="black" />
          <stop offset="0.55" stopColor="black" />
          <stop offset="1" stopColor="white" />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={geo.W} height={geo.H}>
          <rect width={geo.W} height={geo.H} fill="white" />
          {ends.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={geo.clearR * 0.72} fill={`url(#${id}-hole)`} />
          ))}
          {marks.map((m, i) => (
            <motion.circle
              key={i}
              cx={geo.stops[i + 1].x}
              cy={geo.stops[i + 1].y}
              fill={`url(#${id}-hole)`}
              initial={false}
              animate={{ r: geo.clearR * OPEN[m] }}
              transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
            />
          ))}
        </mask>
      </defs>

      <g mask={`url(#${id}-mask)`}>
        <rect
          width={geo.W}
          height={geo.H}
          rx={28}
          fill="color-mix(in srgb, var(--background) 86%, transparent)"
        />
        <motion.g
          initial={false}
          animate={still ? { x: 0 } : { x: [-30, 30, -30] }}
          transition={still ? { duration: 0 } : { duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
          {MIST.map((m, i) => (
            <ellipse key={i} cx={geo.W * m.x} cy={geo.H * m.y} rx={geo.W * m.rx} ry={geo.H * m.ry} fill={`url(#${id}-mist)`} />
          ))}
        </motion.g>
      </g>
    </svg>
  );
}
