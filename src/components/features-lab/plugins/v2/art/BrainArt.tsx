"use client";

import { motion } from "framer-motion";

const P = "var(--brand-purple)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

const NODES: [number, number][] = [
  [210, 120], // 0 hub: today's question
  [96, 58], [150, 196], [70, 150], [300, 52], [340, 150], [270, 200],
  [36, 92], [380, 92], [200, 30], [118, 118], [312, 104],
];
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 4], [0, 5], [0, 6], [0, 10], [0, 11], [1, 7], [1, 10], [3, 10], [3, 7],
  [4, 9], [4, 8], [5, 8], [5, 11], [6, 2], [9, 1], [11, 4],
];
/** Recall walks: hub -> note -> backlink, one per beat. */
const WALKS: number[][] = [[0, 1, 7], [0, 5, 8], [0, 2, 6], [0, 10, 3], [0, 4, 9]];

/**
 * Obsidian Brain, drawn: your vault as a graph, and recall as light walking
 * it - from today's question to a note, then along the backlink to the next.
 */
export default function BrainArt({ step, run }: { step: number; run: boolean }) {
  const walk = WALKS[step % WALKS.length];
  const hot = new Set(walk.slice(1).map((n, i) => `${walk[i]}-${n}`));
  const isHot = (a: number, b: number) => hot.has(`${a}-${b}`) || hot.has(`${b}-${a}`);
  const d = walk.map((n, i) => `${i ? "L" : "M"}${NODES[n][0]} ${NODES[n][1]}`).join(" ");
  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden="true">
      {EDGES.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={NODES[a][0]}
          y1={NODES[a][1]}
          x2={NODES[b][0]}
          y2={NODES[b][1]}
          stroke={isHot(a, b) ? P : mix(P, 28)}
          strokeWidth={isHot(a, b) ? 2.4 : 1}
          style={{ transition: "stroke 400ms, stroke-width 400ms" }}
        />
      ))}
      <motion.path
        key={step}
        d={d}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: run ? 0 : 1, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: run ? 0 : 0.5 }}
        transition={run ? { duration: 1.4, ease: "easeOut" } : { duration: 0 }}
      />
      {NODES.map(([x, y], i) => {
        const lit = walk.includes(i);
        if (i === 0) {
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={22} fill={mix(P, 22)} stroke={P} strokeWidth={2} style={{ filter: `drop-shadow(0 0 12px ${P})` }} />
              <circle cx={x} cy={y} r={7} fill={P} />
            </g>
          );
        }
        return (
          <g key={i} style={{ transition: "opacity 400ms" }} opacity={lit ? 1 : 0.75}>
            <rect x={x - 11} y={y - 13} width={22} height={26} rx={4} fill={lit ? P : "color-mix(in srgb, var(--background) 80%, var(--brand-purple))"} stroke={mix(P, lit ? 100 : 55)} strokeWidth={1.2} />
            <rect x={x - 6} y={y - 6} width={12} height={2} rx={1} fill={lit ? "var(--background)" : mix(P, 70)} />
            <rect x={x - 6} y={y - 1} width={9} height={2} rx={1} fill={lit ? "var(--background)" : mix(P, 50)} />
            <rect x={x - 6} y={y + 4} width={11} height={2} rx={1} fill={lit ? "var(--background)" : mix(P, 50)} />
          </g>
        );
      })}
    </svg>
  );
}
