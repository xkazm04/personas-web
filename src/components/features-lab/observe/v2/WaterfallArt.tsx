"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { AXIS_Y, BAR, H, PANEL, ROWS_Y, W, barScale, rowH, type Run, type Step } from "./runs";
import { stepColor } from "./look";

/* The drawn trace of V2: the panel, the seconds axis, each step's ghost bar
 * (the whole skeleton is always visible) filled in as the playhead passes, the
 * retry hop from a failed step, and the lit playhead itself. */

const FG = "var(--foreground)";

function Bar({ st, i, run, t, focused }: { st: Step; i: number; run: Run; t: MotionValue<number>; focused: boolean }) {
  const k = barScale(run);
  const rh = rowH(run);
  const x = BAR.x0 + st.at * k;
  const w = Math.max(10, st.dur * k);
  const y = ROWS_Y + i * rh + (rh - BAR.h) / 2;
  const fill = useTransform(t, (v) => Math.min(1, Math.max(0, (v * run.total - st.at) / st.dur)) * w);
  const c = stepColor(st);
  return (
    <g>
      {focused && <rect x={0} y={ROWS_Y + i * rh} width={PANEL.w} height={rh} fill={tint("cyan", 8)} />}
      <rect x={x} y={y} width={w} height={BAR.h} rx={6} fill={c} fillOpacity={0.08} stroke={c} strokeOpacity={focused ? 0.9 : 0.35} strokeDasharray={focused ? undefined : "3 4"} strokeWidth={focused ? 1.6 : 1} />
      <motion.rect x={x} y={y} width={fill} height={BAR.h} rx={6} fill={c} fillOpacity={0.75} />
      {st.status === "failed" && <rect x={x} y={y} width={w} height={BAR.h} rx={6} fill="url(#ob2-hatch)" />}
    </g>
  );
}

function RetryHop({ run, t }: { run: Run; t: MotionValue<number> }) {
  const fi = run.steps.findIndex((s) => s.status === "failed");
  const ri = run.steps.findIndex((s) => s.kind === "retry");
  const k = barScale(run);
  const rh = rowH(run);
  const f = run.steps[fi];
  const r = run.steps[ri];
  const opacity = useTransform(t, (v) => (f && r && v * run.total >= r.at ? 1 : 0));
  if (!f || !r) return null;
  const x1 = BAR.x0 + (f.at + f.dur) * k;
  const y1 = ROWS_Y + fi * rh + rh / 2;
  const x2 = BAR.x0 + r.at * k;
  const y2 = ROWS_Y + ri * rh + rh / 2;
  return (
    <motion.g style={{ opacity }}>
      <path d={`M${x1 + 2} ${y1} C${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2 - 4} ${y2}`} stroke={BRAND_VAR.emerald} strokeWidth={2} strokeDasharray="4 4" />
      <path d={`M${x2 - 11} ${y2 - 5} L${x2 - 3} ${y2} L${x2 - 11} ${y2 + 5}`} stroke={BRAND_VAR.emerald} strokeWidth={2} strokeLinecap="round" />
    </motion.g>
  );
}

export default function WaterfallArt({ run, t, focus, label }: { run: Run; t: MotionValue<number>; focus: number; label: string }) {
  const k = barScale(run);
  const head = useTransform(t, (v) => BAR.x0 + v * run.total * k);
  const ticks = Array.from({ length: Math.floor(run.total) + 1 }, (_, s) => s).filter((s) => run.total < 5 || s % 2 === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none">
      <defs>
        <pattern id="ob2-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--background)" strokeOpacity={0.45} strokeWidth={2.5} />
        </pattern>
        <linearGradient id="ob2-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND_VAR.cyan} stopOpacity={0.08} />
          <stop offset="0.25" stopColor={FG} stopOpacity={0.02} />
          <stop offset="1" stopColor={FG} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={20} fill="var(--background)" fillOpacity={0.88} stroke={BRAND_VAR.cyan} strokeOpacity={0.35} />
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={20} fill="url(#ob2-sheen)" />
      <line x1={PANEL.x} x2={PANEL.x + PANEL.w} y1={AXIS_Y - 14} y2={AXIS_Y - 14} stroke={FG} strokeOpacity={0.08} />
      {ticks.map((s) => (
        <line key={s} x1={BAR.x0 + s * k} x2={BAR.x0 + s * k} y1={AXIS_Y + 8} y2={H - 12} stroke={FG} strokeOpacity={0.08} strokeDasharray="2 6" />
      ))}
      {run.steps.map((st, i) => (
        <Bar key={`${run.id}-${st.key}`} st={st} i={i} run={run} t={t} focused={i === focus} />
      ))}
      <RetryHop key={run.id} run={run} t={t} />
      <motion.line x1={head} x2={head} y1={AXIS_Y + 8} y2={H - 10} stroke={BRAND_VAR.cyan} strokeWidth={2} />
    </svg>
  );
}
