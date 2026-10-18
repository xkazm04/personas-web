"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { EVAL_DIMENSIONS } from "../../data";
import { beat } from "./motion";

/*
 * The assay cell: one lobe per scored dimension. It starts as the ancestor's
 * membrane and each lobe swells, in turn, to the strain's score (driven by
 * `p`, 0-1), leaving the ancestor behind as a dashed ghost. Radii read on a
 * 50-100 scale, marked by the 60/80/100 reticle rings.
 */

const C = 200;
const N = EVAL_DIMENSIONS.length;
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Score -> radius on the 50-100 scale the reticle labels. */
const rad = (v: number) => 30 + ((v - 50) / 50) * 110;
const angle = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;
const pt = (a: number, r: number) => ({ x: C + Math.cos(a) * r, y: C + Math.sin(a) * r });

/** A closed lobed outline through each lobe tip and the waist between tips. */
function lobes(values: readonly number[]): string {
  const pts: { x: number; y: number }[] = [];
  values.forEach((v, i) => {
    const next = values[(i + 1) % N];
    pts.push(pt(angle(i), rad(v)));
    pts.push(pt(angle(i) + Math.PI / N, 0.78 * Math.min(rad(v), rad(next))));
  });
  const n = pts.length;
  let d = `M${r2(pts[0].x)} ${r2(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${r2(c1.x)} ${r2(c1.y)} ${r2(c2.x)} ${r2(c2.y)} ${r2(p2.x)} ${r2(p2.y)}`;
  }
  return `${d} Z`;
}

const GHOST = lobes(EVAL_DIMENSIONS.map((d) => d.baseline));
/** Lobe `i` swells during its own slice of the play. */
const swell = (v: number, i: number) => beat(v, 0.08 + i * 0.12, 0.3 + i * 0.12);
const valuesAt = (v: number) => EVAL_DIMENSIONS.map((d, i) => d.baseline + (d.score - d.baseline) * swell(v, i));

function Tip({ i, p }: { i: number; p: MotionValue<number> }) {
  const x = useTransform(p, (v) => r2(pt(angle(i), rad(valuesAt(v)[i])).x));
  const y = useTransform(p, (v) => r2(pt(angle(i), rad(valuesAt(v)[i])).y));
  return (
    <motion.g style={{ x, y }}>
      <circle r={9} fill={tint("emerald", 25)} />
      <circle r={4} fill={BRAND_VAR.emerald} />
    </motion.g>
  );
}

export default function EvalMembrane({ p, running, labelSize }: { p: MotionValue<number>; running: boolean; labelSize: number }) {
  const words = labSectionCopy.eval;
  const d = useTransform(p, (v) => lobes(valuesAt(v)));
  return (
    <svg viewBox="-34 -6 468 412" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
      {[60, 80, 100].map((v) => (
        <g key={v}>
          <circle cx={C} cy={C} r={rad(v)} stroke="var(--foreground)" strokeOpacity={0.14} strokeDasharray={v === 100 ? undefined : "2 5"} />
          <text x={C + 4} y={r2(C - rad(v) + 13)} fill="var(--foreground)" fillOpacity={0.6} fontSize={labelSize * 0.8} fontFamily="var(--font-mono)">
            {v}
          </text>
        </g>
      ))}
      {EVAL_DIMENSIONS.map((dim, i) => {
        const end = pt(angle(i), rad(100) + 4);
        const label = pt(angle(i), rad(100) + 26);
        return (
          <g key={dim.key}>
            <line x1={C} y1={C} x2={r2(end.x)} y2={r2(end.y)} stroke="var(--foreground)" strokeOpacity={0.1} />
            <text x={r2(label.x)} y={r2(label.y + labelSize / 3)} textAnchor="middle" fill="var(--foreground)" fillOpacity={0.85} fontSize={labelSize} fontFamily="var(--font-mono)">
              {words.dimensions[dim.key]}
            </text>
          </g>
        );
      })}
      <path d={GHOST} stroke="var(--foreground)" strokeOpacity={0.55} strokeWidth={1.4} strokeDasharray="5 5" fill="var(--foreground)" fillOpacity={0.04} />
      <motion.g
        initial={false}
        animate={running ? { scale: [1, 1.018, 1] } : { scale: 1 }}
        transition={running ? { duration: 4.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
      >
        <motion.path d={d} fill={tint("emerald", 22)} stroke={BRAND_VAR.emerald} strokeWidth={2.4} strokeLinejoin="round" />
        <circle cx={C} cy={C} r={22} fill={tint("purple", 16)} stroke={BRAND_VAR.purple} strokeWidth={1.6} />
        <circle cx={C} cy={C} r={8} fill={BRAND_VAR.purple} fillOpacity={0.7} />
      </motion.g>
      {EVAL_DIMENSIONS.map((dim, i) => (
        <Tip key={dim.key} i={i} p={p} />
      ))}
    </svg>
  );
}
