"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { LANES } from "./data";

/**
 * The river: everything small that happens in a day, drifting along the line
 * as lanes of tiny lights (each lane carries its own edge mask: a mask on
 * the zero-height wrapper would hide everything) - denser and brighter close to it. Each lane is a
 * repeating dot strip translated by exactly one period per loop, so it flows
 * forever without a seam. When she speaks the river falls back and her voice
 * has the frame to itself.
 */
export default function River({ speaking, live }: { speaking: boolean; live: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[var(--line-y)] h-0"
      initial={false}
      animate={{ opacity: speaking ? 0.35 : 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {LANES.map((l, i) => (
        <div
          key={i}
          className="absolute inset-x-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
          style={{ top: `calc(var(--wave-h) * ${l.f.toFixed(3)} - ${l.size}px)`, height: l.size * 2 }}
        >
          <motion.div
            className="absolute inset-y-0"
            style={{
              left: -l.period,
              right: -l.period,
              backgroundImage: `radial-gradient(circle, ${tint("cyan", l.alpha)} ${l.size * 0.5}px, transparent ${l.size}px)`,
              backgroundSize: `${l.period}px 100%`,
              backgroundPosition: `${(i * 13) % l.period}px 0`,
            }}
            animate={live ? { x: [0, -l.period] } : undefined}
            transition={{ duration: l.seconds, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ))}
    </motion.div>
  );
}
