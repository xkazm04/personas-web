"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Point } from "./layout";

/**
 * A field-sized layer whose TRANSFORM carries its child to a point.
 *
 * Percentage transforms resolve against the element's own box, and this box is
 * exactly the field — so `x: "40%"` lands the child 40% across it, on the
 * compositor, without ever touching `left`/`top`. That matters twice on this
 * field: the two things that move are the two things carrying TYPE (the fact
 * in flight and Athena), and a React-applied `style.left` alongside `animate`
 * re-asserts the destination on every render, leaving the spring no distance
 * to travel and making the traveller teleport.
 *
 * Children anchor at the layer's top-left (`left-0 top-0`) and centre
 * themselves on the point with `-translate-x-1/2 -translate-y-1/2`.
 */
export default function Anchor({
  at,
  from,
  transition,
  className = "",
  children,
}: {
  at: Point;
  /** Start point, for a layer mounted mid-journey. */
  from?: Point;
  transition: object;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={from ? { x: `${from.x}%`, y: `${from.y}%` } : false}
      animate={{ x: `${at.x}%`, y: `${at.y}%` }}
      transition={transition}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}
