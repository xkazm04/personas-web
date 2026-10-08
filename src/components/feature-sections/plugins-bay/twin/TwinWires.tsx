"use client";

import { motion } from "framer-motion";
import { WIRE_Y, type TwinFrame } from "./twinData";

const A = "var(--brand-amber)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const PULSE = 0.22;

/**
 * One source, three wires: from the twin's edge to each channel card. On the
 * mirror beat three pulses leave together; on each reply beat one pulse runs
 * home along its own wire. Pulses are dashes on the wire itself (pathLength
 * 1), so the stretched viewBox never distorts them.
 */
export default function TwinWires({ frame, run }: { frame: TwinFrame; run: boolean }) {
  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {WIRE_Y.map((y, i) => {
        const d = `M0 50 C 55 50, 45 ${y}, 100 ${y}`;
        const out = frame.sending && run;
        const home = frame.returning === i && run;
        return (
          <g key={y}>
            <path
              d={d}
              fill="none"
              stroke={frame.toned ? mix(A, 70) : mix(A, 22)}
              strokeWidth={frame.toned ? 2 : 1.2}
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke 500ms, stroke-width 500ms" }}
            />
            <motion.path
              key={out ? `out-${frame.phase}` : home ? `home-${frame.phase}` : "idle"}
              d={d}
              fill="none"
              stroke={A}
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${PULSE} 2`}
              vectorEffect="non-scaling-stroke"
              style={{ filter: `drop-shadow(0 0 4px ${A})` }}
              initial={{ strokeDashoffset: out ? PULSE : -1, opacity: out || home ? 1 : 0 }}
              animate={{ strokeDashoffset: out ? -1 : PULSE, opacity: out || home ? [1, 1, 0] : 0 }}
              transition={out || home ? { duration: 0.9, ease: "easeInOut" } : { duration: 0 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
