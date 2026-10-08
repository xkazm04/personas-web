"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Bolt, ClockFace } from "./shared/glyphs";
import { C, DAY, H, R, RUNS, SETUP, W, band, degOf, polar } from "./dialGeometry";

/* The drawn dial of V3: your day as an outer band (night in purple), the cyan
 * sliver of setup at 09:00, the hour ticks, the agent's ring with its runs, and
 * the hand. A run flares as the hand passes it. */

const FG = "var(--foreground)";
const EM = BRAND_VAR.emerald;
const [SX, SY] = polar(degOf((SETUP.from + SETUP.to) / 2), R.dayOut + 6);

function RunMark({ i, hour }: { i: number; hour: MotionValue<number> }) {
  const run = RUNS[i];
  const [x, y] = polar(degOf(run.h), R.agent);
  const near = useTransform(hour, (h) => {
    const d = Math.abs((((h - run.h) % 24) + 36) % 24 - 12);
    return Math.max(0, 1 - d / 1.1);
  });
  const r = useTransform(near, (n) => 20 + n * 18);
  const op = useTransform(near, (n) => n * 0.6);
  const c = run.trigger === "schedule" ? BRAND_VAR.amber : BRAND_VAR.cyan;
  return (
    <g>
      <motion.circle cx={x} cy={y} r={r} fill={tint("emerald", 30)} style={{ opacity: op }} />
      <circle cx={x} cy={y} r={19} fill="var(--background)" stroke={EM} strokeWidth={2.4} />
      {run.trigger === "schedule" ? <ClockFace x={x} y={y} s={22} c={c} w={2} /> : <Bolt x={x} y={y} s={22} c={c} w={1.8} />}
    </g>
  );
}

export default function Dial({ hour, day, label }: { hour: MotionValue<number>; day: number; label: string }) {
  const tip = useTransform(hour, (h) => polar(degOf(h), R.dayOut + 4));
  const tx = useTransform(tip, (t) => t[0]);
  const ty = useTransform(tip, (t) => t[1]);
  const bx = useTransform(hour, (h) => polar(degOf(h), 124)[0]);
  const by = useTransform(hour, (h) => polar(degOf(h), 124)[1]);
  const ticks = Array.from({ length: 24 }, (_, h) => h);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
      <defs>
        <radialGradient id="gs3-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={BRAND_VAR.amber} stopOpacity={0.16} />
          <stop offset="1" stopColor={BRAND_VAR.amber} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="gs3-night" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={BRAND_VAR.purple} stopOpacity={0.18} />
          <stop offset="1" stopColor={BRAND_VAR.purple} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="gs3-face" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={EM} stopOpacity={0.1} />
          <stop offset="1" stopColor={EM} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={C.x} cy={C.y - 220} rx={380} ry={150} fill="url(#gs3-sun)" />
      <ellipse cx={C.x} cy={C.y + 180} rx={380} ry={136} fill="url(#gs3-night)" />
      <circle cx={C.x} cy={C.y} r={R.dayOut + 18} fill={FG} fillOpacity={0.025} stroke={FG} strokeOpacity={0.1} />
      <circle cx={C.x} cy={C.y} r={R.agent + 30} fill="url(#gs3-face)" />

      {/* Your day */}
      <path d={band(0, 23.999)} fill={FG} fillOpacity={0.05} />
      {DAY.map((d) => (
        <path key={d.key} d={band(d.from, d.to)} fill={d.night ? tint("purple", 22) : FG} fillOpacity={d.night ? 1 : 0.16} stroke="var(--background)" strokeWidth={2} />
      ))}
      <g style={{ opacity: day === 1 ? 1 : 0.6 }}>
        <path d={band(SETUP.from - 0.08, SETUP.to + 0.08, R.dayIn - 8, R.dayOut + 8)} fill={BRAND_VAR.cyan} />
        <path d={`M${SX} ${SY} Q${SX - 50} ${SY - 4} 318 ${SY - 6}`} stroke={BRAND_VAR.cyan} strokeWidth={2} strokeDasharray="3 5" />
      </g>

      {/* Hours */}
      {ticks.map((h) => {
        const [x1, y1] = polar(degOf(h), R.tickIn - (h % 6 === 0 ? 6 : 0));
        const [x2, y2] = polar(degOf(h), R.tickOut);
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={FG} strokeOpacity={h % 6 === 0 ? 0.5 : 0.22} strokeWidth={h % 6 === 0 ? 2.4 : 1.5} />;
      })}
      <circle cx={C.x} cy={C.y - 132} r={10} fill={BRAND_VAR.amber} fillOpacity={0.85} />
      <path d={`M${C.x + 6} ${C.y + 122} a12 12 0 1 1 -10 -18 a9 9 0 0 0 10 18 Z`} fill={BRAND_VAR.purple} fillOpacity={0.85} />

      {/* The agent's day */}
      <circle cx={C.x} cy={C.y} r={R.agent} stroke={EM} strokeOpacity={0.55} strokeWidth={3} />
      <circle cx={C.x} cy={C.y} r={R.agent} stroke={EM} strokeWidth={1.4} strokeDasharray="2 9" />
      {RUNS.map((r, i) => (
        <RunMark key={r.key} i={i} hour={hour} />
      ))}

      {/* The hand */}
      <motion.line x1={bx} y1={by} x2={tx} y2={ty} stroke={FG} strokeOpacity={0.75} strokeWidth={2.6} strokeLinecap="round" />
      <motion.circle cx={bx} cy={by} r={4} fill={FG} />
      <motion.circle cx={tx} cy={ty} r={7} fill={FG} />
    </svg>
  );
}
