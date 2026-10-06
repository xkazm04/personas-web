"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { BREATH } from "../shared/parts";

/**
 * The shared memory, made visible: a ring of light around her that fills one
 * point per conversation, each landing on the side its thread came in from.
 *
 * Six conversations, one ring - that is the claim in a single shape. While she
 * is gathering and composing the ring turns, and the turn is driven by the
 * scene clock (`spin`, degrees, advanced one tween per tick) rather than by an
 * infinite loop, so it stops exactly when the clock stops: off screen, in a
 * background tab, under reduced motion, and in the closing hold. From the
 * one-voice beat every light rides the section's shared breath.
 */

export default function MemoryRing({
  angles,
  motes,
  spin,
  together,
  running,
  reduced,
}: {
  angles: readonly number[];
  motes: number;
  spin: number;
  together: boolean;
  running: boolean;
  reduced: boolean;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 aspect-square w-[185%] -translate-x-1/2 -translate-y-1/2"
      initial={false}
      animate={{ rotate: spin }}
      transition={reduced || spin === 0 ? { duration: 0 } : { duration: 0.9, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={tint("cyan", motes > 0 ? 34 : 14)}
          strokeWidth="0.6"
          strokeDasharray="1.2 3.2"
        />
      </svg>
      {angles.map((deg, i) => {
        const lit = motes > i;
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${50 + 48 * Math.cos(rad)}%`,
              top: `${50 + 48 * Math.sin(rad)}%`,
              backgroundColor: BRAND_VAR.cyan,
              boxShadow: `0 0 12px ${tint("cyan", 80)}`,
            }}
            initial={false}
            animate={
              !lit
                ? { scale: 0, opacity: 0 }
                : together && running
                  ? { scale: 1, opacity: [1, 0.55, 1] }
                  : { scale: 1, opacity: 1 }
            }
            transition={
              !lit || reduced
                ? { duration: reduced ? 0 : 0.3 }
                : together && running
                  ? { scale: { duration: 0.3 }, opacity: BREATH }
                  : { type: "spring", stiffness: 260, damping: 14 }
            }
          />
        );
      })}
    </motion.div>
  );
}
