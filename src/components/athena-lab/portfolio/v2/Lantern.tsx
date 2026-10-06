"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { tint } from "@/lib/brand-theme";
import Avatar from "../shared/Avatar";
import type { GardenState } from "./data";
import { DESCENT, GROUND, pct, STATIONS, VB } from "./geometry";

/**
 * Athena in the garden - a lantern. She crosses the night sky with a cone of
 * light under her (the survey: every plant answers as the light reaches it),
 * then goes DOWN the one that is wilting: along the stem, under the ground,
 * root by root to the cause, and back up once the fix is in.
 *
 * Transform-only: a box the size of the garden whose x/y translate carries
 * her (percent translate resolves against the box itself). The descent is
 * one keyframed move along authored waypoints - constant arrays, so a
 * re-render never restarts it.
 */

const P = (p: { x: number; y: number }) => ({ x: `${pct(p).x}%`, y: `${pct(p).y}%` });
const DOWN = { x: DESCENT.map((p) => P(p).x), y: DESCENT.map((p) => P(p).y) };
const OVER = P(STATIONS.over);
const CONE_H = `${((GROUND - STATIONS.dawn.y) / VB.h) * 100}%`;

export default function Lantern({
  g,
  caption,
  live,
  reduced,
}: {
  g: GardenState;
  caption: string | null;
  live: boolean;
  reduced: boolean;
}) {
  const sweepX = STATIONS.dawn.x + (STATIONS.dusk.x - STATIONS.dawn.x) * g.sweep;
  const target =
    g.where === "down"
      ? DOWN
      : g.where === "over"
        ? OVER
        : g.where === "rest"
          ? P(STATIONS.rest)
          : P({ x: sweepX, y: STATIONS.dawn.y });
  const transition = reduced
    ? { duration: 0 }
    : g.where === "down"
      ? { duration: 2.4, ease: "easeInOut" as const, times: [0, 0.3, 0.55, 0.8, 1] }
      : g.where === "survey"
        ? { duration: 0.9, ease: "linear" as const }
        : { type: "spring" as const, stiffness: 40, damping: 14 };
  const x = g.where === "down" ? 100 : g.where === "survey" ? (sweepX / VB.w) * 100 : 50;
  const side = g.where === "survey" && g.sweep < 1 ? "below" : g.where === "down" || x > 55 ? "left" : "right";

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      initial={false}
      animate={target}
      transition={transition}
      aria-hidden="true"
    >
      {/* Her light - the survey, crossing every plant */}
      <motion.span
        className="absolute left-0 top-0 -translate-x-1/2"
        style={{
          width: "15%",
          height: CONE_H,
          clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
          background: `linear-gradient(to bottom, ${tint("cyan", 30)}, ${tint("cyan", 4)})`,
        }}
        initial={false}
        animate={{ opacity: g.where === "survey" || g.where === "dawn" ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
      />

      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <Avatar busy={g.busy} live={live} reduced={reduced} />
          <AnimatePresence mode="wait">
            {caption && (
              <motion.div
                key={caption}
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : SPRING_POP}
                className={`absolute whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-[clamp(1rem,2.4cqh,1.25rem)] text-brand-cyan backdrop-blur-sm ${
                  side === "below"
                    ? "left-1/2 top-14 -translate-x-1/2"
                    : side === "left"
                      ? "right-14 top-1/2 -translate-y-1/2 max-sm:left-14 max-sm:right-auto"
                      : "left-14 top-1/2 -translate-y-1/2"
                }`}
              >
                {caption}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
