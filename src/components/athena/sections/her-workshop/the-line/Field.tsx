"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ITEMS, itemState, type ItemState, type Scene } from "./data";
import type { V3Layout } from "./layout";

/**
 * The field and the line - one SVG in the art's own units.
 *
 * Under the line the ground is lit cyan: hers. Over it, a faint violet haze:
 * yours. Every piece of work is a mote at its height. A new one lands as a
 * pale ring; under the line it fills solid a beat later (done), over it it
 * turns into a violet ring that glows (waiting for you). The line is a crisp
 * core over a bloom, drawn once; at the flood it takes one bright pass end to
 * end and does not move. Only the visitor can move it.
 *
 * Motes change state on CSS transitions (a fixed per-mote delay staggers each
 * batch inside its tick) - two hundred framer nodes would be the wrong tool
 * for two hundred dots.
 */
const LOOK: Record<ItemState, { fill: string; stroke: string; o: number; k: number }> = {
  pending: { fill: "transparent", stroke: tint("cyan", 40), o: 0, k: 0.3 },
  new: { fill: "transparent", stroke: "var(--foreground)", o: 0.9, k: 1.25 },
  done: { fill: BRAND_VAR.cyan, stroke: tint("cyan", 0), o: 0.85, k: 1 },
  yours: { fill: tint("purple", 22), stroke: BRAND_VAR.purple, o: 1, k: 1.2 },
};

export default function Field({
  scene,
  phase,
  line,
  g,
  reduced,
}: {
  scene: Scene;
  phase: number;
  line: number;
  g: V3Layout;
  reduced: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const { x, y, w, h } = g.field;
  const ly = y + h - line * h;
  const d = `M ${x} ${ly} H ${x + w}`;

  return (
    <svg viewBox={`0 0 ${g.W} ${g.H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-yours`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint("purple", 4)} />
          <stop offset="100%" stopColor={tint("purple", 13)} />
        </linearGradient>
        <linearGradient id={`${id}-hers`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint("cyan", 14)} />
          <stop offset="100%" stopColor={tint("cyan", 3)} />
        </linearGradient>
        <filter id={`${id}-bloom`} x="-5%" y="-200%" width="110%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <rect x={x} y={y} width={w} height={h} rx={18} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x} y={y} width={w} height={Math.max(ly - y, 0)} fill={`url(#${id}-yours)`} />
        <motion.rect
          x={x}
          y={ly}
          width={w}
          height={Math.max(y + h - ly, 0)}
          fill={`url(#${id}-hers)`}
          initial={false}
          animate={{ opacity: scene.drawn ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1 }}
        />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={tint("cyan", 16)} strokeWidth={1.5} />

      {ITEMS.map((it, i) => {
        const st = itemState(it, phase, line);
        const look = LOOK[st];
        const fresh = st === "new" || (st === "yours" && phase === Math.floor(it.at));
        return (
          <circle
            key={i}
            cx={x + it.x * w}
            cy={y + h - it.s * h}
            r={it.label === undefined ? 4.5 : 7}
            fill={look.fill}
            stroke={look.stroke}
            strokeWidth={2}
            style={{
              opacity: look.o,
              transform: `scale(${look.k})`,
              transformBox: "fill-box",
              transformOrigin: "center",
              transition: reduced ? "none" : "opacity .45s, transform .45s, fill .45s, stroke .45s",
              transitionDelay: !reduced && fresh ? `${Math.round((it.at % 1) * 900)}ms` : "0ms",
            }}
          />
        );
      })}

      <motion.path d={d} fill="none" stroke={tint("cyan", 55)} strokeWidth={12} filter={`url(#${id}-bloom)`} initial={false} animate={{ opacity: scene.drawn ? 1 : 0 }} transition={{ duration: reduced ? 0 : 1 }} />
      <motion.path
        d={d}
        fill="none"
        stroke={BRAND_VAR.cyan}
        strokeWidth={3}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: scene.drawn ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: "easeInOut" }}
      />
      {scene.sweep && !reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={4}
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
          initial={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
          animate={{ pathOffset: 0.9, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}
