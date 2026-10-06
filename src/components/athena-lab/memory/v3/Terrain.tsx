"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { MARKS } from "./data";
import { pathOf, segments, type MapGeo } from "./geometry";
import { MarkGlyph } from "./Glyphs";

/**
 * The ground the fog lies on: the map's own panel, a few drifting terrain
 * lines, the road as a faint dashed track, and the four landmarks as lit
 * medallions. All of it exists from the first frame - the fog only decides
 * what can be SEEN - so clearing a patch reveals detail that was always there
 * rather than conjuring it.
 */

/** Open, wandering terrain lines (never closed rings), across the whole map. */
function contours(W: number, H: number): string[] {
  return [0.16, 0.34, 0.52, 0.7, 0.88].map((f, i) => {
    const y = H * f;
    const a = (i % 2 ? -1 : 1) * H * 0.05;
    return `M -20 ${y} C ${W * 0.2} ${y - a} ${W * 0.35} ${y + a * 1.6} ${W * 0.55} ${y} S ${W * 0.85} ${y - a * 1.4} ${W + 20} ${y + a}`;
  });
}

export default function Terrain({ geo, marks, holding }: { geo: MapGeo; marks: number[]; holding: boolean }) {
  const road = pathOf(segments(geo.stops));
  return (
    <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
      <rect
        x={1}
        y={1}
        width={geo.W - 2}
        height={geo.H - 2}
        rx={28}
        fill={tint("cyan", 3)}
        stroke={tint("cyan", holding ? 26 : 16)}
        strokeWidth={1.5}
        className="duration-700 transition-[stroke]"
      />
      {contours(geo.W, geo.H).map((d, i) => (
        <path key={i} d={d} stroke={tint("cyan", 14)} strokeWidth={1.2} strokeDasharray={i % 2 ? "1 7" : undefined} />
      ))}

      {/* The road, as it always was. */}
      <path d={road} stroke={tint("cyan", 22)} strokeWidth={10} strokeLinecap="round" opacity={0.35} />
      <path d={road} stroke={tint("cyan", 40)} strokeWidth={1.6} strokeDasharray="6 8" strokeLinecap="round" />

      {MARKS.map((m, i) => {
        const p = geo.stops[i + 1];
        const known = marks[i] === 3;
        return (
          <g key={m.key} transform={`translate(${p.x} ${p.y})`}>
            <circle r={44} fill={tint("cyan", known ? 9 : 4)} className="duration-700 transition-[fill]" />
            <circle
              r={30}
              fill={tint("cyan", known ? 16 : 6)}
              stroke={known ? BRAND_VAR.cyan : tint("cyan", 40)}
              strokeWidth={2}
              className="duration-700 transition-[fill,stroke]"
            />
            <motion.g
              style={{ color: BRAND_VAR.cyan }}
              initial={false}
              animate={{ opacity: known ? 1 : 0.6 }}
              transition={{ duration: 0.7 }}
            >
              <g transform="scale(1.45)">
                <MarkGlyph k={m.key} />
              </g>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}
