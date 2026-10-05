"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ClockFace, Digest, Envelope, HashMark, Padlock } from "../shared/glyphs";
import { beat } from "../shared/motion";
import { BEAT, CHASSIS, MOD, PARTS, PROMPT, runX, type PartKey } from "./assemblyGeometry";

/* One part of the agent: the dashed line from its phrase, the card that drops
 * onto the chassis, its glyph, a lock for the parts that hold keys, and the
 * glow when a run passes through it. */

const GLYPH: Record<PartKey, typeof ClockFace> = { when: ClockFace, read: Envelope, think: Digest, send: HashMark };

export default function Part({ i, p, loop }: { i: number; p: MotionValue<number>; loop: MotionValue<number> }) {
  const part = PARTS[i];
  const c = BRAND_VAR[part.tone];
  const Glyph = GLYPH[part.key];
  const left = part.x - MOD.w / 2;
  const dropped = useTransform(p, (v) => beat(v, part.drop, 0.05));
  const y = useTransform(dropped, (d) => -22 * (1 - d));
  const opacity = useTransform(dropped, (d) => 0.18 + 0.82 * d);
  const line = useTransform(p, (v) => beat(v, part.drop - 0.04, 0.05));
  const lock = useTransform(p, (v) => beat(v, BEAT.lock, 0.04));
  const awake = useTransform(p, (v) => beat(v, BEAT.on, 0.05));
  const glow = useTransform([loop, awake], ([v, a]: number[]) => a * Math.max(0, 1 - Math.abs(runX(v) - part.x) / 70));
  const keyed = part.key === "read" || part.key === "send";

  return (
    <g>
      <motion.path
        d={`M${part.x} ${PROMPT.y + PROMPT.h + 4} V${MOD.y - 6}`}
        stroke={c}
        strokeWidth={2.2}
        strokeDasharray="4 6"
        strokeLinecap="round"
        style={{ pathLength: line }}
      />
      <line x1={part.x} x2={part.x} y1={MOD.y + MOD.h} y2={CHASSIS.y} stroke={c} strokeWidth={3} strokeOpacity={0.5} />
      <motion.g style={{ y, opacity }}>
        <motion.rect x={left - 8} y={MOD.y - 8} width={MOD.w + 16} height={MOD.h + 16} rx={26} fill={tint(part.tone, 26)} style={{ opacity: glow }} />
        <rect x={left} y={MOD.y} width={MOD.w} height={MOD.h} rx={20} fill="var(--background)" />
        <rect x={left} y={MOD.y} width={MOD.w} height={MOD.h} rx={20} fill={tint(part.tone, 10)} stroke={c} strokeWidth={2.2} />
        <Glyph x={part.x} y={MOD.y + 42} s={46} c={c} />
        {keyed && (
          <motion.g style={{ opacity: lock }}>
            <circle cx={left + MOD.w - 4} cy={MOD.y + 4} r={18} fill="var(--background)" stroke={BRAND_VAR.amber} strokeWidth={2} />
            <Padlock x={left + MOD.w - 4} y={MOD.y + 6} s={20} c={BRAND_VAR.amber} w={2} />
          </motion.g>
        )}
      </motion.g>
    </g>
  );
}
