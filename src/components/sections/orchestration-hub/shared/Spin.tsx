"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion } from "framer-motion";

type MotionGProps = Omit<ComponentProps<typeof motion.g>, "children">;

interface SpinProps extends MotionGProps {
  /** The pivot, in the parent's user units. */
  x: number;
  y: number;
  /** Reach of the children around the pivot: an invisible circle this big
   *  centres the group's fill-box on the pivot. */
  r: number;
  /** Drawn relative to the pivot (0, 0). */
  children: ReactNode;
}

/**
 * Rotate SVG content about a point. framer-motion pivots an SVG element on the
 * centre of its own fill-box (it overrides `transform-box`), so a clock hand or
 * a radar sweep would orbit the wrong point; drawing the content around (0, 0)
 * inside an invisible circle puts that centre exactly on the pivot.
 */
export default function Spin({ x, y, r, children, ...motionProps }: SpinProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g {...motionProps}>
        <circle r={r} fill="none" />
        {children}
      </motion.g>
    </g>
  );
}
