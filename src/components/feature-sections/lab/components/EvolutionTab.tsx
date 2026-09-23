"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Dna, Play } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { GENOME_NODES } from "../data";
import { bestLineage, genomeSummary, nodeTone, type NodeTone } from "../genome";
import type { GenomeNode } from "../types";
import TabBackdrop from "./TabBackdrop";

// Module-level: GENOME_NODES is static, so the lineage and the header figures
// are computed once, from the same data the tree draws.
const LINEAGE = bestLineage(GENOME_NODES);
const SUMMARY = genomeSummary(GENOME_NODES);
const GENS = Array.from({ length: SUMMARY.generation + 1 }, (_, g) => g);
const SPAN = Math.max(SUMMARY.generation, 1);

// One colour per legend entry; the legend dots below use the same tokens.
const TONE_FILL: Record<NodeTone, string> = {
  lineage: BRAND_VAR.amber,
  alive: BRAND_VAR.emerald,
  culled: "currentColor",
};

export default function EvolutionTab() {
  const reduced = useReducedMotion() ?? false;
  const width = 600;
  const height = 320;
  const padY = 30;

  const nodeCoord = (n: GenomeNode) => ({
    cx: n.x * width,
    cy: padY + (n.gen / SPAN) * (height - padY * 2),
  });

  return (
    <div className="relative flex flex-col rounded-xl border border-foreground/[0.10] bg-background/80 backdrop-blur-xl overflow-hidden">
      <TabBackdrop tab="evolution" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Dna className="h-4 w-4 text-brand-amber" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            Genome tree
          </span>
        </div>
        <div className="flex items-center gap-4 text-base font-mono">
          <span className="text-foreground/70">
            Gen{" "}
            <span className="text-foreground font-semibold tabular-nums">{SUMMARY.generation}</span>
          </span>
          <span className="text-foreground/70">
            Best <span className="text-brand-amber font-semibold tabular-nums">{SUMMARY.best}</span>
          </span>
          <span className="text-foreground/70">
            Lineage{" "}
            <span className="text-brand-emerald font-semibold tabular-nums">
              {SUMMARY.lineageGainPct >= 0 ? "+" : ""}
              {SUMMARY.lineageGainPct}%
            </span>
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[340px] text-foreground"
          preserveAspectRatio="xMidYMid meet"
        >
          {GENS.map((g) => {
            const y = padY + (g / SPAN) * (height - padY * 2);
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
            // An edge is on the lineage when its child is: the walk from the
            // best node puts every ancestor, and so every such parent, in the set.
            const isBestPath = LINEAGE.has(n.id);
            return (
              <motion.path
                key={`b-${n.id}`}
                d={`M ${p1.cx} ${p1.cy} C ${p1.cx} ${(p1.cy + p2.cy) / 2}, ${p2.cx} ${(p1.cy + p2.cy) / 2}, ${p2.cx} ${p2.cy}`}
                fill="none"
                stroke={isBestPath ? BRAND_VAR.amber : "currentColor"}
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
            const tone = nodeTone(n, LINEAGE);
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
                    stroke={BRAND_VAR.amber}
                    strokeWidth={1.5}
                    animate={reduced ? { opacity: 0.8, r: 16 } : { opacity: [0.3, 0.8, 0.3], r: [14, 18, 14] }}
                    transition={reduced ? undefined : { duration: 2, repeat: Infinity }}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill={TONE_FILL[tone]}
                  fillOpacity={tone === "culled" ? 0.3 : 1}
                />
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
            <div className="h-2 w-2 rounded-full bg-brand-amber" />
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
