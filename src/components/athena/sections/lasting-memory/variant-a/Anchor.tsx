"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * A field-sized layer whose TRANSFORM carries its child to a point on the
 * field.
 *
 * Percentage transforms resolve against the element's own box, and this box is
 * exactly the field — so `y: "40%"` lands the child 40% down it, on the
 * compositor, without ever touching `left`/`top`. That matters twice here: the
 * things riding this layer travel long distances (she rises the height of the
 * basin; the label that marks what was set aside falls with it), and a
 * React-applied `style.top` alongside `animate` would re-assert the
 * destination on every render, leaving the spring no distance to travel.
 *
 * Children anchor at the layer's top-left (`left-0 top-0`) and place
 * themselves on the point with their own translate.
 */

export type Glide =
  | { type: "spring"; stiffness: number; damping: number; mass?: number }
  | { duration: number; ease?: readonly [number, number, number, number] };

export default function Anchor({
  at,
  glide,
  className = "",
  children,
}: {
  at: { x: number; y: number };
  glide: Glide;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={false}
      animate={{ x: `${at.x}%`, y: `${at.y}%` }}
      transition={glide}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
