"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASE_COLOR, CASE_IDS } from "../shared/cases";
import { APEX, BASE_L, BASE_R, BEAM_Y, ENTRY_X, EXIT_X, PATTERN, TRAVEL, VIEW, beamPath, rowOf } from "./geometry";
import Shard from "./Shard";

const TRI = `${APEX.x},${APEX.y} ${BASE_R.x},${BASE_R.y} ${BASE_L.x},${BASE_L.y}`;
const FG = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`;

/** The prism scene: input beam, the glass prism, five fix beams and the failures riding them. */
export default function Prism({ tick, running }: { tick: number; running: boolean }) {
  const inFlight = Array.from({ length: TRAVEL }, (_, k) => tick - k).filter((m) => m >= 0);
  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="hp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="hp-wide" filterUnits="userSpaceOnUse" x="-40" y="0" width="1300" height="500">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="hp-in" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2={ENTRY_X} y2="0">
          <stop offset="0" stopColor="var(--brand-rose)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--brand-rose)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--foreground)" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="hp-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--foreground)" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="var(--brand-cyan)" stopOpacity="0.07" />
          <stop offset="1" stopColor="var(--brand-purple)" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id="hp-tri">
          <polygon points={TRI} />
        </clipPath>
      </defs>

      {/* incoming failures */}
      <path d={`M 20 ${BEAM_Y} L ${ENTRY_X} ${BEAM_Y}`} stroke={tint("rose", 22)} strokeWidth={16} filter="url(#hp-wide)" />
      <path d={`M 20 ${BEAM_Y} L ${ENTRY_X} ${BEAM_Y}`} stroke="url(#hp-in)" strokeWidth={3} strokeLinecap="round" />

      {/* the fix beams */}
      {CASE_IDS.map((id, i) => {
        const c = BRAND_VAR[CASE_COLOR[id]];
        return (
          <g key={id}>
            <path d={beamPath(i)} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={14} filter="url(#hp-wide)" />
            <path d={beamPath(i)} fill="none" stroke={c} strokeWidth={2.6} strokeLinecap="round" />
            <motion.path
              d={beamPath(i)}
              fill="none"
              stroke="var(--foreground)"
              strokeOpacity={0.55}
              strokeWidth={1.4}
              strokeDasharray="2 26"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 0 }}
              animate={running ? { strokeDashoffset: -56 } : { strokeDashoffset: 0 }}
              transition={running ? { duration: 1.2, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            />
            {/* dispersion inside the glass */}
            <line x1={ENTRY_X} y1={BEAM_Y} x2={EXIT_X} y2={BEAM_Y + (i - 2) * 9} stroke={c} strokeWidth={1.6} strokeOpacity={0.9} />
          </g>
        );
      })}

      {/* the prism */}
      <polygon points={TRI} fill="url(#hp-glass)" stroke={FG(40)} strokeWidth={1.6} strokeLinejoin="round" />
      <g clipPath="url(#hp-tri)">
        <motion.rect
          x={BASE_L.x}
          width={BASE_R.x - BASE_L.x}
          height={26}
          fill={tint("cyan", 22)}
          filter="url(#hp-glow)"
          initial={{ y: BEAM_Y - 13 }}
          animate={running ? { y: [APEX.y + 40, BASE_L.y - 20, APEX.y + 40] } : { y: BEAM_Y - 13 }}
          transition={running ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
      </g>
      <line x1={APEX.x} y1={APEX.y} x2={BASE_L.x} y2={BASE_L.y} stroke={FG(70)} strokeWidth={2} strokeLinecap="round" />
      <line x1={APEX.x - 6} y1={APEX.y + 22} x2={APEX.x - 34} y2={APEX.y + 92} stroke={FG(85)} strokeWidth={3} strokeLinecap="round" />

      {inFlight.map((m) => (
        <Shard key={m} row={rowOf(PATTERN[m % PATTERN.length])} age={tick - m} running={running} />
      ))}
    </svg>
  );
}
