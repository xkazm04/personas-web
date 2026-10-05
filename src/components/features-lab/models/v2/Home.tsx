"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { CLAUDE, FG, LOCAL, mix } from "../shared/motion";
import { DOME, GROUND, SCREEN, W, orbit } from "./geometry";

/* The ground of V2: your machine as a stylised laptop on a lit floor, and the
 * dome that closes over it when Ollama is chosen. Inside the closed dome the
 * work circles the machine instead of leaving it. */

const DOME_D = `M ${DOME.cx - DOME.rx} ${GROUND} A ${DOME.rx} ${DOME.ry} 0 0 1 ${DOME.cx + DOME.rx} ${GROUND}`;

function Orbiter({ k, flow, dome }: { k: number; flow: MotionValue<number>; dome: MotionValue<number> }) {
  const x = useTransform(flow, (f) => orbit(f, k)[0]);
  const y = useTransform(flow, (f) => orbit(f, k)[1]);
  const op = useTransform([flow, dome], ([f, d]: number[]) => d * (0.55 + 0.45 * Math.sin(2 * Math.PI * (f + k / 3))));
  return <motion.circle cx={x} cy={y} r={5} fill={LOCAL} style={{ opacity: op }} />;
}

export default function Home({ dome, flow, local }: { dome: MotionValue<number>; flow: MotionValue<number>; local: boolean }) {
  const c = useTranslation().t.featuresLab.models;
  const fill = useTransform(dome, (d) => d * 0.16);
  const s = SCREEN;
  const tone = local ? LOCAL : CLAUDE;

  return (
    <g>
      <defs>
        <radialGradient id="mv2-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={LOCAL} stopOpacity={0.3} />
          <stop offset="1" stopColor={LOCAL} stopOpacity={0} />
        </radialGradient>
      </defs>
      <line x1={80} x2={W - 80} y1={GROUND} y2={GROUND} stroke={FG} strokeOpacity={0.14} strokeWidth={1.5} />
      <ellipse cx={DOME.cx} cy={GROUND} rx={DOME.rx + 30} ry={34} fill="url(#mv2-pool)" />

      {/* The dome */}
      <motion.path d={`${DOME_D} Z`} fill={LOCAL} stroke="none" style={{ fillOpacity: fill }} />
      <motion.path d={DOME_D} fill="none" stroke={LOCAL} strokeWidth={3} strokeLinecap="round" style={{ pathLength: dome, opacity: dome }} />
      <motion.path
        d={`M ${DOME.cx - DOME.rx + 34} ${GROUND - 6} A ${DOME.rx - 34} ${DOME.ry - 30} 0 0 1 ${DOME.cx + DOME.rx - 34} ${GROUND - 6}`}
        fill="none"
        stroke={LOCAL}
        strokeOpacity={0.35}
        strokeWidth={1.2}
        strokeDasharray="3 7"
        style={{ opacity: dome }}
      />

      {/* The machine */}
      <rect x={s.x - 8} y={s.y - 8} width={s.w + 16} height={s.h + 12} rx={12} fill="var(--background)" stroke={FG} strokeOpacity={0.55} strokeWidth={2} />
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6} fill={mix(tone, 14)} style={{ transition: "fill 0.6s" }} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={s.x + 22} y={s.y + 26 + i * 30} width={s.w * [0.6, 0.45, 0.7][i]} height={10} rx={5} fill={tone} fillOpacity={0.75 - i * 0.15} style={{ transition: "fill 0.6s" }} />
      ))}
      <path d={`M ${s.x - 40} ${GROUND - 16} L ${s.x + s.w + 40} ${GROUND - 16} L ${s.x + s.w + 62} ${GROUND} L ${s.x - 62} ${GROUND} Z`} fill="var(--background)" stroke={FG} strokeOpacity={0.55} strokeWidth={2} strokeLinejoin="round" />
      <rect x={DOME.cx - 26} y={GROUND - 10} width={52} height={5} rx={2.5} fill={FG} fillOpacity={0.3} />
      <text x={DOME.cx} y={GROUND + 34} fontSize={16} fontWeight={700} fill={LOCAL} letterSpacing={2.4} textAnchor="middle" style={{ textTransform: "uppercase" }}>
        {c.yourMachine}
      </text>

      {/* Ollama, at home */}
      <motion.g style={{ opacity: dome }}>
        <text x={DOME.cx} y={GROUND - DOME.ry + 56} fontSize={28} fontWeight={800} fill={LOCAL} textAnchor="middle">
          Ollama
        </text>
        <text x={DOME.cx} y={GROUND - DOME.ry + 80} fontSize={16} fontWeight={500} fill={LOCAL} textAnchor="middle">
          {c.traits.ollama}
        </text>
      </motion.g>
      {[0, 1, 2].map((k) => (
        <Orbiter key={k} k={k} flow={flow} dome={dome} />
      ))}
    </g>
  );
}
