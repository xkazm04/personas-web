"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * A canvas-sized layer whose transform carries its child to (x%, y%).
 *
 * Percentage transforms resolve against the element's OWN box, and this box is
 * exactly the canvas — so `x: "40%"` lands the child 40% across it. That keeps
 * Athena's journey on the compositor instead of animating `left`/`top`, which
 * thrashes layout every frame. It also avoids the trap that made her teleport
 * between stops: a React `style={{ left, top }}` alongside `animate` re-applies
 * the destination inline on every render, so the spring has no distance left to
 * travel. Position lives in exactly one place — the transform.
 *
 * Children anchor at the layer's top-left (`left-0 top-0`) and center
 * themselves on the point with `-translate-x-1/2 -translate-y-1/2`.
 */

export type TravelSpring =
  | { type: "spring"; stiffness: number; damping: number; mass?: number }
  | { duration: number };

export default function TravelLayer({
  x,
  y,
  spring,
  className = "",
  children,
}: {
  x: number;
  y: number;
  spring: TravelSpring;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={false}
      animate={{ x: `${x}%`, y: `${y}%` }}
      transition={spring}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
