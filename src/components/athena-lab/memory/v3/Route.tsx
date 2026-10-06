"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { MARKS, RUN_TICKS, TICK_MS, type SceneState } from "./data";
import { pathOf, pointOn, segments, type MapGeo } from "./geometry";
import { Flag, Pin } from "./Glyphs";

/**
 * Above the fog: the two ends of the errand and the two trips' traces.
 *
 * The first trip leaves FOOTSTEPS - a dotted trace that draws one leg at a
 * time, with a pause at every landmark where she had to stop and ask. The
 * second trip is one continuous lit line drawn in a single run, and each
 * landmark flares as the line passes it: she is using what she knows, not
 * asking. On the held frame the lit run lies over the footsteps.
 */

/** The second run, leg by leg: equal time per leg, matching the traveller. */
const LEG_S = (RUN_TICKS * TICK_MS) / 1000 / (MARKS.length + 1);
/** Where the footsteps fall along each leg. */
const STEPS = Array.from({ length: 11 }, (_, k) => (k + 0.5) / 11);

export default function Route({ geo, scene, reduced }: { geo: MapGeo; scene: SceneState; reduced: boolean }) {
  const segs = segments(geo.stops);
  const start = geo.stops[0];
  const end = geo.stops[geo.stops.length - 1];
  const second = scene.running || scene.secondDone;

  return (
    <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
      {/* First trip: footsteps, one leg at a time, as she walks it. */}
      {segs.map((s, i) =>
        STEPS.map((t, k) => {
          const p = pointOn(s, t);
          const on = scene.legs > i;
          return (
            <motion.circle
              key={`a${i}-${k}`}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill={tint("cyan", 75)}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2, delay: on ? k * 0.075 : 0 }}
            />
          );
        }),
      )}

      {segs.map((s, i) => (
        <motion.path
          key={`b${i}`}
          d={pathOf([s])}
          stroke={BRAND_VAR.cyan}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${tint("cyan", 70)})` }}
          initial={false}
          animate={{ pathLength: second ? 1 : 0, opacity: second ? 0.9 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : second
                ? { duration: LEG_S, delay: scene.secondDone ? 0 : i * LEG_S, ease: "linear" }
                : { duration: 0.4 }
          }
        />
      ))}

      {/* Each landmark flares as the second run passes it. */}
      {MARKS.map((m, i) => (
        <motion.circle
          key={m.key}
          cx={geo.stops[i + 1].x}
          cy={geo.stops[i + 1].y}
          r={34}
          stroke={BRAND_VAR.cyan}
          strokeWidth={2}
          initial={false}
          animate={scene.running && !reduced ? { opacity: [0, 0, 1, 0], scale: [1, 1, 1.25, 1.7] } : { opacity: 0, scale: 1 }}
          transition={scene.running && !reduced ? { duration: (i + 1) * LEG_S + 0.7, times: [0, ((i + 1) * LEG_S) / ((i + 1) * LEG_S + 0.7), ((i + 1) * LEG_S + 0.2) / ((i + 1) * LEG_S + 0.7), 1] } : { duration: 0.3 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}

      <g transform={`translate(${start.x} ${start.y - 34}) scale(2)`} style={{ color: "var(--foreground)" }}>
        <Pin />
      </g>
      <g transform={`translate(${end.x} ${end.y - 30}) scale(1.9)`} style={{ color: BRAND_VAR.cyan }}>
        <Flag />
      </g>
      <motion.circle
        cx={end.x}
        cy={end.y}
        r={40}
        fill={tint("cyan", 14)}
        initial={false}
        animate={{ opacity: scene.firstDone ? 1 : 0.25 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
      />
    </svg>
  );
}
