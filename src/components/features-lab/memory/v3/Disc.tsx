"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat, clamp01 } from "../shared/motion";
import { CategoryGlyph, catColor, catTint, type CategoryKey } from "../shared/categories";
import { C, H, RINGS, RUNS, SEEDS, STUMBLES, W, crossXY, fracAt, headAt, ringR, seedXY, type Seed } from "./rings";

/* The drawn disc of V3: one ring per run, drawn in turn from the centre out.
 * Seeds are the memories each run left; when a later ring passes a seed, a
 * short recall line lights between them. */

const FG = "var(--foreground)";
/** Rounded so the server's and the browser's floating point agree on hydration. */
const r2 = (n: number) => Math.round(n * 100) / 100;
const ringColor = (k: number) =>
  k < 3 ? FG : `color-mix(in srgb, ${BRAND_VAR.emerald} ${Math.round(((k - 3) / (RUNS - 4)) * 100)}%, ${BRAND_VAR.cyan})`;

function RingPath({ k, p }: { k: number; p: MotionValue<number> }) {
  const pathLength = useTransform(p, (v) => clamp01(v - k));
  const opacity = useTransform(p, (v) => (v > k ? 1 : 0));
  return (
    <motion.path
      d={RINGS[k].d}
      stroke={ringColor(k)}
      strokeOpacity={k < 3 ? 0.5 : 0.55 + 0.045 * k}
      strokeWidth={1.8 + k * 0.14}
      strokeLinejoin="round"
      style={{ pathLength, opacity }}
    />
  );
}

function Stumble({ s, d, p }: { s: Seed; d: string; p: MotionValue<number> }) {
  const at = s.ring + fracAt(s.ring, s.at);
  const opacity = useTransform(p, (v) => 0.9 * beat(v, at - 0.02, at + 0.03));
  return <motion.path d={d} stroke={BRAND_VAR.rose} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity }} />;
}

/** Recall line strength: up as a later ring's head passes the seed. */
function recallOf(s: Seed, v: number) {
  const k = Math.floor(v);
  if (k <= s.ring || k >= RUNS) return { k, a: 0 };
  const d = v - k - fracAt(k, s.at);
  return { k, a: d > 0 && d < 0.09 ? Math.sin((d / 0.09) * Math.PI) : 0 };
}

function SeedMark({ s, p, sel }: { s: Seed; p: MotionValue<number>; sel: CategoryKey | null }) {
  const c = catColor(s.k);
  const { x: sx, y: sy } = seedXY(s);
  const x = r2(sx);
  const y = r2(sy);
  const born = useTransform(p, (v) => beat(v, s.ring + fracAt(s.ring, s.at), s.ring + fracAt(s.ring, s.at) + 0.06));
  const scale = useTransform(born, (b) => 0.3 + 0.7 * b);
  const lit = useTransform(p, (v) => recallOf(s, v).a);
  const x2 = useTransform(p, (v) => r2(crossXY(s, Math.min(RUNS - 1, Math.max(s.ring, recallOf(s, v).k))).x));
  const y2 = useTransform(p, (v) => r2(crossXY(s, Math.min(RUNS - 1, Math.max(s.ring, recallOf(s, v).k))).y));
  const halo = useTransform(lit, (a) => 0.2 + 0.6 * a);
  const picked = sel === s.k;
  const dim = sel !== null && !picked;
  return (
    <g opacity={dim ? 0.3 : 1}>
      <motion.line x1={x} y1={y} x2={x2} y2={y2} stroke={c} strokeWidth={2.5} strokeLinecap="round" style={{ opacity: lit }} />
      <motion.g style={{ opacity: born, scale, x, y }}>
        <motion.circle r={picked ? 26 : 21} fill={catTint(s.k, 30)} style={{ opacity: halo }} />
        {picked && <circle r={22} stroke={c} strokeWidth={1.5} strokeDasharray="2 4" />}
        <circle r={14} fill="var(--background)" />
        <circle r={14} fill={catTint(s.k, 22)} stroke={c} strokeWidth={2} />
        <CategoryGlyph k={s.k} size={16} width={1.8} />
      </motion.g>
    </g>
  );
}

function Head({ p }: { p: MotionValue<number> }) {
  const at = (v: number) => {
    const k = Math.min(RUNS - 1, Math.floor(v));
    return headAt(k, v - k);
  };
  const x = useTransform(p, (v) => r2(at(v).x));
  const y = useTransform(p, (v) => r2(at(v).y));
  const opacity = useTransform(p, (v) => (v > 0 && v < RUNS ? 1 : 0));
  return (
    <motion.g style={{ x, y, opacity }}>
      <circle r={18} fill="url(#mem3-head)" />
      <circle r={5} fill={BRAND_VAR.cyan} />
    </motion.g>
  );
}

/** Leader lines from the left-hand labels to the first ring and the last. */
export const CALLOUTS = [
  { ring: 0, at: 4.75, label: { x: 24, y: 430 } },
  { ring: RUNS - 1, at: 5.3, label: { x: 24, y: 112 } },
];

function Callouts() {
  return (
    <g stroke={FG} strokeOpacity={0.35} strokeWidth={1.2}>
      {CALLOUTS.map(({ ring, at, label }) => {
        const end = crossXY({ k: "fact", ring, at }, ring);
        const sx = label.x + 130;
        const sy = label.y + 14;
        return (
          <g key={ring}>
            <path d={`M${sx} ${sy} L${r2((sx + end.x) / 2)} ${sy} L${r2(end.x)} ${r2(end.y)}`} strokeDasharray="2 5" />
            <circle cx={r2(end.x)} cy={r2(end.y)} r={3.5} fill={FG} fillOpacity={0.6} stroke="none" />
          </g>
        );
      })}
    </g>
  );
}

export default function Disc({ p, sel }: { p: MotionValue<number>; sel: CategoryKey | null }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
      <defs>
        <radialGradient id="mem3-glow">
          <stop offset="0%" stopColor={BRAND_VAR.purple} stopOpacity={0.16} />
          <stop offset="60%" stopColor={BRAND_VAR.cyan} stopOpacity={0.06} />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="mem3-head">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0.6} />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={C.x} cy={C.y} r={ringR(RUNS - 1) + 40} fill="url(#mem3-glow)" />
      <circle cx={C.x} cy={C.y} r={ringR(RUNS - 1) + 22} stroke={FG} strokeOpacity={0.08} strokeDasharray="2 7" />
      <circle cx={C.x} cy={C.y} r={ringR(0) - 14} fill={FG} fillOpacity={0.04} stroke={tint("purple", 40)} />
      {RINGS.map((_, k) => (
        <RingPath key={k} k={k} p={p} />
      ))}
      {STUMBLES.map(({ seed, d }, i) => (
        <Stumble key={i} s={seed} d={d} p={p} />
      ))}
      {SEEDS.map((s, i) => (
        <SeedMark key={i} s={s} p={p} sel={sel} />
      ))}
      <Callouts />
      <Head p={p} />
    </svg>
  );
}
