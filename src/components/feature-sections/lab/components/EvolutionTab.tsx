"use client";

import { motion } from "framer-motion";
import { Dna, Play } from "lucide-react";
import { GENOME_NODES } from "../data";
import type { GenomeNode } from "../types";
import TabBackdrop from "./TabBackdrop";

export default function EvolutionTab() {
  const width = 600;
  const height = 320;
  const padY = 30;

  const nodeCoord = (n: GenomeNode) => ({
    cx: n.x * width,
    cy: padY + (n.gen / 5) * (height - padY * 2),
  });

  return (
    <div className="relative flex flex-col rounded-xl border border-foreground/[0.10] bg-background/80 backdrop-blur-xl overflow-hidden">
      <TabBackdrop tab="evolution" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Dna className="h-4 w-4 text-amber-400" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            Genome tree
          </span>
        </div>
        <div className="flex items-center gap-4 text-base font-mono">
          <span className="text-foreground/70">
            Gen <span className="text-foreground font-semibold tabular-nums">5</span>
          </span>
          <span className="text-foreground/70">
            Best <span className="text-amber-400 font-semibold tabular-nums">94</span>
          </span>
          <span className="text-foreground/70">
            Lineage <span className="text-emerald-400 font-semibold">+52%</span>
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[340px] text-foreground"
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 1, 2, 3, 4, 5].map((g) => {
            const y = padY + (g / 5) * (height - padY * 2);
            return (
              <g key={g}>
                <line
                  x1={30}
                  y1={y}
                  x2={width - 30}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeDasharray="2 4"
                />
                <text
                  x={12}
                  y={y + 3}
                  fill="currentColor"
                  fillOpacity={0.55}
                  fontSize={16}
                  fontFamily="monospace"
                >
                  G{g}
                </text>
              </g>
            );
          })}

          {GENOME_NODES.filter((n) => n.parent).map((n) => {
            const parent = GENOME_NODES.find((p) => p.id === n.parent)!;
            const p1 = nodeCoord(parent);
            const p2 = nodeCoord(n);
            const isBestPath = n.best || (n.alive && n.fitness > 80);
            return (
              <motion.path
                key={`b-${n.id}`}
                d={`M ${p1.cx} ${p1.cy} C ${p1.cx} ${(p1.cy + p2.cy) / 2}, ${p2.cx} ${(p1.cy + p2.cy) / 2}, ${p2.cx} ${p2.cy}`}
                fill="none"
                stroke={isBestPath ? "#f59e0b" : "currentColor"}
                strokeOpacity={isBestPath ? 1 : 0.28}
                strokeWidth={isBestPath ? 2 : 1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: n.gen * 0.15 }}
              />
            );
          })}

          {GENOME_NODES.map((n) => {
            const { cx, cy } = nodeCoord(n);
            const culledColor = "rgba(127,127,127,0.45)";
            const fill = !n.alive
              ? culledColor
              : n.best
                ? "#f59e0b"
                : n.fitness > 80
                  ? "#10b981"
                  : "#06b6d4";
            const labelFill = !n.alive ? "currentColor" : "#ffffff";
            return (
              <motion.g
                key={n.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + n.gen * 0.15, type: "spring" }}
              >
                {n.best && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    animate={{ opacity: [0.3, 0.8, 0.3], r: [14, 18, 14] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <circle cx={cx} cy={cy} r={8} fill={fill} />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill={labelFill}
                  fontSize={16}
                  fontFamily="monospace"
                  fontWeight={700}
                >
                  {n.fitness}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="relative flex items-center justify-between border-t border-foreground/[0.06] px-5 py-3 text-base font-mono">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-foreground/85">best lineage</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-emerald" />
            <span className="text-foreground/85">alive</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-foreground/30" />
            <span className="text-foreground/85">culled</span>
          </span>
        </span>
        <button className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
          <Play className="h-3 w-3" /> breed next gen
        </button>
      </div>
    </div>
  );
}
