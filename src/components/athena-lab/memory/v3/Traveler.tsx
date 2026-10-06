"use client";

import { motion } from "framer-motion";
import AthenaFace from "../shared/AthenaFace";
import { RUN_TICKS, TICK_MS, type SceneState } from "./data";
import { pct, ride, type MapGeo } from "./geometry";

/**
 * Athena on the road. She rides the same curve the road is drawn from (pure
 * Bezier samples from `./geometry`), on a full-map track so her x/y are
 * percents of the map and every move is a transform.
 *
 * First trip: one leg per tick, stopping at each landmark while she asks.
 * Between trips she is simply back at the start - an instant cut under a
 * fade, never a slide back across the map. Second trip: the whole road in one
 * run, with no stops.
 */
export default function Traveler({ geo, scene, reduced }: { geo: MapGeo; scene: SceneState; reduced: boolean }) {
  const last = geo.stops.length - 1;
  let target: { x: string | string[]; y: string | string[] };
  let transition: object = { duration: 0 };

  if (scene.trip === 1 && scene.leg >= 0) {
    const { xs, ys } = ride(geo, scene.leg, scene.leg + 1);
    target = { x: xs, y: ys };
    transition = { duration: (TICK_MS / 1000) * 0.9, ease: "easeInOut" };
  } else if (scene.trip === 2 && scene.running) {
    const { xs, ys } = ride(geo, 0, last);
    target = { x: xs, y: ys };
    transition = { duration: (RUN_TICKS * TICK_MS) / 1000, ease: "linear" };
  } else {
    const stop =
      scene.trip === 0 || (scene.trip === 2 && !scene.secondDone)
        ? 0
        : scene.trip === 2 || scene.firstDone
          ? last
          : scene.at + 1;
    target = pct(geo, geo.stops[Math.max(0, stop)]);
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={target}
      transition={reduced ? { duration: 0 } : transition}
      aria-hidden="true"
    >
      {/* Keyed by trip: the cut back to the start lands under a fade-in. */}
      <motion.span
        key={scene.trip}
        className="absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        <AthenaFace size={`calc(${geo.face} * 100cqw / ${geo.W})`} glow={scene.at >= 0 || scene.running} reduced={reduced} />
      </motion.span>
    </motion.div>
  );
}
