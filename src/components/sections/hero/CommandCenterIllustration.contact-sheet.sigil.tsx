"use client";

import { motion } from "framer-motion";
import { COLS, FRAMES, ROWS, mix } from "./CommandCenterIllustration.contact-sheet.data";

/**
 * The persona sigil lying under the sheet (as in the app's Cinema contact
 * sheet): eight petals from the centre cell, each pointing into the frame it
 * names. A petal lights in its dimension colour when its frame develops.
 * Decorative (the frames carry the text), so aria-hidden. The viewBox is laid
 * out in grid-track units and stretched to the sheet, so petals aim at the
 * frame centres whatever the sheet's aspect ratio.
 */

const U = 100;
const edges = (tracks: number[]) => tracks.reduce<number[]>((acc, t) => [...acc, acc[acc.length - 1] + t * U], [0]);
const X = edges(COLS);
const Y = edges(ROWS);
const W = X[3];
const H = Y[3];
const centre = (e: number[], i: number) => (e[i - 1] + e[i]) / 2;
const CX = centre(X, 2);
const CY = centre(Y, 2);

const PETALS = FRAMES.map((f) => {
  const dx = centre(X, f.cell[0]) - CX;
  const dy = centre(Y, f.cell[1]) - CY;
  const outer = Math.hypot(dx, dy) * 0.66;
  const inner = 40;
  const w = 10;
  const d = `M 0 ${-inner} C ${w} ${-outer * 0.5}, ${w} ${-outer * 0.78}, 0 ${-outer} C ${-w} ${-outer * 0.78}, ${-w} ${-outer * 0.5}, 0 ${-inner} Z`;
  const rot = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return { d, rot, color: f.color };
});

export default function ContactSheetSigil({ step, still }: { step: number; still: boolean }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <g transform={`translate(${CX} ${CY})`}>
        <circle r={52} fill="none" stroke="var(--foreground)" strokeOpacity={0.08} vectorEffect="non-scaling-stroke" />
        {PETALS.map((p, i) => (
          <g key={i} transform={`rotate(${p.rot})`}>
            <path d={p.d} fill="none" stroke="var(--foreground)" strokeOpacity={0.12} vectorEffect="non-scaling-stroke" />
            <motion.path
              d={p.d}
              fill={mix(p.color, 22)}
              stroke={p.color}
              strokeOpacity={0.7}
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{ opacity: step > i ? 1 : 0 }}
              transition={still ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
