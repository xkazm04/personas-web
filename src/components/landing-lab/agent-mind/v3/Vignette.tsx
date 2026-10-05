"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { NodeStatus } from "@/components/sections/playground-split/types";
import type { ToolNode } from "@/components/sections/playground-split/types";
import { TOOL_BRAND } from "../shared/beats";
import { DRAWINGS, INK_SCALE, SPOTS, TILE, toolOffsets, type Stroke } from "./art";

const PENCIL = "color-mix(in srgb, var(--foreground) 30%, transparent)";
const INK = "var(--foreground)";
const KEYS = ["parse", "select", "tools", "execute", "verify", "result"] as const;

function Strokes({ strokes, on, brand, reduced, offset = 0 }: { strokes: Stroke[]; on: boolean; brand: BrandKey; reduced: boolean; offset?: number }) {
  return (
    <>
      {strokes.map((s, i) => (
        <path key={`p${i}`} d={s.d} fill="none" stroke={PENCIL} strokeWidth={1.4} strokeDasharray="2 5" strokeLinecap="round" />
      ))}
      {strokes.map((s, i) => (
        <motion.path
          key={`i${i}`}
          d={s.d}
          stroke={s.accent ? BRAND_VAR[brand] : INK}
          strokeWidth={s.accent ? 3.2 : 2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0, fill: s.fill && on ? tint(brand, 55) : "rgba(0,0,0,0)" }}
          transition={reduced ? { duration: 0 } : { duration: 0.75, delay: on ? offset + i * 0.11 : 0, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/**
 * One beat of the inked mind. Until the agent reaches it, it is a pencil
 * sketch; when the beat runs, the pen draws it stroke by stroke and a wash
 * of the beat's colour blooms behind it - progress expressed in the drawing
 * itself. The beat under attention is drawn a size larger.
 */
export default function Vignette({
  beat,
  status,
  focused,
  brand,
  tools,
  reduced,
  ids,
}: {
  beat: number;
  status: NodeStatus;
  focused: boolean;
  brand: BrandKey;
  tools: ToolNode[];
  reduced: boolean;
  ids: { wash: string; rough: string };
}) {
  const spot = SPOTS[beat];
  const on = status !== "pending";
  const key = KEYS[beat];
  return (
    <g transform={`translate(${spot.x} ${spot.y}) scale(${INK_SCALE})`}>
      <motion.g
        initial={false}
        animate={{ scale: focused ? 1.14 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18 }}
      >
        {key !== "tools" && <circle r={64} fill="var(--am3-paper)" />}
        <motion.ellipse
          rx={key === "tools" ? 120 : 66}
          ry={56}
          fill={tint(brand, 26)}
          filter={`url(#${ids.wash})`}
          initial={false}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
        />
        <g filter={`url(#${ids.rough})`}>
          {key === "tools"
            ? toolOffsets(tools.length).map((o, i) => {
                const tb = TOOL_BRAND[i % TOOL_BRAND.length];
                const Icon = tools[i]?.icon;
                return (
                  <g key={i} transform={`translate(${o.x} ${o.y})`}>
                    <path d={TILE} fill="var(--am3-paper)" />
                    <Strokes strokes={[{ d: TILE }]} on={on} brand={tb} reduced={reduced} offset={i * 0.25} />
                    {Icon && (
                      <motion.g initial={false} animate={{ opacity: on ? 1 : 0.35 }} transition={{ duration: reduced ? 0 : 0.5, delay: on && !reduced ? 0.4 + i * 0.25 : 0 }}>
                        <Icon x={-16} y={-16} width={32} height={32} strokeWidth={1.75} color={on ? BRAND_VAR[tb] : PENCIL} />
                      </motion.g>
                    )}
                  </g>
                );
              })
            : <Strokes strokes={DRAWINGS[key]} on={on} brand={brand} reduced={reduced} />}
        </g>
      </motion.g>
    </g>
  );
}
