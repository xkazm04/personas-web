"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CLAUDE, FG, LOCAL, mix } from "./shared/motion";
import { AGENTS, ROUTES, ROW, at, docked, orbU, type Agent } from "./geometry";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/* The agents of V1: each lives in a row on your machine. Its orb (its thinking)
 * leaves the row's socket, lights its route as it goes and docks at its engine;
 * the row then names the engine. Once docked, small pulses keep the line busy. */

const NAMES = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku", ollama: "Ollama" } as const;
const PULSES = [0, 1 / 3, 2 / 3];

function Pulse({ i, a, k, p, flow }: { i: number; a: Agent; k: number; p: MotionValue<number>; flow: MotionValue<number> }) {
  const u = useTransform(flow, (f) => (f + k) % 1);
  const x = useTransform(u, (v) => at(i, v)[0]);
  const y = useTransform(u, (v) => at(i, v)[1]);
  const op = useTransform([p, u], ([pv, uv]: number[]) => docked(pv, a) * Math.sin(Math.PI * uv) * 0.95);
  return <motion.circle cx={x} cy={y} r={3.6} fill={a.lock ? LOCAL : CLAUDE} style={{ opacity: op }} />;
}

function Lock({ x, y, s }: { x: MotionValue<number>; y: MotionValue<number>; s: number }) {
  return (
    <motion.g style={{ x, y }} stroke="var(--background)" strokeWidth={1.8} strokeLinecap="round" fill="none">
      <rect x={-s * 0.42} y={-s * 0.1} width={s * 0.84} height={s * 0.6} rx={1.5} fill="var(--background)" stroke="none" />
      <path d={`M ${-s * 0.26} ${-s * 0.1} V ${-s * 0.3} a ${s * 0.26} ${s * 0.26} 0 0 1 ${s * 0.52} 0 V ${-s * 0.1}`} />
    </motion.g>
  );
}

function AgentRow({ a, i, p, flow }: { a: Agent; i: number; p: MotionValue<number>; flow: MotionValue<number> }) {
  const c = featuresSectionsCopy.models;
  const col = a.lock ? LOCAL : CLAUDE;
  const u = useTransform(p, (v) => orbU(v, a));
  const x = useTransform(u, (v) => at(i, v)[0]);
  const y = useTransform(u, (v) => at(i, v)[1]);
  const tag = useTransform(p, (v) => docked(v, a));
  const top = a.y - ROW.h / 2;

  return (
    <g>
      <rect x={ROW.x} y={top} width={ROW.w} height={ROW.h} rx={16} fill="var(--background)" fillOpacity={0.55} stroke={a.lock ? LOCAL : FG} strokeOpacity={a.lock ? 0.5 : 0.16} />
      <text x={ROW.x + 20} y={a.y - 3} fontSize={20} fontWeight={700} fill={FG}>
        {c.agents[a.key]}
      </text>
      <motion.text x={ROW.x + 20} y={a.y + 19} fontSize={15} fontWeight={600} fill={col} style={{ opacity: tag }}>
        {`→ ${NAMES[a.engine]}`}
      </motion.text>
      <circle cx={ROW.socket} cy={a.y} r={17} fill="none" stroke={col} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="3 4" />

      {/* Route at rest, then lit behind the orb */}
      <path d={ROUTES[i].d} fill="none" stroke={col} strokeOpacity={0.16} strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" />
      <motion.path d={ROUTES[i].d} fill="none" stroke={col} strokeOpacity={0.75} strokeWidth={2.4} strokeLinecap="round" style={{ pathLength: u }} />
      {PULSES.map((k) => (
        <Pulse key={k} i={i} a={a} k={k} p={p} flow={flow} />
      ))}

      <motion.circle cx={x} cy={y} r={a.orb * 2} fill={mix(a.lock ? LOCAL : FG, 18)} />
      <motion.circle cx={x} cy={y} r={a.orb} fill={a.lock ? LOCAL : FG} fillOpacity={a.lock ? 1 : 0.92} />
      {a.lock && <Lock x={x} y={y} s={a.orb * 1.3} />}
    </g>
  );
}

export default function Agents({ p, flow }: { p: MotionValue<number>; flow: MotionValue<number> }) {
  return (
    <g>
      {AGENTS.map((a, i) => (
        <AgentRow key={a.key} a={a} i={i} p={p} flow={flow} />
      ))}
    </g>
  );
}
