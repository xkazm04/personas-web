"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CategoryGlyph, catColor, catTint } from "../shared/categories";
import { H, PH, PLATE, TIERS, TIER_BRAND, TIER_Y, TOKENS, W, rowAnchor, runAt, tokenAt, type Tier, type Token } from "./schedule";

/* The drawn half of V2: four isometric plates (the memory layers) and the
 * memories that sit on them, beam into each run and move between layers. */

const FG = "var(--foreground)";
const { cx, a, b, depth } = PLATE;

function Plate({ tier }: { tier: Tier }) {
  const y = TIER_Y[tier];
  const key = TIER_BRAND[tier];
  const c = BRAND_VAR[key];
  const top = `M${cx - a} ${y} L${cx} ${y - b} L${cx + a} ${y} L${cx} ${y + b} Z`;
  const left = `M${cx - a} ${y} L${cx} ${y + b} L${cx} ${y + b + depth} L${cx - a} ${y + depth} Z`;
  const right = `M${cx + a} ${y} L${cx} ${y + b} L${cx} ${y + b + depth} L${cx + a} ${y + depth} Z`;
  return (
    <g>
      <ellipse cx={cx} cy={y + 8} rx={a * 0.9} ry={b * 1.1} fill={tint(key, tier === "core" ? 14 : 7)} />
      <path d={left} fill={tint(key, 22)} />
      <path d={right} fill={tint(key, 14)} />
      <path d={top} fill={`url(#mem2-plate-${tier})`} stroke={tint(key, 55)} strokeWidth={1.5} />
      <path d={`M${cx - a + 30} ${y} L${cx} ${y - b + 7.2} L${cx + a - 30} ${y}`} stroke={c} strokeOpacity={0.35} strokeWidth={1} />
    </g>
  );
}

/** Recall strength of a token in the current run: up in the recall phase. */
function recallOf(t: Token, p: number) {
  const { k, f } = runAt(p);
  const at = tokenAt(t, k - 1);
  if (!at.shown || !at.tier || at.tier === "archive") return 0;
  const [s, e] = PH.recall;
  if (f < s || f > e + 0.12) return 0;
  return Math.sin((Math.min(f, e + 0.12) / (e + 0.12)) * Math.PI);
}

function TokenMark({ t, p }: { t: Token; p: MotionValue<number> }) {
  const c = catColor(t.k);
  const x = useTransform(p, (v) => tokenAt(t, v).x);
  const y = useTransform(p, (v) => tokenAt(t, v).y);
  const shown = useTransform(p, (v) => tokenAt(t, v).shown);
  const dim = useTransform(p, (v) => (tokenAt(t, v).tier === "archive" ? 0.45 : 1));
  const recall = useTransform(p, (v) => recallOf(t, v));
  const glow = useTransform(recall, (r) => 0.15 + 0.6 * r);
  const beam = useTransform(p, (v) => {
    const { k } = runAt(v);
    const at = tokenAt(t, v);
    const to = rowAnchor(k);
    const sx = at.x;
    const sy = at.y - 24;
    return `M${sx} ${sy} C${sx + 140} ${sy - 30} ${to.x - 120} ${to.y} ${to.x - 6} ${to.y}`;
  });
  const beamO = useTransform(recall, (r) => 0.7 * r);
  return (
    <g>
      <motion.path d={beam} stroke={c} strokeWidth={1.8} strokeDasharray="3 6" strokeLinecap="round" style={{ opacity: beamO }} />
      <motion.g style={{ x, y, opacity: shown }}>
        <motion.g style={{ opacity: dim }}>
          <ellipse cx={0} cy={2} rx={17} ry={5} fill={FG} fillOpacity={0.14} />
          <line x1={0} x2={0} y1={0} y2={-8} stroke={c} strokeOpacity={0.6} strokeWidth={1.5} />
          <motion.circle cy={-24} r={30} fill={catTint(t.k, 28)} style={{ opacity: glow }} />
          <rect x={-17} y={-41} width={34} height={34} rx={10} fill="var(--background)" />
          <rect x={-17} y={-41} width={34} height={34} rx={10} fill={catTint(t.k, 18)} stroke={c} strokeWidth={2} />
          <CategoryGlyph k={t.k} y={-24} size={20} width={2} />
        </motion.g>
      </motion.g>
    </g>
  );
}

export default function Stack({ p }: { p: MotionValue<number> }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
      <defs>
        {TIERS.map((tier) => (
          <linearGradient key={tier} id={`mem2-plate-${tier}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={BRAND_VAR[TIER_BRAND[tier]]} stopOpacity={tier === "core" ? 0.26 : 0.16} />
            <stop offset="100%" stopColor={BRAND_VAR[TIER_BRAND[tier]]} stopOpacity={0.04} />
          </linearGradient>
        ))}
      </defs>
      {/* The spine the layers hang on */}
      <line x1={cx} x2={cx} y1={TIER_Y.core} y2={TIER_Y.archive + b} stroke={FG} strokeOpacity={0.12} strokeDasharray="2 6" />
      {TIERS.map((tier) => (
        <Plate key={tier} tier={tier} />
      ))}
      {TOKENS.map((t, i) => (
        <TokenMark key={i} t={t} p={p} />
      ))}
    </svg>
  );
}
