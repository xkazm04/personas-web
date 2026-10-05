"use client";

import { motion } from "framer-motion";
import { DIMS, inkA, type DimKey } from "../shared/dims";
import type { DimPhase } from "../shared/timeline";
import { GRID_H, GRID_W, PLACE } from "./layout";

const C = PLACE.core;
const cx = C.x + C.w / 2;
const cy = C.y + C.h / 2;

/** A port on the sentence's border facing a tile, and the tile point it reaches. */
function ends(key: DimKey) {
  const t = PLACE[key];
  const tx = t.x + t.w / 2;
  const ty = t.y + t.h / 2;
  const dx = Math.sign(Math.round(tx - cx));
  const dy = Math.sign(Math.round(ty - cy));
  const sx = dx === 0 ? cx : dx < 0 ? C.x : C.x + C.w;
  const sy = dy === 0 ? cy : dy < 0 ? C.y : C.y + C.h;
  const ex = dx === 0 ? cx : dx < 0 ? t.x + t.w : t.x;
  const ey = dy === 0 ? cy : dy < 0 ? t.y + t.h : t.y;
  // Corner ports sit a little inside the console's rounded corner.
  const inset = dx !== 0 && dy !== 0 ? 0.9 : 0;
  return { sx: sx - dx * inset, sy: sy - dy * inset, ex: ex + dx * 0.4, ey: ey + dy * 0.4 };
}

/**
 * The sentence wired to its eight decisions: a port on the console's edge
 * for each tile. When a dimension is engaged its port flares and a spark
 * jumps the gutter into the tile; resolved ports stay lit in their ink.
 */
export default function Wires({ phases, moving, run }: { phases: Record<DimKey, DimPhase>; moving: boolean; run: number }) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox={`0 0 ${GRID_W} ${GRID_H}`} aria-hidden="true">
      {DIMS.map((d) => {
        const { sx, sy, ex, ey } = ends(d.key);
        const p = phases[d.key];
        const lit = p !== "pending";
        const firing = moving && p === "engaged";
        return (
          <g key={d.key}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={d.ink} strokeWidth={0.22} strokeLinecap="round" style={{ opacity: lit ? 0.85 : 0.12, transition: "opacity .5s" }} />
            <circle cx={sx} cy={sy} r={0.75} fill={inkA(d.ink, lit ? 30 : 0)} style={{ transition: "fill .5s" }} />
            <circle cx={sx} cy={sy} r={0.36} fill={lit ? d.ink : "rgba(var(--surface-overlay), 0.25)"} style={{ transition: "fill .5s" }} />
            {firing && (
              <>
                <motion.circle
                  key={`spark-${run}`}
                  r={0.55}
                  fill={d.ink}
                  style={{ filter: `drop-shadow(0 0 0.8px ${d.ink})` }}
                  initial={{ cx: sx, cy: sy, opacity: 0 }}
                  animate={{ cx: ex, cy: ey, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.6, ease: "easeIn" }}
                />
                <motion.circle
                  key={`burst-${run}`}
                  cx={ex}
                  cy={ey}
                  fill="none"
                  stroke={d.ink}
                  strokeWidth={0.2}
                  initial={{ r: 0.2, opacity: 0 }}
                  animate={{ r: 4.5, opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
