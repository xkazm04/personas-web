"use client";

import { motion } from "framer-motion";
import { loopTransition } from "@/lib/motion/loop-gate";
import { DESK, type DeskState } from "./geometry";

/**
 * A desk's monitor: dark while idle, lines being written while the agent
 * works (a loop, gated), a check once it is done. The screen is a parallelogram
 * on the desk's back edge, so its contents are skewed to match.
 */
export default function DeskScreen({ points, x, y, color, state, run }: { points: string; x: number; y: number; color: string; state: DeskState; run: boolean }) {
  const t = y - DESK.h;
  // Screen-local frame: origin at the bottom-left corner, x along the slope.
  const transform = `translate(${x - 46} ${t - 8}) skewY(-26.6)`;
  const lit = state !== "idle";
  const typing = state === "working" && run;
  return (
    <g>
      <polygon
        points={points}
        fill={lit ? `color-mix(in srgb, ${color} 22%, var(--background))` : "color-mix(in srgb, var(--foreground) 6%, var(--background))"}
        stroke={lit ? color : "color-mix(in srgb, var(--foreground) 25%, transparent)"}
        strokeWidth={1.5}
        style={{ transition: "fill .4s, stroke .4s" }}
      />
      <g transform={transform}>
        {[0, 1, 2].map((k) => (
          <motion.rect
            key={k}
            x={8}
            y={-52 + k * 13}
            height={5}
            rx={2}
            fill={color}
            initial={false}
            animate={typing ? { width: [0, 38 - k * 8, 38 - k * 8], opacity: 0.9 } : { width: 38 - k * 8, opacity: state === "working" ? 0.9 : 0 }}
            transition={typing ? loopTransition(true, { duration: 0.9, delay: k * 0.25, ease: "easeOut" }) : { duration: 0 }}
          />
        ))}
        <motion.path
          d="M14 -30 L24 -20 L44 -44"
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: state === "done" ? 1 : 0, opacity: state === "done" ? 1 : 0 }}
          transition={{ duration: run ? 0.4 : 0 }}
        />
      </g>
    </g>
  );
}
