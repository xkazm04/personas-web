"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { HUES, TOOLS } from "../shared/cast";
import ToolMark from "../shared/ToolMark";
import { DIAL } from "./layout";

/**
 * The dial's ink: four teammates' rings and the one-at-a-time track.
 *
 * Every ring starts at twelve o'clock and fills clockwise at its own pace, and
 * the teammate doing the work rides the tip of its ring wearing the real tool
 * it works in. Rotation, never position: the rider is a group turned about
 * the dial's centre, so between ticks it travels along the arc rather than
 * cutting across it, and the mark inside counter-turns so the logo stays
 * upright. When a ring closes, the rider is back at twelve, and the four
 * finish lined up there - the team, done, in one column.
 *
 * The faint outer track is the same four tasks done end to end. Its marker
 * crawls at the pace of one person, and the gap between it and the closed
 * rings is the whole argument.
 */

const { c, rings, serialR, stroke } = DIAL;
const TWEEN = { duration: 0.9, ease: "linear" } as const;
const PIVOT = { transformBox: "view-box", transformOrigin: `${c}px ${c}px` } as const;

function Rider({ r, i, turn, on, reduced }: { r: number; i: number; turn: number; on: boolean; reduced: boolean }) {
  const top = c - r;
  return (
    <motion.g style={PIVOT} initial={false} animate={{ rotate: turn * 360, opacity: on ? 1 : 0 }} transition={reduced ? { duration: 0 } : TWEEN}>
      <motion.g
        style={{ transformBox: "view-box", transformOrigin: `${c}px ${top}px` }}
        initial={false}
        animate={{ rotate: -turn * 360 }}
        transition={reduced ? { duration: 0 } : TWEEN}
      >
        <circle cx={c} cy={top} r={12.5} fill="var(--background)" stroke={BRAND_VAR[HUES[i]]} strokeWidth={2} />
        <foreignObject x={c - 7} y={top - 7} width={14} height={14}>
          <div className="flex h-full w-full text-foreground">
            <ToolMark name={TOOLS[i]} className="h-full w-full" />
          </div>
        </foreignObject>
      </motion.g>
    </motion.g>
  );
}

export default function Rings({
  joined,
  progress,
  running,
  serial,
  reduced,
}: {
  joined: boolean[];
  progress: number[];
  running: boolean;
  serial: number;
  reduced: boolean;
}) {
  const tween = reduced ? { duration: 0 } : TWEEN;
  return (
    <svg viewBox={`0 0 ${DIAL.size} ${DIAL.size}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {/* One person, one task at a time */}
      <circle cx={c} cy={c} r={serialR} fill="none" stroke="rgba(var(--surface-overlay), 0.14)" strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" />
      <motion.circle
        cx={c}
        cy={c}
        r={serialR}
        fill="none"
        stroke="rgba(var(--surface-overlay), 0.5)"
        strokeWidth={2.5}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        initial={false}
        animate={{ pathLength: serial, opacity: running ? 1 : 0 }}
        transition={tween}
      />
      <motion.g style={PIVOT} initial={false} animate={{ rotate: serial * 360, opacity: running ? 1 : 0 }} transition={tween}>
        <circle cx={c} cy={c - serialR} r={6} fill="var(--background)" stroke="rgba(var(--surface-overlay), 0.7)" strokeWidth={2} />
      </motion.g>

      {rings.map((r, i) => {
        const hue = BRAND_VAR[HUES[i]];
        const done = progress[i] >= 1;
        return (
          <g key={r}>
            {/* The track appears the moment the teammate joins - dashed while it is only a plan */}
            <motion.circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={tint(HUES[i], running ? 16 : 30)}
              strokeWidth={running ? stroke : 2}
              strokeDasharray={running ? undefined : "3 6"}
              initial={false}
              animate={{ opacity: joined[i] ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.5 }}
            />
            <motion.circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={hue}
              strokeWidth={stroke}
              strokeLinecap="round"
              transform={`rotate(-90 ${c} ${c})`}
              style={{ filter: `drop-shadow(0 0 ${done ? 10 : 5}px ${tint(HUES[i], done ? 70 : 45)})` }}
              initial={false}
              animate={{ pathLength: progress[i], opacity: progress[i] > 0 ? 1 : 0 }}
              transition={tween}
            />
            <Rider r={r} i={i} turn={progress[i]} on={joined[i]} reduced={reduced} />
          </g>
        );
      })}
    </svg>
  );
}
