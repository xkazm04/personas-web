"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

const PARTICLES = [0, 0.5];

/**
 * One copper trace: a soft halo, a core line and data packets riding it via
 * CSS motion path. `state` null = healthy. Broken and diagnosing traces are
 * dashed (the connection is open); packets only flow on a closed trace.
 */
export default function Trace({
  d,
  color,
  open,
  flowing,
  running,
}: {
  d: string;
  color: BrandKey;
  open: boolean;
  flowing: boolean;
  running: boolean;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={tint(color, 14)} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" />
      <motion.path
        d={d}
        fill="none"
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={false}
        animate={{ stroke: BRAND_VAR[color], strokeDasharray: open ? "7 7" : "7 0" }}
        transition={{ duration: 0.4 }}
      />
      {PARTICLES.map((offset) => (
        <motion.g
          key={offset}
          style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
          initial={{ offsetDistance: `${30 + offset * 50}%`, opacity: flowing ? 1 : 0 }}
          animate={
            running && flowing
              ? { offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }
              : { offsetDistance: `${30 + offset * 50}%`, opacity: flowing ? 1 : 0 }
          }
          transition={
            running && flowing
              ? { duration: 1.8, repeat: Infinity, ease: "linear", delay: offset * 1.8 }
              : { duration: 0.3 }
          }
        >
          <circle r={7} fill={BRAND_VAR[color]} filter="url(#hl-glow)" />
          <circle r={3.2} fill="var(--foreground)" />
        </motion.g>
      ))}
    </g>
  );
}
