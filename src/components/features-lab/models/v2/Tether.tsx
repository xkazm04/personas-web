"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CLAUDE } from "../shared/motion";
import { ORIGIN, control, end, quad } from "./geometry";

/* The tether of V2: a lit arc from your machine to the chosen Claude engine.
 * Work rides it out and answers ride it back; it retracts when Ollama is chosen. */

type MV = MotionValue<number>;
const PULSES = [0, 0.25, 0.5, 0.75];

function geometry(tx: number, ty: number, r: number) {
  const e = end(tx, ty, r);
  return { e, c: control(ORIGIN[0], ORIGIN[1], e[0], e[1]) };
}

function Pulse({ k, tx, ty, reach, flow }: { k: number; tx: MV; ty: MV; reach: MV; flow: MV }) {
  const out = PULSES.indexOf(k) % 2 === 0;
  const pt = useTransform([tx, ty, reach, flow], ([x, y, r, f]: number[]) => {
    const { e, c } = geometry(x, y, r);
    const u = (f + k) % 1;
    return quad(ORIGIN, c, e, out ? u : 1 - u);
  });
  const cx = useTransform(pt, (p) => p[0]);
  const cy = useTransform(pt, (p) => p[1]);
  const op = useTransform([reach, flow], ([r, f]: number[]) => (r > 0.98 ? Math.sin(Math.PI * ((f + k) % 1)) : 0));
  return <motion.circle cx={cx} cy={cy} r={out ? 4.5 : 3.2} fill={CLAUDE} style={{ opacity: op }} />;
}

export default function Tether({ tx, ty, reach, flow }: { tx: MV; ty: MV; reach: MV; flow: MV }) {
  const d = useTransform([tx, ty, reach], ([x, y, r]: number[]) => {
    const { e, c } = geometry(x, y, r);
    return `M ${ORIGIN[0]} ${ORIGIN[1]} Q ${c[0]} ${c[1]} ${e[0]} ${e[1]}`;
  });
  const op = useTransform(reach, (r) => Math.min(1, r * 4));
  return (
    <motion.g style={{ opacity: op }}>
      <motion.path d={d} fill="none" stroke={CLAUDE} strokeOpacity={0.22} strokeWidth={12} strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke={CLAUDE} strokeWidth={2.6} strokeLinecap="round" />
      {PULSES.map((k) => (
        <Pulse key={k} k={k} tx={tx} ty={ty} reach={reach} flow={flow} />
      ))}
    </motion.g>
  );
}
