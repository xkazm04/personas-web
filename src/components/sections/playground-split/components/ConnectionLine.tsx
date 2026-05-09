"use client";

import { motion } from "framer-motion";

export default function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  active,
  done,
  reduced,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  done: boolean;
  reduced: boolean;
}) {
  const midY = y1 + (y2 - y1) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.5"
      />
      <motion.path
        d={path}
        fill="none"
        stroke={done ? "#34d399" : active ? "#06b6d4" : "transparent"}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: done || active ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6, ease: "easeInOut" }}
      />
    </g>
  );
}
