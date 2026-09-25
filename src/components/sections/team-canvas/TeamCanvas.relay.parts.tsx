"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { PHASES, arrowD, type Box, type NodeKey, type RelayLayout, type StepState } from "./TeamCanvas.relay.geometry";
import { after, within } from "./TeamCanvas.shared";

/* Drawn pieces of the "relay" variant: a step card whose status dot follows the
 * app's step vocabulary (hollow = Pending, blue = Running, green check = Done,
 * red cross = the QA bounce), the goal card and the Landed card. */

const TONE: Record<StepState, BrandKey> = { run: "blue", done: "emerald", fail: "rose" };
const STATES: StepState[] = ["run", "done", "fail"];

const stateOp = (p: number, k: NodeKey, s: StepState) =>
  Math.max(0, ...PHASES[k].filter((ph) => ph[2] === s).map(([a, b]) => within(p, a, b)));

function StateLayer({ p, k, s, box }: { p: MotionValue<number>; k: NodeKey; s: StepState; box: Box }) {
  const op = useTransform(p, (v) => stateOp(v, k, s));
  const cx = box.x + 20;
  const cy = box.y + box.h / 2;
  const c = BRAND_VAR[TONE[s]];
  return (
    <motion.g style={{ opacity: op }}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill={tint(TONE[s], 9)} stroke={c} strokeOpacity={0.65} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={9} fill={c} />
      {s === "done" && <path d={`M${cx - 4} ${cy} l3 3 l5 -6`} stroke="var(--background)" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {s === "fail" && <path d={`M${cx - 3.5} ${cy - 3.5} l7 7 M${cx + 3.5} ${cy - 3.5} l-7 7`} stroke="var(--background)" strokeWidth={2.2} strokeLinecap="round" />}
    </motion.g>
  );
}

export function StepCard({ p, k, l, title, persona }: { p: MotionValue<number>; k: NodeKey; l: RelayLayout; title: string; persona: string }) {
  const box = l.nodes[k];
  const cy = box.y + box.h / 2;
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill="var(--background)" stroke="currentColor" strokeOpacity={0.2} className="text-foreground" />
      <circle cx={box.x + 20} cy={cy} r={8} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="3 3" className="text-foreground" />
      {STATES.map((s) => (
        <StateLayer key={s} p={p} k={k} s={s} box={box} />
      ))}
      <text x={box.x + 36} y={cy - 4} fontSize={l.title} fontWeight={600} fill="currentColor" className="text-foreground">
        {title}
      </text>
      <text x={box.x + 36} y={cy + l.sub + 2} fontSize={l.sub} fill="currentColor" fillOpacity={0.75} className="text-foreground">
        {persona}
      </text>
    </g>
  );
}

export function GoalCard({ l, lines }: { l: RelayLayout; lines: readonly string[] }) {
  const b = l.goal;
  const rows = l.dir === "h" ? lines : [lines.join(" ")];
  const top = b.y + b.h / 2 - ((rows.length - 1) * (l.title + 4)) / 2 + l.title * 0.35;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} fill={tint("purple", 12)} stroke={BRAND_VAR.purple} strokeOpacity={0.6} strokeWidth={1.5} />
      <text textAnchor="middle" fontSize={l.title - 1} fontWeight={600} fill="currentColor" className="text-foreground">
        {rows.map((r, i) => (
          <tspan key={r} x={b.x + b.w / 2} y={top + i * (l.title + 4)}>
            {i === 0 ? "“" : ""}
            {r}
            {i === rows.length - 1 ? "”" : ""}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export function LandedCard({ p, l, at, label, sub }: { p: MotionValue<number>; l: RelayLayout; at: number; label: string; sub: string }) {
  const b = l.landed;
  const lit = useTransform(p, (v) => after(v, at));
  const cx = b.x + 24;
  const cy = b.y + b.h / 2;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={14} fill={tint("emerald", 5)} stroke={BRAND_VAR.emerald} strokeOpacity={0.35} strokeWidth={1.5} />
      <motion.rect x={b.x} y={b.y} width={b.w} height={b.h} rx={14} fill={tint("emerald", 16)} stroke={BRAND_VAR.emerald} strokeWidth={2} style={{ opacity: lit }} />
      <motion.g style={{ opacity: lit }}>
        <circle cx={cx} cy={cy} r={11} fill={BRAND_VAR.emerald} />
        <path d={`M${cx - 5} ${cy} l3.5 3.5 l6 -7`} stroke="var(--background)" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <text x={b.x + 44} y={cy - 3} fontSize={l.title + 1} fontWeight={700} fill={BRAND_VAR.emerald}>
        {label}
      </text>
      <text x={b.x + 44} y={cy + l.sub + 3} fontSize={l.sub} fill="currentColor" fillOpacity={0.75} className="text-foreground">
        {sub}
      </text>
    </g>
  );
}

export function Edge({ p, d, at, end, dir }: { p: MotionValue<number>; d: string; at: number; end: [number, number]; dir: "h" | "v" }) {
  const lit = useTransform(p, (v) => after(v, at, 0.02));
  const head = arrowD(end, dir === "h" ? "right" : "down", 5);
  return (
    <g>
      <path d={d} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} className="text-foreground" />
      <path d={head} fill="currentColor" fillOpacity={0.4} className="text-foreground" />
      <motion.g style={{ opacity: lit }}>
        <path d={d} fill="none" stroke={BRAND_VAR.cyan} strokeWidth={2.5} />
        <path d={head} fill={BRAND_VAR.cyan} />
      </motion.g>
    </g>
  );
}
