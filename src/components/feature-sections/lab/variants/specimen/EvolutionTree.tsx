"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { GENOME_NODES } from "../../data";
import { LEDGER_NODE } from "../../experiment";
import { bestLineage, genomeSummary, nodeTone, type NodeTone } from "../../genome";
import type { GenomeNode } from "../../types";
import { beat } from "./motion";
import { nodeCode } from "./Plate";

/*
 * The phylogeny, grown left to right one generation per beat of `p` (0-1).
 * Every branch is drawn as it grows; culled specimens then wither (their
 * branch goes dashed and grey). The best lineage, walked from the best node
 * to the root by genome.ts, is the living vein, and a pulse rides it while
 * the plate is observed. Geometry is in the box's own pixels on the stage.
 */

const LINEAGE = bestLineage(GENOME_NODES);
const SUMMARY = genomeSummary(GENOME_NODES);
const T = SUMMARY.generation + 1;
const SPAN = Math.max(SUMMARY.generation, 1);
const XS = GENOME_NODES.map((n) => n.x);
const MIN_X = Math.min(...XS);
const RANGE_X = Math.max(...XS) - MIN_X || 1;
const BY_ID = new Map(GENOME_NODES.map((n) => [n.id, n]));
/** Genome node -> ledger version id, so the tree names the strains the rail rates. */
const VERSION_OF = new Map<string, string>(Object.entries(LEDGER_NODE).map(([v, node]) => [node, v]));
const TONE: Record<NodeTone, BrandKey | null> = { lineage: "amber", alive: "emerald", culled: null };
const toneColor = (tone: NodeTone) => (TONE[tone] ? BRAND_VAR[TONE[tone]] : "var(--foreground)");
const r2 = (n: number) => Math.round(n * 100) / 100;
const radius = (fit: number) => r2(6 + ((fit - 55) / 45) * 6);

export interface TreeBox {
  w: number;
  h: number;
}

function layout({ w, h }: TreeBox) {
  const padL = 30;
  const padR = 64;
  const padT = 30;
  const padB = 40;
  const at = (n: GenomeNode) => ({
    x: r2(padL + (n.gen / SPAN) * (w - padL - padR)),
    y: r2(padT + ((n.x - MIN_X) / RANGE_X) * (h - padT - padB)),
  });
  const edge = (n: GenomeNode) => {
    const a = at(BY_ID.get(n.parent!)!);
    const b = at(n);
    const mx = r2((a.x + b.x) / 2);
    return { d: `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`, tail: `C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}` };
  };
  const chain = [...LINEAGE].reverse().map((id) => BY_ID.get(id)!);
  const root = at(chain[0]);
  const vein = `M${root.x} ${root.y} ${chain.slice(1).map((n) => edge(n).tail).join(" ")}`;
  return { at, edge, vein, padL, padR, axisY: h - 14 };
}

function Branch({ n, d, p }: { n: GenomeNode; d: string; p: MotionValue<number> }) {
  const onVein = LINEAGE.has(n.id);
  const pathLength = useTransform(p, (v) => beat(v, (n.gen - 0.7) / T, (n.gen + 0.05) / T));
  const wither = useTransform(p, (v) => (n.alive ? 0 : beat(v, (n.gen + 0.4) / T, (n.gen + 0.9) / T)));
  const living = useTransform(wither, (w) => 1 - w);
  return (
    <g>
      {onVein && <motion.path d={d} stroke={tint("amber", 30)} strokeWidth={10} strokeLinecap="round" style={{ pathLength }} />}
      <motion.path
        d={d}
        stroke={onVein ? BRAND_VAR.amber : n.alive ? BRAND_VAR.emerald : "var(--foreground)"}
        strokeOpacity={onVein ? 1 : 0.7}
        strokeWidth={onVein ? 3.2 : 1.8}
        strokeLinecap="round"
        style={{ pathLength, opacity: living }}
      />
      {!n.alive && (
        <motion.path d={d} stroke="var(--foreground)" strokeOpacity={0.45} strokeWidth={1.4} strokeDasharray="3 5" style={{ opacity: wither }} />
      )}
    </g>
  );
}

function Node({ n, x, y, p, liveId, running }: { n: GenomeNode; x: number; y: number; p: MotionValue<number>; liveId: string; running: boolean }) {
  const tone = nodeTone(n, LINEAGE);
  const color = toneColor(tone);
  const r = radius(n.fitness);
  const born = useTransform(p, (v) => beat(v, (n.gen + 0.02) / T, (n.gen + 0.3) / T));
  const wither = useTransform(p, (v) => (n.alive ? 0 : beat(v, (n.gen + 0.4) / T, (n.gen + 0.9) / T)));
  const scale = useTransform([born, wither], ([b, w]: number[]) => b * (1 - 0.3 * w));
  const opacity = useTransform([born, wither], ([b, w]: number[]) => b * (1 - 0.5 * w));
  const version = VERSION_OF.get(n.id);
  const live = version === liveId;
  return (
    <motion.g style={{ x, y, scale, opacity }}>
      {n.best && (
        <motion.circle
          r={r + 7}
          stroke={BRAND_VAR.amber}
          strokeWidth={1.6}
          initial={false}
          animate={running ? { scale: [1, 1.3, 1], opacity: [0.9, 0.2, 0.9] } : { scale: 1, opacity: 0.8 }}
          transition={running ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      )}
      <circle r={r} fill={tone === "culled" ? "var(--background)" : tint(TONE[tone]!, 28)} stroke={color} strokeOpacity={tone === "culled" ? 0.6 : 1} strokeWidth={1.8} strokeDasharray={tone === "culled" ? "2 3" : undefined} />
      <circle r={r2(r * 0.38)} fill={color} fillOpacity={tone === "culled" ? 0.5 : 1} />
      <text x={r + 5} y={5} fill="var(--foreground)" fontSize={14} fontFamily="var(--font-mono)" fontWeight={700}>
        {n.fitness}
      </text>
      <text x={0} y={r + 16} textAnchor="middle" fill="var(--foreground)" fillOpacity={0.7} fontSize={13} fontFamily="var(--font-mono)">
        {nodeCode(n.id)}
      </text>
      {version && (
        <text x={0} y={-r - 8} textAnchor="middle" fill={live ? BRAND_VAR.emerald : "var(--foreground)"} fontSize={13} fontFamily="var(--font-mono)" fontWeight={600}>
          {version}
          {live ? " ●" : ""}
        </text>
      )}
    </motion.g>
  );
}

export default function EvolutionTree({ box, p, liveId, running }: { box: TreeBox; p: MotionValue<number>; liveId: string; running: boolean }) {
  const words = labSectionCopy.evolution;
  const { at, edge, vein, padL, padR, axisY } = layout(box);
  const pulseOpacity = useTransform(p, (v) => (v >= 0.999 ? 1 : 0));
  const gens = Array.from({ length: T }, (_, g) => g);
  return (
    <svg viewBox={`0 0 ${box.w} ${box.h}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
      {gens.map((g) => {
        const x = r2(padL + (g / SPAN) * (box.w - padL - padR));
        return (
          <g key={g}>
            <line x1={x} y1={14} x2={x} y2={axisY - 16} stroke="var(--foreground)" strokeOpacity={0.1} strokeDasharray="2 5" />
            <text x={x} y={axisY} textAnchor="middle" fill="var(--foreground)" fillOpacity={0.7} fontSize={14} fontFamily="var(--font-mono)">
              {fillTemplate(words.genAxis, { gen: g })}
            </text>
          </g>
        );
      })}
      {GENOME_NODES.filter((n) => n.parent).map((n) => (
        <Branch key={n.id} n={n} d={edge(n).d} p={p} />
      ))}
      {/* the pulse riding the living vein, once the culture has grown */}
      <motion.g
        style={{ offsetPath: `path("${vein}")`, offsetRotate: "0deg", opacity: pulseOpacity }}
        initial={{ offsetDistance: "100%" }}
        animate={running ? { offsetDistance: ["0%", "100%"] } : { offsetDistance: "100%" }}
        transition={running ? { duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 } : { duration: 0 }}
      >
        <circle r={9} fill={tint("amber", 35)} />
        <circle r={3.5} fill={BRAND_VAR.amber} />
      </motion.g>
      {GENOME_NODES.map((n) => {
        const { x, y } = at(n);
        return <Node key={n.id} n={n} x={x} y={y} p={p} liveId={liveId} running={running} />;
      })}
    </svg>
  );
}
