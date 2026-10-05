"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ClockFace, Envelope } from "../shared/glyphs";
import { beat } from "../shared/motion";
import { AGENT_AT, GATES, LOOP, LOOP_START, onLoop } from "./trailGeometry";

/* Where the trail ends: the agent's own loop. Once you arrive, the agent token
 * sets off round it and keeps going; each time it passes a gate (the 08:00
 * schedule, a new email) the gate flares: one run. */

const EM = BRAND_VAR.emerald;

/** Angular closeness of the token to a gate, 1 at the gate, 0 beyond ~26 degrees. */
const near = (deg: number, gate: number) => {
  const d = Math.abs(((deg - gate + 540) % 360) - 180);
  return Math.max(0, 1 - d / 26);
};

function Gate({ deg, loopDeg, children }: { deg: number; loopDeg: MotionValue<number>; children: React.ReactNode }) {
  const [x, y] = onLoop(deg);
  const glow = useTransform(loopDeg, (d) => near(d, deg));
  const r = useTransform(glow, (g) => 24 + g * 16);
  const op = useTransform(glow, (g) => g * 0.55);
  return (
    <g>
      <motion.circle cx={x} cy={y} r={r} fill={tint("emerald", 30)} style={{ opacity: op }} />
      <circle cx={x} cy={y} r={22} fill="var(--background)" stroke={EM} strokeWidth={2} />
      {children}
    </g>
  );
}

export default function AgentLoop({ p, loop }: { p: MotionValue<number>; loop: MotionValue<number> }) {
  const loopDeg = useTransform(loop, (v) => (LOOP_START + v * 360) % 360);
  const tokenX = useTransform(loopDeg, (d) => onLoop(d)[0]);
  const tokenY = useTransform(loopDeg, (d) => onLoop(d)[1]);
  const awake = useTransform(p, (v) => beat(v, AGENT_AT, 0.06));
  const ring = useTransform(p, (v) => 0.3 + 0.7 * beat(v, AGENT_AT - 0.06, 0.08));
  const [mx, my] = onLoop(GATES.morning);
  const [ex, ey] = onLoop(GATES.email);

  return (
    <g>
      <motion.g style={{ opacity: ring }}>
        <circle cx={LOOP.cx} cy={LOOP.cy} r={LOOP.r + 16} fill={tint("emerald", 5)} />
        <circle cx={LOOP.cx} cy={LOOP.cy} r={LOOP.r} fill="none" stroke={EM} strokeWidth={4} strokeOpacity={0.55} />
        <circle cx={LOOP.cx} cy={LOOP.cy} r={LOOP.r} fill="none" stroke={EM} strokeWidth={1.5} strokeDasharray="2 10" strokeOpacity={0.9} />
        <Gate deg={GATES.morning} loopDeg={loopDeg}>
          <ClockFace x={mx} y={my} s={26} c={BRAND_VAR.amber} w={2} />
        </Gate>
        <Gate deg={GATES.email} loopDeg={loopDeg}>
          <Envelope x={ex} y={ey} s={26} c={BRAND_VAR.cyan} w={2} />
        </Gate>
      </motion.g>
      <motion.g style={{ opacity: awake }}>
        <motion.circle cx={tokenX} cy={tokenY} r={20} fill={tint("emerald", 22)} />
        <motion.circle cx={tokenX} cy={tokenY} r={11} fill={EM} stroke="var(--background)" strokeWidth={3} />
      </motion.g>
    </g>
  );
}
