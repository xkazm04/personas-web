"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useAutoCycle } from "@/hooks/useAutoCycle";
import {
  VB_W,
  VB_H,
  STAGE_COUNT,
  AUTO_CYCLE_MS,
  NODES,
  EDGES,
  NODE_BY_ID,
  edgePath,
} from "./data";
import FlowNode, { type NodeState } from "./FlowNode";

/**
 * The animated DAG: a run cascades through stages in dependency order, lighting
 * nodes and flowing data along the edges into each newly-active stage, then
 * replays. Under reduced motion the whole pipeline renders done (fully lit) with
 * no cascade or flow. Continuous motion is gated via `useReducedMotion` (and the
 * cascade hook honors it too).
 */
export default function TeamCanvasFlow() {
  const reduced = useReducedMotion() ?? false;
  const { active } = useAutoCycle({ count: STAGE_COUNT, intervalMs: AUTO_CYCLE_MS });

  const nodeState = (stage: number): NodeState =>
    reduced || stage < active ? "done" : stage === active ? "active" : "pending";

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="h-full w-full"
      role="img"
      aria-label="A goal fans out to a team of personas working in parallel, then converges into a reviewed, shippable result."
    >
      {/* Edges */}
      {EDGES.map((e, i) => {
        const a = NODE_BY_ID[e.from];
        const b = NODE_BY_ID[e.to];
        const d = edgePath(a, b);
        const done = reduced || b.stage < active;
        const flowing = !reduced && b.stage === active;
        const accent = BRAND_VAR[b.brand];
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              strokeLinecap="round"
              stroke={done || flowing ? accent : "rgba(var(--surface-overlay), 0.14)"}
              strokeWidth={done || flowing ? 2 : 1.5}
              strokeOpacity={done || flowing ? 0.55 : 0.5}
              className="transition-all duration-500"
            />
            {flowing && (
              <motion.path
                d={d}
                fill="none"
                stroke={accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="2 11"
                animate={{ strokeDashoffset: [0, -13] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map((n) => (
        <FlowNode key={n.id} node={n} state={nodeState(n.stage)} />
      ))}
    </svg>
  );
}
