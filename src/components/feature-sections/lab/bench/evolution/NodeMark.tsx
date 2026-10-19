"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { GenomeNode } from "../../types";
import { nodeTone } from "../../genome";
import { LINEAGE, NODE_VERSION } from "./strip";

/**
 * One version on the strip chart, placed by transform (never by animating
 * cx/cy). Lineage nodes are lit amber with their fitness printed; other
 * survivors are emerald points; culled versions are struck out with an x.
 * Nodes the ledger names carry their version id, and the live one says so.
 */
export default function NodeMark({
  n,
  x,
  y,
  on,
  best,
  liveId,
  liveLabel,
  still,
}: {
  n: GenomeNode;
  x: number;
  y: number;
  on: boolean;
  best: boolean;
  liveId: string;
  liveLabel: string;
  still: boolean;
}) {
  const tone = nodeTone(n, LINEAGE);
  const version = NODE_VERSION[n.id];
  const color = tone === "lineage" ? BRAND_VAR.amber : tone === "alive" ? BRAND_VAR.emerald : "currentColor";
  const below = version !== undefined && tone !== "lineage";
  return (
    <motion.g
      style={{ x, y }}
      initial={false}
      animate={{ opacity: on ? 1 : 0.12, scale: on ? 1 : 0.7 }}
      transition={{ duration: still ? 0 : 0.35 }}
    >
      {tone === "culled" ? (
        <g stroke="currentColor" strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round">
          <line x1={-4.5} y1={-4.5} x2={4.5} y2={4.5} />
          <line x1={-4.5} y1={4.5} x2={4.5} y2={-4.5} />
        </g>
      ) : (
        <>
          {best && <circle r={11} fill="none" stroke={color} strokeOpacity={0.6} strokeDasharray="2 3" />}
          <circle r={tone === "lineage" ? 6 : 5} fill={color} stroke="var(--background)" strokeWidth={1.5} />
        </>
      )}
      {(tone === "lineage" || version) && (
        <text
          x={below ? 0 : -10}
          y={below ? 22 : -10}
          textAnchor={below ? "middle" : "end"}
          className="font-mono"
          fontSize={13}
          fontWeight={700}
          fill={color}
        >
          {version ? `${version} ${n.fitness}` : n.fitness}
          {version === liveId && (
            <tspan fill={BRAND_VAR.emerald} dx={6}>
              {liveLabel}
            </tspan>
          )}
        </text>
      )}
    </motion.g>
  );
}
