"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { CLAUDE, FG, mix } from "../shared/motion";
import { DUST, NAMES, STARS, W, type Cloud, type Engine } from "./geometry";

/* Claude's sky in V2: three engines as lit bodies sized by weight, the chosen one
 * ringed. The whole sky dims while the dome is closed. */

const CLOUDS: Cloud[] = ["haiku", "sonnet", "opus"];

export default function Sky({ sel, dome, still }: { sel: Engine; dome: MotionValue<number>; still: boolean }) {
  const c = useTranslation().t.featuresLab.models;
  const dim = useTransform(dome, (d) => 1 - 0.6 * d);
  return (
    <motion.g style={{ opacity: dim }}>
      <defs>
        <radialGradient id="mv2-haze" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={CLAUDE} stopOpacity={0.2} />
          <stop offset="1" stopColor={CLAUDE} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="mv2-star" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={CLAUDE} stopOpacity={0.55} />
          <stop offset="1" stopColor={CLAUDE} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={W / 2} cy={170} rx={W / 2} ry={170} fill="url(#mv2-haze)" />
      {DUST.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} fill={FG} fillOpacity={0.3} />
      ))}
      <text x={60} y={64} fontSize={38} fontWeight={800} fill={CLAUDE} letterSpacing={-0.5}>
        Claude
      </text>
      <text x={60} y={92} fontSize={17} fontWeight={500} fill={FG} fillOpacity={0.72}>
        {c.viaClaudeCode}
      </text>

      {CLOUDS.map((e) => {
        const { c: [x, y], r } = STARS[e];
        const on = sel === e;
        const left = e === "haiku";
        const lx = left ? x - r - 22 : x + r + 22;
        const anchor = left ? "end" : "start";
        return (
          <g key={e}>
            <circle cx={x} cy={y} r={r * 3.2} fill="url(#mv2-star)" />
            <motion.circle
              cx={x}
              cy={y}
              r={r + 12}
              fill="none"
              stroke={CLAUDE}
              strokeWidth={2}
              initial={false}
              animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }}
              transition={still ? { duration: 0 } : { duration: 0.5 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <circle cx={x} cy={y} r={r} fill={mix(CLAUDE, 30)} stroke={CLAUDE} strokeWidth={2.5} />
            <circle cx={x} cy={y} r={r * 0.45} fill={CLAUDE} />
            <text x={lx} y={y + 2} fontSize={28} fontWeight={800} fill={FG} textAnchor={anchor}>
              {NAMES[e]}
            </text>
            <text x={lx} y={y + 26} fontSize={16} fontWeight={500} fill={FG} fillOpacity={0.72} textAnchor={anchor}>
              {c.traits[e]}
            </text>
          </g>
        );
      })}
    </motion.g>
  );
}
