"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat } from "../useOnAir";
import type { Attribute } from "./stats";

const R = 100;
const RINGS = [0.25, 0.5, 0.75, 1];

function point(i: number, n: number, r: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
}

const shape = (values: readonly number[]) =>
  values.map((v, i) => {
    const [x, y] = point(i, values.length, (v / 100) * R);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

/**
 * The hex stat chart: the player's six attributes over the baseline's dashed
 * hex. Switching the scouted version morphs the shape (same point count).
 * Decorative twin of the attribute rows, which carry the numbers.
 */
export default function HexChart({ attributes, moving }: { attributes: Attribute[]; moving: boolean }) {
  const n = attributes.length;
  return (
    <svg aria-hidden viewBox="-112 -112 224 224" className="h-full max-h-full w-full text-foreground">
      {RINGS.map((f) => (
        <path
          key={f}
          d={shape(attributes.map(() => f * 100))}
          fill="none"
          stroke="currentColor"
          strokeOpacity={f === 1 ? 0.3 : 0.12}
        />
      ))}
      {attributes.map((a, i) => {
        const [x, y] = point(i, n, R);
        return <line key={a.key} x1={0} y1={0} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.12} />;
      })}
      <path d={shape(attributes.map((a) => a.baseline))} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="4 4" />
      <motion.path
        fill={tint("emerald", 26)}
        stroke={BRAND_VAR.emerald}
        strokeWidth={2.5}
        strokeLinejoin="round"
        initial={moving ? { d: shape(attributes.map(() => 0)), opacity: 0 } : false}
        animate={{ d: shape(attributes.map((a) => a.score)), opacity: 1 }}
        transition={beat(moving, 0.8, 0.2)}
      />
    </svg>
  );
}
