"use client";

import { motion } from "framer-motion";
import { tint, BRAND_VAR } from "@/lib/brand-theme";
import type { MindRun } from "../shared/useMindRun";
import { curve, graphEdges, graphNodes, samples } from "./layout";
import GraphNode from "./GraphNode";

/**
 * The live flowchart (parse -> select -> tools -> execute -> verify ->
 * result), redrawn as layered light: a pool of light that follows the beat
 * under attention, edges that draw in and carry a travelling packet while
 * their target works, and HTML nodes so the type stays crisp at every size.
 */
export default function MindGraph({ run, live }: { run: MindRun; live: boolean }) {
  const nodes = graphNodes(run);
  const edges = graphEdges(nodes);
  const idle = run.phase === "idle";
  const focusNodes = nodes.filter((n) => n.beat === run.focus);
  const fx = focusNodes.reduce((s, n) => s + n.x, 0) / Math.max(focusNodes.length, 1);
  const fy = focusNodes[0]?.y ?? 8;
  const focusBrand = focusNodes.length === 1 ? focusNodes[0].brand : "blue";
  const ease = run.reduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="absolute inset-0" aria-hidden>
      {/* Light pool under the beat in attention. */}
      <motion.div
        className="pointer-events-none absolute h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(closest-side, ${tint(focusBrand, idle ? 6 : 16)}, transparent)` }}
        initial={false}
        animate={{ left: `${fx}%`, top: `${fy}%` }}
        transition={ease}
      />
      {/* Sonar: the beat under attention radiates while it works. */}
      {live && run.isRunning &&
        [0, 0.6].map((delay) => (
          <motion.span
            key={`ring-${run.focus}-${delay}`}
            className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ left: `${fx}%`, top: `${fy}%`, borderColor: tint(focusBrand, 45) }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 2.2], opacity: [0.7, 0] }}
            transition={{ duration: 1.2, delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map((e) => {
          const st = run.statusOf(e.to.beat);
          const lit = !idle && st !== "pending";
          return (
            <g key={`${e.from.id}-${e.to.id}`}>
              <path
                d={curve(e.from, e.to)}
                fill="none"
                stroke="color-mix(in srgb, var(--foreground) 14%, transparent)"
                strokeWidth={1.25}
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={curve(e.from, e.to)}
                fill="none"
                stroke={st === "done" ? BRAND_VAR.emerald : BRAND_VAR[e.to.brand]}
                strokeWidth={2}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 3px ${tint(st === "done" ? "emerald" : e.to.brand, 60)})` }}
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                transition={run.reduced ? { duration: 0 } : { duration: 0.55, ease: "easeInOut" }}
              />
            </g>
          );
        })}
      </svg>
      {/* Packets: light riding an edge while its target works. */}
      {live &&
        edges
          .filter((e) => run.statusOf(e.to.beat) === "active")
          .map((e) => {
            const p = samples(e.from, e.to);
            return (
              <motion.span
                key={`p-${e.from.id}-${e.to.id}`}
                className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: BRAND_VAR[e.to.brand], boxShadow: `0 0 12px 3px ${tint(e.to.brand, 55)}` }}
                initial={{ left: p.left[0], top: p.top[0], opacity: 0 }}
                animate={{ left: p.left, top: p.top, opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
      {nodes.map((n) => (
        <GraphNode
          key={n.id}
          node={n}
          status={idle ? "pending" : run.statusOf(n.beat)}
          focused={!idle && n.beat === run.focus}
          live={live}
          reduced={run.reduced}
        />
      ))}
    </div>
  );
}
