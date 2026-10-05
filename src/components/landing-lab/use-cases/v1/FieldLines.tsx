"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandTint } from "../shared/catalog";
import { CHOOSE, CONSIDER, DOCK, SCAN, type Phase } from "../shared/cycle";
import { ATTRACTOR, PERSONA, PULL, VIEW_H, VIEW_W, socketAt, spotOf } from "./geometry";

/** A candidate's position while the need pulls it (`pulled` 1 = considered, 1.5 = chosen). */
export function pulledAt(key: (typeof CASES)[number]["chosen"], pulled: number) {
  const s = spotOf(key);
  return { x: s.x + (ATTRACTOR.x - s.x) * PULL * pulled, y: s.y + (ATTRACTOR.y - s.y) * PULL * pulled };
}

/**
 * The drawn layer under the tiles: the persona's glow and ring, faint field
 * lines between persona and field, a thread from each seated socket back to
 * the tool it came from, and the sweep - a beam from the waiting socket that
 * visits each candidate in turn, then locks on the chosen one.
 */
export default function FieldLines({
  active,
  phase,
  docked,
  moving,
  scanMs,
  sweepKey,
}: {
  active: number;
  phase: Phase;
  docked: boolean[];
  moving: boolean;
  scanMs: number;
  sweepKey: string;
}) {
  const uid = useId().replace(/:/g, "");
  const c = CASES[active];
  const sock = socketAt(active);
  const pts = c.candidates.map((k) => pulledAt(k, 1));
  const lock = pulledAt(c.chosen, 1.5);
  const sweeping = phase === SCAN && moving;
  const locked = phase === CHOOSE || (phase === SCAN && !moving);
  const end = locked ? lock : pts[0];
  const xs = pts.flatMap((p) => [p.x, p.x]);
  const ys = pts.flatMap((p) => [p.y, p.y]);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0%" style={{ stopColor: tint("purple", 22) }} />
          <stop offset="100%" style={{ stopColor: tint("purple", 0) }} />
        </radialGradient>
      </defs>
      <circle cx={PERSONA.cx} cy={PERSONA.cy} r={PERSONA.ring + 40} fill={`url(#${uid}-halo)`} />
      <circle cx={PERSONA.cx} cy={PERSONA.cy} r={PERSONA.ring} fill="none" style={{ stroke: tint("cyan", 22) }} strokeWidth={1.2} />
      {[0.55, 0.8, 1.05].map((k) => (
        <ellipse
          key={k}
          cx={(PERSONA.cx + ATTRACTOR.x) / 2 + 40}
          cy={PERSONA.cy + 10}
          rx={170 * k + 60}
          ry={220 * k}
          fill="none"
          style={{ stroke: tint("cyan", 7) }}
          strokeDasharray="2 9"
        />
      ))}

      {CASES.map((cc, i) => {
        if (!docked[i] || (i === active && phase === DOCK && moving)) return null;
        const s = socketAt(i);
        const home = spotOf(cc.chosen);
        return (
          <line key={cc.need} x1={s.x} y1={s.y} x2={home.x} y2={home.y} strokeWidth={1.4} strokeDasharray="4 6" style={{ stroke: brandTint(TOOLS[cc.chosen], 45) }} />
        );
      })}

      {(phase === CONSIDER || phase === SCAN) && (
        <g key={`pull-${sweepKey}`}>
          <motion.circle
            cx={ATTRACTOR.x}
            cy={ATTRACTOR.y}
            fill={`url(#${uid}-halo)`}
            initial={{ r: moving ? 10 : 70, opacity: moving ? 0 : 1 }}
            animate={{ r: 70, opacity: 1 }}
            transition={{ duration: moving ? 0.5 : 0 }}
          />
          {pts.map((p, k) => (
            <motion.path
              key={k}
              d={`M ${ATTRACTOR.x} ${ATTRACTOR.y} Q ${(ATTRACTOR.x + p.x) / 2} ${ATTRACTOR.y + (p.y - ATTRACTOR.y) * 0.15} ${p.x} ${p.y}`}
              fill="none"
              strokeWidth={1.2}
              strokeDasharray="3 5"
              style={{ stroke: tint("cyan", 40) }}
              initial={{ pathLength: moving ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: moving ? 0.6 : 0, delay: moving ? k * 0.05 : 0 }}
            />
          ))}
        </g>
      )}

      {(phase === SCAN || phase === CHOOSE) && (
        <g key={sweepKey}>
          <motion.line
            x1={sock.x}
            y1={sock.y}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ stroke: BRAND_VAR.cyan }}
            initial={{ x2: end.x, y2: end.y, opacity: 0.85 }}
            animate={sweeping ? { x2: xs, y2: ys } : { x2: end.x, y2: end.y }}
            transition={sweeping ? { duration: (scanMs / 1000) * 0.92, ease: "easeInOut" } : { duration: moving ? 0.35 : 0 }}
          />
          <motion.circle
            r={6}
            style={{ fill: BRAND_VAR.cyan }}
            initial={{ cx: end.x, cy: end.y }}
            animate={sweeping ? { cx: xs, cy: ys } : { cx: end.x, cy: end.y }}
            transition={sweeping ? { duration: (scanMs / 1000) * 0.92, ease: "easeInOut" } : { duration: moving ? 0.35 : 0 }}
          />
        </g>
      )}
    </svg>
  );
}
