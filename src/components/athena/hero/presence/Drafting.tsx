"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  BEZEL_R, BEZEL_TICKS, CX, CY, GLOW_R, GUIDE_R, ORB_R, RIM_R, STAGE_H, STAGE_W, orbOrigin,
} from "./geometry";

/** The scan: a leading edge and a fading trail of thin annular sectors behind
 *  it (pointing at 3 o'clock; the group rotates clockwise). */
const SWEEP = (() => {
  const r0 = ORB_R + 46;
  const r1 = BEZEL_R - 4;
  const p = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(CX + Math.cos(a) * r).toFixed(1)} ${(CY + Math.sin(a) * r).toFixed(1)}`;
  };
  const sector = (a0: number, a1: number) =>
    `M ${p(r0, a0)} L ${p(r1, a0)} A ${r1} ${r1} 0 0 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
  return {
    edge: `M ${p(r0, 0)} L ${p(r1, 0)}`,
    trail: Array.from({ length: 8 }, (_, i) => ({ d: sector(-(i + 1) * 4, -i * 4), o: 0.2 * (1 - i / 8) ** 2 })),
  };
})();

/**
 * The back of the schematic - the drafting table the being is drawn on, and
 * the light that falls on her. Back to front: construction centrelines across
 * the whole stage, her breathing glow, an instrument bezel turning very
 * slowly, a scan sweeping the space around her (she is watching), the dashed
 * guide ring, and a rim light from the page's one key light, top-left.
 *
 * Loops run only while `live` (in view, tab foregrounded, motion allowed);
 * otherwise every element holds its rest value - same markup either way.
 */
export default function Drafting({ uid, live }: { uid: string; live: boolean }) {
  const cyan = BRAND_VAR.cyan;
  const loop = (duration: number) => ({ duration, repeat: Infinity, ease: "linear" as const });

  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={cyan} stopOpacity="0.42" />
          <stop offset="62%" stopColor={cyan} stopOpacity="0.08" />
          <stop offset="100%" stopColor={cyan} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={cyan} stopOpacity="1" />
          <stop offset="55%" stopColor={cyan} stopOpacity="0.25" />
          <stop offset="100%" stopColor={cyan} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Construction centrelines and a registration cross at her heart */}
      <g stroke="rgba(var(--surface-overlay), 0.09)" strokeWidth="1" strokeDasharray="2 10">
        <path d={`M 0 ${CY} H ${STAGE_W}`} />
        <path d={`M ${CX} 0 V ${STAGE_H}`} />
      </g>

      <motion.circle
        cx={CX} cy={CY} r={GLOW_R}
        fill={`url(#${uid}-glow)`}
        opacity={live ? undefined : 0.75}
        animate={live ? { opacity: [0.55, 0.95, 0.55], scale: [1, 1.04, 1] } : undefined}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={orbOrigin}
      />

      <motion.g animate={live ? { rotate: [0, 360] } : undefined} transition={loop(180)} style={orbOrigin}>
        <circle cx={CX} cy={CY} r={BEZEL_R} fill="none" stroke="rgba(var(--surface-overlay), 0.07)" strokeWidth="1" />
        {BEZEL_TICKS.map((t, i) => (
          <path
            key={i}
            d={t.d}
            stroke={t.long ? tint("cyan", 55) : "rgba(var(--surface-overlay), 0.16)"}
            strokeWidth={t.long ? 1.5 : 1}
          />
        ))}
      </motion.g>

      <motion.g animate={live ? { rotate: [0, 360] } : undefined} transition={loop(11)} style={orbOrigin}>
        {SWEEP.trail.map((w, i) => (
          <path key={i} d={w.d} fill={cyan} fillOpacity={w.o} />
        ))}
        <path d={SWEEP.edge} stroke={tint("cyan", 70)} strokeWidth="1.5" />
      </motion.g>

      <motion.circle
        cx={CX} cy={CY} r={GUIDE_R}
        fill="none" stroke="rgba(var(--surface-overlay), 0.12)" strokeWidth="1" strokeDasharray="3 9"
        animate={live ? { rotate: [0, -360] } : undefined}
        transition={loop(120)}
        style={orbOrigin}
      />

      <circle cx={CX} cy={CY} r={RIM_R} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="2.5" />
      <circle cx={CX} cy={CY} r={RIM_R + 7} fill="none" stroke={tint("cyan", 16)} strokeWidth="1" />
    </g>
  );
}
