"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AGENT, BG, CYAN, FG, RULES, WARN, mix, seg } from "../shared/motion";
import { ARRIVE, CONTOURS, END, RAIL_ANGLE, SNAG, START, TRAIN, W, H } from "./data";

/* The stylised map: contour hills, a straight railway from the request to
 * the destination, the snag that blocks it, and the two end markers. */

const RAIL = `M ${START[0]} ${START[1]} L ${END[0]} ${END[1]}`;

export function Terrain() {
  return (
    <g fill="none">
      <rect width={W} height={H} fill="url(#tl3-dots)" opacity={0.5} />
      {CONTOURS.map((c) =>
        Array.from({ length: c.rings }, (_, k) => (
          <ellipse key={`${c.cx}-${k}`} cx={c.cx} cy={c.cy} rx={c.rx * (1 - k * 0.22)} ry={c.ry * (1 - k * 0.22)} stroke={FG} strokeOpacity={0.07 + k * 0.025} strokeWidth={1.5} transform={`rotate(${(c.cx % 7) - 3} ${c.cx} ${c.cy})`} />
        )),
      )}
    </g>
  );
}

export function Railway({ p }: { p: MotionValue<number> }) {
  const hit = useTransform(p, (v) => 0.32 * seg(v, TRAIN[1] - 0.01, TRAIN[1] + 0.03));
  const flare = useTransform(p, (v) => (v < ARRIVE ? 0 : 1 - seg(v, ARRIVE, ARRIVE + 0.06)));
  const ring = useTransform(p, (v) => 14 + 40 * seg(v, ARRIVE, ARRIVE + 0.06));
  const [sx, sy] = SNAG;
  return (
    <g>
      {/* sleepers, then two rails cut from one stroke */}
      <path d={RAIL} stroke={mix(FG, 14)} strokeWidth={26} strokeDasharray="4 12" fill="none" />
      <path d={RAIL} stroke={mix(FG, 42)} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={RAIL} stroke={BG} strokeWidth={9} fill="none" strokeLinecap="round" />

      {/* the snag: a barrier across the track and fallen rocks */}
      <g transform={`translate(${sx} ${sy}) rotate(${RAIL_ANGLE + 90})`}>
        <motion.circle r={46} fill={RULES} style={{ opacity: hit }} filter="url(#tl3-blur)" />
        <rect x={-36} y={-9} width={72} height={18} rx={4} fill={BG} stroke={RULES} strokeWidth={2} />
        {[-28, -12, 4, 20].map((x) => (
          <path key={x} d={`M ${x} 9 L ${x + 10} -9 L ${x + 16} -9 L ${x + 6} 9 Z`} fill={RULES} opacity={0.85} />
        ))}
        <rect x={-34} y={9} width={4} height={16} fill={mix(FG, 50)} />
        <rect x={30} y={9} width={4} height={16} fill={mix(FG, 50)} />
      </g>
      <g fill={mix(FG, 22)} stroke={mix(FG, 40)} strokeWidth={1.5}>
        <path d={`M ${sx + 22} ${sy - 30} l 18 -6 l 12 10 l -4 14 l -20 4 z`} />
        <path d={`M ${sx - 46} ${sy + 22} l 14 -10 l 16 4 l 2 14 l -18 6 z`} />
      </g>
      <circle cx={sx + 34} cy={sy + 22} r={7} fill={WARN} opacity={0.75} />

      {/* start and destination; the request card hangs off the start */}
      <path d={`M 170 150 L ${START[0]} ${START[1] - 24}`} stroke={mix(CYAN, 45)} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" fill="none" />
      <circle cx={START[0]} cy={START[1]} r={22} fill={mix(CYAN, 14)} stroke={CYAN} strokeWidth={2} />
      <circle cx={START[0]} cy={START[1]} r={8} fill={CYAN} />
      <motion.circle cx={END[0]} cy={END[1]} r={ring} fill="none" stroke={AGENT} strokeWidth={2.5} style={{ opacity: flare }} />
      <circle cx={END[0]} cy={END[1]} r={22} fill={mix(AGENT, 16)} stroke={AGENT} strokeWidth={2} />
      <line x1={END[0]} y1={END[1] + 6} x2={END[0]} y2={END[1] - 50} stroke={FG} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
      <rect x={END[0] + 1.5} y={END[1] - 50} width={34} height={22} fill="url(#tl3-check)" stroke={mix(FG, 50)} />
    </g>
  );
}
