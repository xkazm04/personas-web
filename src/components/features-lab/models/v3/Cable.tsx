"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { CLAUDE, FG, LOCAL } from "../shared/motion";
import { JACK_X, cable, type Engine } from "./geometry";

/* One patch cable of V3: outline, coloured core and a thin highlight, hanging
 * from the agent's jack to its engine's port. On a re-patch the plug lifts out,
 * travels and drops into the new port; the cable sways gently while in view. */

const WIDTH: Record<Engine, number> = { opus: 8, sonnet: 7, haiku: 5.5, ollama: 7 };
const GLINT = 640;

export default function Cable({ y1, to, engine, i, flow, still }: { y1: number; to: [number, number]; engine: Engine; i: number; flow: MotionValue<number>; still: boolean }) {
  const ex = useMotionValue(to[0]);
  const ey = useMotionValue(to[1]);
  const [tx, ty] = to;

  useEffect(() => {
    if (still) {
      ex.set(tx);
      ey.set(ty);
      return;
    }
    const from = ey.get();
    if (from === ty && ex.get() === tx) return;
    const a = animate(ex, tx, { duration: 0.9, ease: "easeInOut" });
    const b = animate(ey, [from, Math.min(from, ty) - 70, ty], { duration: 0.9, ease: "easeInOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [tx, ty, still, ex, ey]);

  const d = useTransform([ex, ey, flow], ([x, y, f]: number[]) => cable(JACK_X, y1, x, y, 5 * Math.sin(2 * Math.PI * (f + i / 5))));
  const col = engine === "ollama" ? LOCAL : CLAUDE;
  const w = WIDTH[engine];
  const hx = useTransform(ex, (x) => x - 22);
  const hy = useTransform(ey, (y) => y - 7);
  /* A glint of signal running jack -> port (dash period = GLINT). */
  const glint = useTransform(flow, (f) => -(((f * 2 + i * 0.37) % 1) * GLINT));

  return (
    <g>
      <motion.path d={d} fill="none" stroke="var(--background)" strokeWidth={w + 4} strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" style={{ transition: "stroke 0.5s" }} />
      <motion.path d={d} fill="none" stroke={FG} strokeOpacity={0.35} strokeWidth={1.2} strokeLinecap="round" transform="translate(0 -1.5)" />
      <motion.path d={d} fill="none" stroke={FG} strokeOpacity={0.9} strokeWidth={w * 0.5} strokeLinecap="round" strokeDasharray={`16 ${GLINT - 16}`} style={{ strokeDashoffset: glint }} />
      {/* The plug head */}
      <motion.rect x={hx} y={hy} width={26} height={14} rx={4} fill={col} stroke="var(--background)" strokeWidth={2} style={{ transition: "fill 0.5s" }} />
      <circle cx={JACK_X} cy={y1} r={8} fill={col} stroke="var(--background)" strokeWidth={2} style={{ transition: "fill 0.5s" }} />
    </g>
  );
}
