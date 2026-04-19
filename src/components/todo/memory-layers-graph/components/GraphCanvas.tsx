"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_META } from "../../memoryShared";
import type { GraphData } from "../index";

const WIDTH = 680;
const HEIGHT = 420;

export default function GraphCanvas({
  graph,
  freshId,
  reduced,
}: {
  graph: GraphData;
  freshId: number | null;
  reduced: boolean;
}) {
  const { nodes, edges, hubs } = graph;
  const hubById = new Map(hubs.map((h) => [h.id, h]));
  const nodeById = new Map(nodes.map((n) => [String(n.id), n]));

  return (
    <div className="relative bg-background/40 px-5 py-6 overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Stacking memory graph visualization"
      >
        <defs>
          {Object.entries(CATEGORY_META).map(([k, meta]) => (
            <radialGradient id={`graph-glow-${k}`} key={k}>
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.45" />
              <stop offset="70%" stopColor={meta.color} stopOpacity="0.05" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Hub glow halos */}
        {hubs.map((h) => (
          <circle
            key={`halo-${h.id}`}
            cx={h.x}
            cy={h.y}
            r={56}
            fill={`url(#graph-glow-${h.category})`}
          />
        ))}

        {/* Edges */}
        <g>
          {edges.map((edge, i) => {
            const from =
              hubById.get(edge.from) ?? nodeById.get(edge.from) ?? null;
            const to = nodeById.get(edge.to) ?? hubById.get(edge.to) ?? null;
            if (!from || !to) return null;
            const isHubEdge = edge.from.startsWith("hub-");
            const meta = isHubEdge
              ? CATEGORY_META[(from as { category: keyof typeof CATEGORY_META }).category]
              : null;
            const stroke = meta?.color ?? "rgba(255,255,255,0.25)";
            return (
              <motion.line
                key={`edge-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={stroke}
                strokeWidth={isHubEdge ? 1.4 : 0.8}
                strokeOpacity={isHubEdge ? 0.55 : 0.22}
                strokeDasharray={isHubEdge ? undefined : "3 4"}
                initial={reduced ? false : { pathLength: 0 }}
                animate={reduced ? undefined : { pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.02 }}
              />
            );
          })}
        </g>

        {/* Hub nodes */}
        {hubs.map((h) => {
          const meta = CATEGORY_META[h.category];
          return (
            <g key={h.id}>
              <circle
                cx={h.x}
                cy={h.y}
                r={18}
                fill="rgba(0,0,0,0.55)"
                stroke={meta.color}
                strokeWidth={1.5}
              />
              <circle
                cx={h.x}
                cy={h.y}
                r={6}
                fill={meta.color}
              />
              <text
                x={h.x}
                y={h.y + 36}
                textAnchor="middle"
                fontSize="11"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontWeight="700"
                letterSpacing="0.1em"
                style={{ textTransform: "uppercase" }}
                fill={meta.color}
              >
                {meta.label}
              </text>
            </g>
          );
        })}

        {/* Memory nodes */}
        <AnimatePresence>
          {nodes.map((n) => {
            const meta = CATEGORY_META[n.memory.category];
            const isFresh = freshId === n.memory.id;
            const radius = 6 + (n.memory.importance / 10) * 5;
            return (
              <motion.g
                key={n.id}
                initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.35 }}
              >
                {isFresh && !reduced && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={radius + 4}
                    fill="none"
                    stroke={meta.color}
                    strokeWidth={1.5}
                    initial={{ opacity: 0.7, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={radius}
                  fill={`${meta.color}40`}
                  stroke={meta.color}
                  strokeWidth={1.25}
                />
                <text
                  x={n.x + radius + 6}
                  y={n.y + 3}
                  fontSize="9"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fill="rgba(255,255,255,0.85)"
                >
                  {truncate(n.memory.title, 32)}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
