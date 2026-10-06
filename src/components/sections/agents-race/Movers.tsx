"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AGENT, BG, FG, RULES, WARN, mix, seg } from "./shared/motion";
import { LEGS, RAIL_ANGLE, TRAIN, WAYPOINTS, legPath, legWindow, markerAt, trainAt } from "./data";

/* What moves on the map: the train that brakes into the snag and sits there
 * with its hazards on and a stall clock running, and the agent's route,
 * drawn leg by leg behind a glowing marker, lighting each waypoint. */

export const STALL_CLOCK = { x: 452, y: 404 };

export function Train({ p }: { p: MotionValue<number> }) {
  const x = useTransform(p, (v) => trainAt(v).x);
  const y = useTransform(p, (v) => trainAt(v).y);
  const hazard = useTransform(p, (v) => (v < TRAIN[1] ? 0 : 0.35 + 0.65 * Math.abs(Math.cos((v - TRAIN[1]) * 40))));
  const angle = (v: number) => (seg(v, TRAIN[1], 1) * 4 - 0.25) * Math.PI;
  const handX = useTransform(p, (v) => STALL_CLOCK.x + Math.cos(angle(v)) * 11);
  const handY = useTransform(p, (v) => STALL_CLOCK.y + Math.sin(angle(v)) * 11);
  const stalled = useTransform(p, (v) => seg(v, TRAIN[1] + 0.02, TRAIN[1] + 0.06));
  return (
    <g>
      <motion.g style={{ x, y }}>
        <g transform={`rotate(${RAIL_ANGLE}) scale(1.2)`}>
          <rect x={-78} y={-15} width={80} height={30} rx={8} fill={mix(FG, 22)} stroke={mix(FG, 70)} strokeWidth={2} />
          <rect x={-78} y={-15} width={80} height={30} rx={8} fill={BG} opacity={0.55} />
          <rect x={-74} y={-4} width={72} height={6} fill={RULES} opacity={0.75} />
          <rect x={-66} y={-11} width={16} height={8} rx={2} fill={mix(FG, 45)} />
          <rect x={-44} y={-11} width={16} height={8} rx={2} fill={mix(FG, 45)} />
          <motion.circle cx={0} cy={-8} r={4} fill={WARN} style={{ opacity: hazard }} />
          <motion.circle cx={0} cy={8} r={4} fill={WARN} style={{ opacity: hazard }} />
        </g>
      </motion.g>
      <motion.g style={{ opacity: stalled }}>
        <circle cx={STALL_CLOCK.x} cy={STALL_CLOCK.y} r={17} fill={BG} stroke={RULES} strokeWidth={2.5} />
        <motion.line x1={STALL_CLOCK.x} y1={STALL_CLOCK.y} x2={handX} y2={handY} stroke={RULES} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={STALL_CLOCK.x} cy={STALL_CLOCK.y} r={2.5} fill={RULES} />
      </motion.g>
    </g>
  );
}

function Leg({ i, p }: { i: number; p: MotionValue<number> }) {
  const [a, b] = legWindow(i);
  const pathLength = useTransform(p, (v) => seg(v, a, b));
  const lit = useTransform(p, (v) => 0.25 + 0.75 * seg(v, b - 0.005, b + 0.02));
  const d = legPath(LEGS[i]);
  const wp = WAYPOINTS[i];
  return (
    <g>
      <path d={d} fill="none" stroke={mix(AGENT, 22)} strokeWidth={2} strokeDasharray="2 9" strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke={AGENT} strokeWidth={10} strokeLinecap="round" opacity={0.18} style={{ pathLength }} />
      <motion.path d={d} fill="none" stroke={AGENT} strokeWidth={4} strokeLinecap="round" style={{ pathLength }} />
      {wp && (
        <motion.g style={{ opacity: lit }}>
          <circle cx={wp[0]} cy={wp[1]} r={13} fill={BG} stroke={AGENT} strokeWidth={2.5} />
          <circle cx={wp[0]} cy={wp[1]} r={5.5} fill={AGENT} />
        </motion.g>
      )}
    </g>
  );
}

export function Route({ p }: { p: MotionValue<number> }) {
  const x = useTransform(p, (v) => markerAt(v).x);
  const y = useTransform(p, (v) => markerAt(v).y);
  return (
    <g>
      {LEGS.map((_, i) => (
        <Leg key={i} i={i} p={p} />
      ))}
      <motion.g style={{ x, y }}>
        <circle r={24} fill={AGENT} opacity={0.22} filter="url(#tl3-blur)" />
        <circle r={10} fill={AGENT} stroke={BG} strokeWidth={3} />
        <circle cx={-3} cy={-3} r={3} fill={BG} opacity={0.7} />
      </motion.g>
    </g>
  );
}
