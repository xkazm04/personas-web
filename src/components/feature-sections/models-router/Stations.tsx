"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { CLAUDE, FG, LOCAL, mix } from "./shared/motion";
import { AGENTS, STATIONS, docked, swell, type Engine } from "./geometry";

/* The four engines of V1. Size reads as weight (Opus largest); each station's
 * halo swells as its agent docks, and Ollama gains a closed shield ring. */

const NAMES: Record<Engine, string> = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku", ollama: "Ollama" };

function Station({ e, p }: { e: Engine; p: MotionValue<number> }) {
  const traits = useTranslation().t.featuresSections.models.traits;
  const { c, r } = STATIONS[e];
  const agent = AGENTS.find((a) => a.engine === e)!;
  const local = e === "ollama";
  const col = local ? LOCAL : CLAUDE;
  const halo = useTransform(p, (v) => 0.35 + 0.65 * docked(v, agent) + 0.6 * swell(v, agent));
  const grow = useTransform(p, (v) => 1 + 0.35 * swell(v, agent));
  const shield = useTransform(p, (v) => docked(v, agent));
  const [x, y] = c;
  const lx = x + r + 22;

  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={r * 2.3}
        fill={`url(#${local ? "mv1-halo-l" : "mv1-halo-c"})`}
        style={{ opacity: halo, scale: grow, transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx={x} cy={y} r={r} fill="var(--background)" />
      <circle cx={x} cy={y} r={r} fill={mix(col, 16)} stroke={col} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke={col} strokeOpacity={0.35} strokeWidth={1.2} />
      {local && (
        <motion.circle
          cx={x}
          cy={y}
          r={r + 14}
          fill="none"
          stroke={LOCAL}
          strokeWidth={2}
          strokeDasharray="4 6"
          style={{ pathLength: shield, opacity: shield }}
        />
      )}
      <text x={lx} y={y + 2} fontSize={local ? 26 : 30} fontWeight={800} fill={local ? LOCAL : FG}>
        {NAMES[e]}
      </text>
      <text x={lx} y={y + 26} fontSize={16} fontWeight={500} fill={local ? LOCAL : FG} fillOpacity={local ? 0.9 : 0.72}>
        {traits[e]}
      </text>
    </g>
  );
}

export default function Stations({ p }: { p: MotionValue<number> }) {
  return (
    <g>
      {(Object.keys(STATIONS) as Engine[]).map((e) => (
        <Station key={e} e={e} p={p} />
      ))}
    </g>
  );
}
