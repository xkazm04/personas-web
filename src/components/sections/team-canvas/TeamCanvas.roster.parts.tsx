"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { after, clamp01 } from "./TeamCanvas.shared";
import { CHIPS_AT, CONVERGE_AT, DONE_AT, TRAVEL, convergeD, cubicAt, routeD, routeOf, type Box, type RosterLayout } from "./TeamCanvas.roster.geometry";

/* Drawn pieces of the "roster" variant: a member card (lit when its step
 * arrives, checked when it finishes, dim when the goal needs nothing from it),
 * a step chip that rides its route, and the route and converge lines. */

const ease = (t: number) => 1 - (1 - t) * (1 - t);

export function MemberCard({ p, box, l, name, tone, step }: { p: MotionValue<number>; box: Box; l: RosterLayout; name: string; tone: BrandKey; step: number | null }) {
  const busy = step !== null;
  const lit = useTransform(p, (v) => (busy ? after(v, TRAVEL[step][1], 0.03) : 0));
  const done = useTransform(p, (v) => (busy ? after(v, DONE_AT[step], 0.03) : 0));
  const cy = box.y + box.h / 2;
  const dotX = l.dir === "h" ? box.x + 18 : box.x + l.nameX - 16;
  const cx = box.x + box.w - 20;
  return (
    <g opacity={busy ? 1 : 0.6}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={10} fill="var(--background)" stroke="currentColor" strokeOpacity={0.2} className="text-foreground" strokeDasharray={busy ? undefined : "4 4"} />
      <motion.rect x={box.x} y={box.y} width={box.w} height={box.h} rx={10} fill={tint(tone, 12)} stroke={BRAND_VAR[tone]} strokeOpacity={0.7} strokeWidth={1.5} style={{ opacity: lit }} />
      <circle cx={dotX} cy={cy} r={5} fill={BRAND_VAR[tone]} opacity={busy ? 1 : 0.5} />
      <text x={box.x + l.nameX} y={cy + l.font * 0.35} fontSize={l.font} fontWeight={busy ? 600 : 500} fill="currentColor" className="text-foreground">
        {name}
      </text>
      {busy && (
        <motion.g style={{ opacity: done }}>
          <circle cx={cx} cy={cy} r={9} fill={BRAND_VAR.emerald} />
          <path d={`M${cx - 4} ${cy} l3 3 l5 -6`} stroke="var(--background)" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      )}
    </g>
  );
}

export function Route({ p, l, i, step }: { p: MotionValue<number>; l: RosterLayout; i: number; step: number }) {
  const d = routeD(l, i);
  const lit = useTransform(p, (v) => clamp01((v - TRAVEL[step][0]) / 0.04));
  return (
    <g strokeLinejoin="round">
      <path d={d} stroke="currentColor" strokeOpacity={0.28} strokeWidth={2} className="text-foreground" />
      <motion.path d={d} stroke={BRAND_VAR.cyan} strokeWidth={2.5} style={{ opacity: lit }} />
    </g>
  );
}

export function Converge({ p, l, i }: { p: MotionValue<number>; l: RosterLayout; i: number }) {
  const d = convergeD(l, i);
  const lit = useTransform(p, (v) => after(v, CONVERGE_AT, 0.04));
  return (
    <g strokeLinejoin="round">
      <path d={d} stroke="currentColor" strokeOpacity={0.22} strokeWidth={2} className="text-foreground" />
      <motion.path d={d} stroke={BRAND_VAR.emerald} strokeWidth={2.5} style={{ opacity: lit }} />
    </g>
  );
}

export function StepChip({ p, l, i, step, label }: { p: MotionValue<number>; l: RosterLayout; i: number; step: number; label: string }) {
  const c = routeOf(l, i);
  const [a, b] = TRAVEL[step];
  // Desktop: the chip rides its route. Phone: it appears on its card when it arrives.
  const ride = l.dir === "h";
  const t = (v: number) => (ride ? ease(clamp01((v - a) / (b - a))) * l.chipT : 1);
  const x = useTransform(p, (v) => cubicAt(c, t(v))[0]);
  const y = useTransform(p, (v) => cubicAt(c, t(v))[1]);
  const opacity = useTransform(p, (v) => (ride ? after(v, CHIPS_AT + step * 0.015, 0.03) : after(v, b - 0.04, 0.04)));
  const w = label.length * l.sub * 0.6 + 22;
  return (
    <motion.g style={{ x, y, opacity }}>
      <rect x={-w / 2} y={-13} width={w} height={26} rx={13} fill="var(--background)" />
      <rect x={-w / 2} y={-13} width={w} height={26} rx={13} fill={tint("cyan", 16)} stroke={BRAND_VAR.cyan} strokeOpacity={0.8} />
      <text y={l.sub * 0.36} textAnchor="middle" fontSize={l.sub} fontWeight={600} fill="currentColor" className="text-foreground">
        {label}
      </text>
    </motion.g>
  );
}
