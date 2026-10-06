"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { EASE_CURVE } from "@/lib/animations";
import { C, INNER_R, OUTER_R, RINGS, VB, blipsAt, onRing, stateAt } from "./data";

const ORIGIN = { transformBox: "view-box", transformOrigin: `${C}px ${C}px` } as const;
// Stable references: framer restarts a loop whenever its target object changes.
const SPIN_CW = { rotate: [0, 360] };
const SPIN_CCW = { rotate: [0, -360] };
const BLIP_OPACITY = [0.95, 0.55, 0];

/**
 * The iris - the abstract half of "The Watch". Five rings of fine ticks are
 * five streams of your day, each turning at its own pace, with small blips of
 * light arriving and fading on them all the time: she sees all of it. When
 * one thing matters it flares amber, the iris narrows (the other rings dim
 * and draw in a touch), and a line of light joins it to her.
 *
 * Rings carry a depth parallax from the pointer (`--px`/`--py` on the host,
 * inner rings move most), so the eye seems to turn toward you.
 */
export default function Iris({ uid, phase, tick, live, reduced }: {
  uid: string; phase: number; tick: number; live: boolean; reduced: boolean;
}) {
  const st = stateAt(phase);
  const blips = blipsAt(tick);
  const amber = BRAND_VAR.amber;

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} overflow="visible" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity="0.30" />
          <stop offset="35%" stopColor={BRAND_VAR.cyan} stopOpacity="0.08" />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r={OUTER_R} fill={`url(#${uid}-halo)`} />
      <circle cx={C} cy={C} r={OUTER_R} fill="none" stroke="rgba(var(--surface-overlay), 0.08)" strokeWidth="1" />
      <circle cx={C} cy={C} r={OUTER_R - 10} fill="none" stroke={tint("cyan", 10)} strokeWidth="8" strokeDasharray="1 6" />

      {RINGS.map((ring, k) => {
        const chosen = st.flaring && st.moment.ring === k;
        const dim = st.speaking && !chosen;
        const depth = 22 - k * 4;
        const focus = onRing(ring.r, st.moment.angle);
        return (
          <g key={ring.r} style={{ transform: `translate(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px))`, transition: "transform 0.8s cubic-bezier(0.2,0.8,0.2,1)" }}>
            <motion.g
              initial={false}
              animate={{ opacity: dim ? 0.45 : 1, scale: st.speaking ? 0.982 : 1 }}
              transition={{ duration: 0.9, ease: EASE_CURVE }}
              style={ORIGIN}
            >
              <motion.g animate={live ? ring.dir === 1 ? SPIN_CW : SPIN_CCW : undefined} transition={{ duration: ring.spin, repeat: Infinity, ease: "linear" }} style={ORIGIN}>
                <circle cx={C} cy={C} r={ring.r} fill="none" stroke="rgba(var(--surface-overlay), 0.09)" strokeWidth="1" />
                <circle
                  cx={C} cy={C} r={ring.r} fill="none"
                  stroke={tint("cyan", chosen ? 75 : 48 - k * 5)} strokeWidth={10 + k} strokeDasharray={ring.dash}
                  style={{ transition: "stroke 0.8s" }}
                />
                {blips.filter((b) => b.ring === k).map((b) => {
                  const p = onRing(ring.r, b.angle);
                  return (
                    <motion.circle
                      key={b.key} cx={p.x} cy={p.y} fill={BRAND_VAR.cyan}
                      initial={reduced ? false : { opacity: 0, r: b.size * 0.3 }}
                      animate={{ opacity: BLIP_OPACITY[b.age], r: b.size }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  );
                })}
                {/* The one that matters: flare, then a line of light to her */}
                <motion.line
                  x1={C} y1={C} x2={focus.x} y2={focus.y}
                  stroke={amber} strokeWidth="2" strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: chosen && st.speaking ? 1 : 0, opacity: chosen && st.speaking ? 0.85 : 0 }}
                  transition={{ duration: 0.8, ease: EASE_CURVE }}
                />
                {/* r is animated rather than scale: a scale origin inside two
                    nested rotating groups resolved to the iris centre. */}
                <motion.circle
                  cx={focus.x} cy={focus.y} fill={amber}
                  initial={false}
                  animate={{ opacity: chosen ? 1 : 0, r: chosen ? 9 : 2 }}
                  transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
                />
                <motion.circle
                  cx={focus.x} cy={focus.y} fill="none" stroke={amber} strokeWidth="2"
                  initial={false}
                  animate={chosen && live ? { opacity: [0.8, 0], r: [9, 30] } : { opacity: chosen ? 0.5 : 0, r: chosen ? 18 : 9 }}
                  transition={chosen && live ? { duration: 1.4, repeat: Infinity, ease: "easeOut" } : { duration: 0.4 }}
                />
              </motion.g>
            </motion.g>
          </g>
        );
      })}

      {/* Her own inner ring, turning against the streams */}
      <motion.circle
        cx={C} cy={C} r={INNER_R} fill="none" stroke={tint("cyan", 55)} strokeWidth="4" strokeDasharray="2 5"
        animate={live ? SPIN_CCW : undefined} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={ORIGIN}
      />
    </svg>
  );
}
