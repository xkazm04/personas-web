"use client";

import { motion } from "framer-motion";
import { loopTransition } from "@/lib/motion/loop-gate";
import { type OrbitGeometry, type OrbitNode } from "./geometry";
import { ink } from "./telemetry";

const COMET = { pathLength: 0.16, pathSpacing: 1 };
const comet = (run: boolean, delay: number, duration = 1) =>
  run
    ? { animate: { pathOffset: [-0.16, 1], opacity: 1 }, transition: { delay, duration, ease: "easeInOut" as const } }
    : { animate: { pathOffset: -0.16, opacity: 0 }, transition: { duration: 0 } };

/**
 * The drawn layer of the hub: floor light, perspective rings, swirling spokes,
 * ambient traffic on every spoke, and the active relay - a comet into the hub,
 * a pulse, a comet out to the tool that needs it. Every loop rests when `run`
 * is false; the active relay's trace stays lit, so the still frame tells the
 * whole story.
 */
export default function HubArt({
  geo,
  uid,
  nodes,
  colors,
  from,
  to,
  step,
  run,
}: {
  geo: OrbitGeometry;
  uid: string;
  nodes: OrbitNode[];
  colors: string[];
  from: number;
  to: number;
  step: number;
  run: boolean;
}) {
  const { hub: HUB, orbit: ORBIT, floor: FLOOR, rings: RINGS } = geo;
  const relayColor = ink(colors[from] ?? "var(--brand-cyan)", 75);
  return (
    <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.22" />
          <stop offset="55%" stopColor="var(--brand-purple)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--brand-purple)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-core`} cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.42" />
          <stop offset="60%" stopColor="var(--brand-cyan)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--brand-purple)" stopOpacity="0.32" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx={HUB.x} cy={HUB.y + 30} rx={FLOOR.rx} ry={FLOOR.ry} fill={`url(#${uid}-floor)`} />

      {/* The orbit track the tools ride on, in the same perspective. */}
      <ellipse cx={HUB.x} cy={HUB.y} rx={ORBIT.rx} ry={ORBIT.ry} fill="none" stroke="var(--foreground)" strokeOpacity={0.1} strokeWidth={1.2} />

      {RINGS.map((ring) => (
        <motion.ellipse
          key={ring.rx}
          cx={HUB.x}
          cy={HUB.y + 8}
          rx={ring.rx}
          ry={ring.rx * ring.ratio}
          fill="none"
          stroke="var(--brand-cyan)"
          strokeOpacity={0.35}
          strokeWidth={1.4}
          strokeDasharray={ring.dash}
          animate={{ strokeDashoffset: run ? [0, -ring.rx * 2.2] : 0 }}
          transition={loopTransition(run, { duration: ring.period, ease: "linear" })}
        />
      ))}

      {nodes.map((n, i) => (
        <path key={`s${i}`} d={n.spoke} fill="none" stroke="var(--foreground)" strokeOpacity={0.12 + n.depth * 0.08} strokeWidth={1.2} strokeDasharray="3 7" />
      ))}

      {/* Ambient traffic: every tool keeps reporting in. */}
      {nodes.map((n, i) => (
        <motion.path
          key={`a${i}`}
          d={n.spoke}
          fill="none"
          stroke={ink(colors[i], 65)}
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={{ ...COMET, pathOffset: -0.16 }}
          animate={run ? { pathOffset: [-0.16, 1] } : { pathOffset: -0.16 }}
          transition={loopTransition(run, { duration: 2.4 + (i % 4) * 0.5, delay: (i * 0.53) % 3, repeatDelay: 1.6 + (i % 3), ease: "easeIn" })}
        />
      ))}

      {/* The active relay: its trace stays lit, its comets travel in turn. */}
      <path d={nodes[from].spoke} fill="none" stroke={relayColor} strokeOpacity={0.6} strokeWidth={2.5} />
      <path d={nodes[to].spokeOut} fill="none" stroke={relayColor} strokeOpacity={0.6} strokeWidth={2.5} />
      <g key={step} filter={`url(#${uid}-glow)`}>
        <motion.path d={nodes[from].spoke} fill="none" stroke={relayColor} strokeWidth={5} strokeLinecap="round" initial={{ ...COMET, pathOffset: -0.16 }} {...comet(run, 0.1)} />
        <motion.path d={nodes[to].spokeOut} fill="none" stroke={relayColor} strokeWidth={5} strokeLinecap="round" initial={{ ...COMET, pathOffset: -0.16 }} {...comet(run, 1.35)} />
        <motion.circle
          cx={HUB.x}
          cy={HUB.y}
          fill="none"
          stroke={relayColor}
          strokeWidth={2}
          initial={{ r: HUB.r, opacity: 0 }}
          animate={run ? { r: [HUB.r, HUB.r + 70], opacity: [0.8, 0] } : { r: HUB.r, opacity: 0 }}
          transition={run ? { delay: 1.05, duration: 1.3, ease: "easeOut" } : { duration: 0 }}
        />
      </g>

      {/* The hub itself: a lit glass core. */}
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r + 16} fill="var(--brand-cyan)" fillOpacity={0.08} />
      <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={`url(#${uid}-core)`} stroke="var(--brand-cyan)" strokeOpacity={0.7} strokeWidth={1.5} />
      <path d={`M${HUB.x - 40} ${HUB.y - 20} A ${HUB.r - 10} ${HUB.r - 10} 0 0 1 ${HUB.x + 8} ${HUB.y - 46}`} fill="none" stroke="var(--foreground)" strokeOpacity={0.28} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
