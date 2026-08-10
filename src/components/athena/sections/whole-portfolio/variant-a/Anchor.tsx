"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * A field-sized layer whose TRANSFORM carries its child to a screen point.
 *
 * Percentage transforms resolve against the element's own box, and this box
 * is exactly the field — so `x: "40%"` lands the child 40% across it, on the
 * compositor, without ever touching `left`/`top`. That matters twice here:
 * layout is not thrashed every frame while the camera is also moving, and
 * (the bug this pattern exists to avoid) a React-applied `style.left`
 * alongside `animate` re-asserts the destination on every render, leaving
 * the spring no distance to travel and making her teleport.
 *
 * Children anchor at the layer's top-left (`left-0 top-0`) and centre
 * themselves on the point with `-translate-x-1/2 -translate-y-1/2`.
 */

export type FlightSpring =
  | { type: "spring"; stiffness: number; damping: number; mass?: number }
  | { duration: number };

export default function Anchor({
  at,
  spring,
  className = "",
  children,
}: {
  at: { x: number; y: number };
  spring: FlightSpring;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={false}
      animate={{ x: `${at.x}%`, y: `${at.y}%` }}
      transition={spring}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
