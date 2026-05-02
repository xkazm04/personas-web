"use client";

import { motion } from "framer-motion";
import type { Feature } from "../types";

/* ── Position constants ───────────────────────────────────────────────
 * The thread renders a vertical dashed line with numbered dots beside
 * each feature card. Dot 0 (the hero card) sits near the top; dots
 * 1..N (the grid cards) are spaced down the line. The numbers below
 * are tied to the heights of the parent layout's hero card and grid
 * card (see features/index.tsx) — change them when the card padding
 * or spacing changes.
 *
 *   HERO_DOT_TOP_PX        — top offset of dot 0 (hero card)
 *   GRID_DOT_FIRST_OFFSET  — vertical offset of dot 1 from 50% mark
 *   GRID_DOT_SPACING_PX    — distance between consecutive grid dots
 *
 * All in pixels; combine with `calc(50% + …)` for grid dots so they
 * stay anchored to the grid row's vertical center.
 * ─────────────────────────────────────────────────────────────────── */
const HERO_DOT_TOP_PX = 28;
const GRID_DOT_FIRST_OFFSET_PX = -40;
const GRID_DOT_SPACING_PX = 80;

function dotTop(index: number): number | string {
  if (index === 0) return HERO_DOT_TOP_PX;
  // index 1 → -40 (sits 40px above midline); index 2 → +40; index 3 → +120; …
  const offset = (index - 1) * GRID_DOT_SPACING_PX + GRID_DOT_FIRST_OFFSET_PX;
  return `calc(50% + ${offset}px)`;
}

export default function ProgressionThread({ features }: { features: Feature[] }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 bottom-0 hidden md:flex flex-col items-center"
      style={{ width: 32 }}
    >
      <motion.div
        className="absolute inset-x-3.75 top-6 bottom-6 w-px border-l border-dashed border-glass"
        variants={{
          hidden: { scaleY: 0 },
          visible: { scaleY: 1, transition: { duration: 1.2, delay: 0.3, ease: "easeOut" } },
        }}
        style={{ transformOrigin: "top" }}
      />
      {features.map((f, i) => (
        <motion.div
          key={f.number}
          className="absolute flex items-center justify-center"
          style={{ top: dotTop(i), left: 8 }}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { delay: 0.4 + i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <div
            className={`flex items-center justify-center rounded-full border text-base font-mono font-bold tabular-nums ${
              i === 0
                ? "h-7 w-7 border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                : "h-5 w-5 border-glass-hover bg-white/3 text-white/70"
            }`}
          >
            {f.number}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
