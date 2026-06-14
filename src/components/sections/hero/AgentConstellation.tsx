"use client";

import { motion } from "framer-motion";
import { AGENTS, CX, CY, spinOrigin } from "./command-center-geometry";

/**
 * AgentConstellation — the orbiting "agents" the command center orchestrates.
 * Extracted from {@link CommandCenterIllustration} to keep that file under the
 * 200-line budget. Each agent rides a distinct radius/speed with a faint
 * pulsing spoke to the core; rendered static (no rotation/pulse) under reduced
 * motion. Motion gating is owned by the parent and passed via `reduced`.
 */
export default function AgentConstellation({
  cyan,
  reduced,
}: {
  cyan: string;
  reduced: boolean;
}) {
  return (
    <>
      {AGENTS.map((a, i) => {
        const body = (
          <>
            <circle cx={a.x} cy={a.y} r={6} fill={cyan} opacity={0.16} />
            <circle cx={a.x} cy={a.y} r={2.6} fill={cyan} opacity={0.9} />
          </>
        );
        return reduced ? (
          <g key={i}>
            <line x1={CX} y1={CY} x2={a.x} y2={a.y} stroke={cyan} strokeWidth="0.6" opacity={0.12} />
            {body}
          </g>
        ) : (
          <motion.g
            key={i}
            animate={{ rotate: 360 * a.dir }}
            transition={{ duration: a.duration, repeat: Infinity, ease: "linear" }}
            style={spinOrigin}
          >
            <motion.line
              x1={CX}
              y1={CY}
              x2={a.x}
              y2={a.y}
              stroke={cyan}
              strokeWidth="0.6"
              animate={{ opacity: [0.06, 0.2, 0.06] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            />
            {body}
          </motion.g>
        );
      })}
    </>
  );
}
