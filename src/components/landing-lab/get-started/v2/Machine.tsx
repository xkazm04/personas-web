"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat } from "../shared/motion";
import Part from "./Parts";
import { BEAT, CHASSIS, FRAME, H, LAP, PARTS, PROMPT, RUN_Y, TOGGLE, W, runX } from "./assemblyGeometry";

/* The drawn layer of V2: your PC's frame with Personas installed in it, the
 * prompt bar, the four parts on the agent's chassis, the switch, and the run
 * that travels the chassis once it is on. */

const FG = "var(--foreground)";
const EM = BRAND_VAR.emerald;

export default function Machine({ p, loop, label }: { p: MotionValue<number>; loop: MotionValue<number>; label: string }) {
  const arrive = useTransform(p, (v) => 0.25 + 0.75 * beat(v, 0, 0.06));
  const arrowY = useTransform(p, (v) => -30 * (1 - beat(v, 0.01, 0.06)));
  const arrowOp = useTransform(p, (v) => 1 - beat(v, 0.07, 0.03) * 0.75);
  const typing = useTransform(p, (v) => 0.4 + 0.6 * beat(v, 0.08, 0.04));
  const on = useTransform(p, (v) => beat(v, BEAT.on, 0.04));
  const knobX = useTransform(on, (o) => o * (TOGGLE.w - TOGGLE.h));
  const toggleFill = useTransform(on, (o) => o);
  const chassisGlow = useTransform(on, (o) => 0.35 + 0.65 * o);
  const dotX = useTransform(loop, runX);
  const dotOp = useTransform([loop, on], ([v, o]: number[]) => o * (v < LAP.travel + 0.05 ? 1 : 0));
  const cx = W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
      {/* Your PC, and Personas arriving in it */}
      <motion.g style={{ opacity: arrive }}>
        <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={26} fill={FG} fillOpacity={0.025} stroke={FG} strokeOpacity={0.2} strokeWidth={2} />
        <line x1={FRAME.x} x2={FRAME.x + FRAME.w} y1={FRAME.y + FRAME.bar} y2={FRAME.y + FRAME.bar} stroke={FG} strokeOpacity={0.14} strokeWidth={2} />
        <rect x={cx - 84} y={FRAME.y + 9} width={168} height={32} rx={16} fill={tint("cyan", 14)} stroke={BRAND_VAR.cyan} strokeWidth={1.8} />
      </motion.g>
      <motion.path
        d={`M${cx - 104} ${FRAME.y + 8} V${FRAME.y + 34} M${cx - 113} ${FRAME.y + 25} L${cx - 104} ${FRAME.y + 34} L${cx - 95} ${FRAME.y + 25}`}
        stroke={BRAND_VAR.cyan}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ y: arrowY, opacity: arrowOp }}
      />

      {/* The sentence goes in here */}
      <motion.rect x={PROMPT.x} y={PROMPT.y} width={PROMPT.w} height={PROMPT.h} rx={PROMPT.h / 2} fill="var(--background)" stroke={BRAND_VAR.purple} strokeOpacity={0.6} strokeWidth={2} style={{ opacity: typing }} />

      {/* The chassis the parts land on */}
      <motion.g style={{ opacity: chassisGlow }}>
        <rect x={CHASSIS.x} y={CHASSIS.y} width={CHASSIS.w} height={CHASSIS.h} rx={CHASSIS.h / 2} fill={tint("emerald", 8)} stroke={EM} strokeOpacity={0.55} strokeWidth={2} />
        <line x1={LAP.from} x2={LAP.to} y1={RUN_Y} y2={RUN_Y} stroke={EM} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="3 8" strokeLinecap="round" />
      </motion.g>
      {PARTS.map((part, i) => (
        <Part key={part.key} i={i} p={p} loop={loop} />
      ))}

      {/* The switch */}
      <rect x={TOGGLE.x} y={TOGGLE.y} width={TOGGLE.w} height={TOGGLE.h} rx={TOGGLE.h / 2} fill={FG} fillOpacity={0.1} stroke={FG} strokeOpacity={0.35} strokeWidth={1.6} />
      <motion.rect x={TOGGLE.x} y={TOGGLE.y} width={TOGGLE.w} height={TOGGLE.h} rx={TOGGLE.h / 2} fill={EM} style={{ opacity: toggleFill }} />
      <motion.circle cx={TOGGLE.x + TOGGLE.h / 2} cy={TOGGLE.y + TOGGLE.h / 2} r={TOGGLE.h / 2 - 4} fill="var(--background)" style={{ x: knobX }} />

      {/* A run travelling the chassis */}
      <motion.g style={{ opacity: dotOp }}>
        <motion.circle cx={dotX} cy={RUN_Y} r={16} fill={tint("emerald", 30)} />
        <motion.circle cx={dotX} cy={RUN_Y} r={8} fill={EM} />
      </motion.g>
    </svg>
  );
}
