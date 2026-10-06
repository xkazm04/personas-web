"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import Backdrop from "./Backdrop";
import type { GardenState } from "./data";
import { CAUSE, PLANTS, ROT_PATH, VB } from "./geometry";
import Plant from "./Plant";

/**
 * The drawn half of "Roots": sky, soil, every plant and its roots, and the
 * one run that went bad.
 *
 * The bad run is the section's argument in one stroke. It is invisible from
 * above - all you could see up there was a lean - and it only lights as she
 * goes down it, rose, from the stem to the cause. When the fix is taken it
 * heals the other way, emerald, from the cause back up to the plant.
 */

/** The same run, read upward - the way the fix travels. */
const HEAL_PATH = "M 708 616 L 708 496 L 800 404 L 800 320";

export default function Garden({ g, live, reduced }: { g: GardenState; live: boolean; reduced: boolean }) {
  const uid = useId().replace(/:/g, "");
  const trace = reduced ? { duration: 0 } : { duration: 2.4, ease: [0.5, 0, 0.3, 1] as const };
  const heal = reduced ? { duration: 0 } : { duration: 1.6, ease: "easeOut" } as const;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <Backdrop uid={uid} live={live} />

      {PLANTS.map((plant, k) => (
        <Plant
          key={plant.project}
          plant={plant}
          index={k}
          stage={g.stages[k]}
          tone={g.tones[k]}
          wilt={g.wilt[k]}
          settled={g.settled}
          live={live}
          reduced={reduced}
        />
      ))}

      {/* The bad run, lit as she reads it */}
      <motion.path
        d={ROT_PATH}
        fill="none"
        stroke={BRAND_VAR.rose}
        strokeWidth={4}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${tint("rose", 70)})` }}
        initial={false}
        animate={{ pathLength: g.traced ? 1 : 0, opacity: g.traced && !g.healed ? 1 : 0 }}
        transition={g.traced ? trace : { duration: reduced ? 0 : 0.4 }}
      />
      {/* ...and healed from the cause back up */}
      <motion.path
        d={HEAL_PATH}
        fill="none"
        stroke={BRAND_VAR.emerald}
        strokeWidth={4}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${tint("emerald", 60)})` }}
        initial={false}
        animate={{ pathLength: g.healed ? 1 : 0, opacity: g.healed ? 1 : 0 }}
        transition={heal}
      />

      {/* The cause - what the project actually stands on that went bad */}
      {/* Plain elements for colour: SVG motion elements keep the colour they
          mounted with, so the ring takes currentColor from this group. */}
      <g style={{ color: g.healed ? BRAND_VAR.emerald : g.open ? BRAND_VAR.rose : tint("cyan", 40), transition: reduced ? undefined : "color .5s" }}>
      <circle
        cx={CAUSE.x}
        cy={CAUSE.y}
        fill="currentColor"
        style={{ r: g.open || g.healed ? 11 : 4, transition: reduced ? undefined : "r .4s" }}
      />
      <motion.circle
        cx={CAUSE.x}
        cy={CAUSE.y}
        r={11}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        style={{ originX: 0.5, originY: 0.5 }}
        initial={false}
        animate={
          live && g.open && !g.healed
            ? { scale: [1, 3], opacity: [0.8, 0] }
            : { scale: 1, opacity: g.open || g.healed ? 0.5 : 0 }
        }
        transition={live && g.open && !g.healed ? { duration: 1.4, repeat: Infinity, ease: "easeOut" } : { duration: 0 }}
      />
      </g>
    </svg>
  );
}
