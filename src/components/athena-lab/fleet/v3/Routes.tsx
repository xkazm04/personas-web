"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { HUES } from "../shared/cast";
import type { Errand } from "./data";
import { pathOf, routePoints, type WorldLayout } from "./layout";

/**
 * The roads between her and your tools. A route DRAWS the moment its job
 * exists (the plan, visible), glows while its teammate is on it, and settles
 * to a calm lit line once the errand is over. One more line rises from her
 * into the bubble when the answer is on its way up.
 */
export default function Routes({
  layout: L,
  routed,
  errand,
  answering,
  reduced,
}: {
  layout: WorldLayout;
  routed: boolean[];
  errand: Errand[];
  answering: boolean;
  reduced: boolean;
}) {
  const paths = useMemo(() => L.stations.map((_, i) => pathOf(routePoints(L, i))), [L]);
  const up = `M ${L.hub.x} ${L.hub.y - 48} L ${L.hub.x} ${L.bubble.y + L.bubble.h + 10}`;
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {paths.map((d, i) => {
        const moving = errand[i] === "out" || errand[i] === "back";
        return (
          <g key={i}>
            <motion.path
              d={d}
              fill="none"
              stroke={tint(HUES[i], 26)}
              strokeWidth={9}
              strokeLinecap="round"
              style={{ filter: "blur(6px)" }}
              initial={false}
              animate={{ opacity: moving ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={BRAND_VAR[HUES[i]]}
              strokeWidth={1.8}
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: routed[i] ? 1 : 0, opacity: routed[i] ? (moving ? 1 : 0.6) : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
            />
          </g>
        );
      })}
      <motion.path
        d={up}
        fill="none"
        stroke={BRAND_VAR.cyan}
        strokeWidth={2}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${tint("cyan", 70)})` }}
        initial={false}
        animate={{ pathLength: answering ? 1 : 0, opacity: answering ? 0.9 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}
