"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";

/**
 * The ground under the portfolio - WORLD space, carried by the camera.
 *
 * Three layers of terrain, coarse to fine, so the descent keeps finding more:
 * contour lines (the lie of the land, non-scaling hairlines like any map), the
 * survey grid (its squares double as the camera comes down - the altimeter
 * the eye reads first), and a finer grid that only resolves once the camera
 * has landed. Nothing here means anything; it is all depth.
 */

/** Authored contours in a 100x100 field. Deterministic, never rolled. */
const CONTOURS = [
  "M -2 8 C 18 2, 30 14, 52 7 S 84 3, 102 10",
  "M -2 34 C 12 28, 26 38, 44 31 S 70 24, 102 33",
  "M -2 36.5 C 14 31, 27 41, 45 34 S 71 27, 102 36",
  "M -2 61 C 20 56, 34 66, 55 59 S 82 54, 102 62",
  "M -2 63.5 C 21 58.5, 35 69, 56 62 S 83 57, 102 65",
  "M -2 90 C 16 85, 38 94, 58 88 S 86 84, 102 92",
  "M 30 46 C 34 43, 41 44, 42 48 S 35 53, 31 50 Z",
  "M 72 82 C 77 79, 85 81, 84 85 S 76 89, 72 86 Z",
] as const;

export default function Ground({ landed, reduced }: { landed: boolean; reduced: boolean }) {
  const grid = (c: number) =>
    `linear-gradient(to right, ${tint("cyan", c)} 1px, transparent 1px), linear-gradient(to bottom, ${tint("cyan", c)} 1px, transparent 1px)`;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Floor light: the ground is lit from where she rests */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 70% at 50% 0%, ${tint("cyan", 6)}, transparent 75%)` }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONTOURS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={tint("cyan", 12)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="absolute inset-0" style={{ backgroundImage: grid(7), backgroundSize: "8.3333% 12.5%" }} />
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: grid(5), backgroundSize: "2.0833% 3.125%" }}
        initial={false}
        animate={{ opacity: landed ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.8 }}
      />
    </div>
  );
}
