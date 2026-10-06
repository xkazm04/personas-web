"use client";

import type { ReactNode } from "react";
import { motion, type MotionValue } from "framer-motion";
import { useTimelineCopy } from "./shared/Frame";
import { BG, CYAN, FG } from "./shared/motion";
import type { Track } from "./data";
import { Railway, Terrain } from "./Map";
import { Route, Train } from "./Movers";

/** One scenario's map: the drawn layers of `g`, with its HTML words on top. */
export default function Scene({ g, p, children }: { g: Track; p: MotionValue<number>; children: ReactNode }) {
  const label = useTimelineCopy().v3.artLabel;
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <svg viewBox={`0 0 ${g.w} ${g.h}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label}>
        <defs>
          <filter id="tl3-blur" x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <pattern id="tl3-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill={FG} fillOpacity="0.16" />
          </pattern>
          <pattern id="tl3-check" width="11" height="11" patternUnits="userSpaceOnUse">
            <rect width="11" height="11" fill={BG} />
            <rect width="5.5" height="5.5" fill={FG} fillOpacity="0.8" />
            <rect x="5.5" y="5.5" width="5.5" height="5.5" fill={FG} fillOpacity="0.8" />
          </pattern>
          <radialGradient id="tl3-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.1" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={g.w / 2} cy={g.h / 2} rx={g.w / 2} ry={g.h / 2} fill="url(#tl3-glow)" />
        <Terrain g={g} />
        <Railway g={g} p={p} />
        <Route g={g} p={p} />
        <Train g={g} p={p} />
      </svg>
      {children}
    </motion.div>
  );
}
