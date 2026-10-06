"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";
import { frame, useTimelineCopy } from "../shared/Frame";
import { BG, CYAN, FG, mix, seg } from "../shared/motion";
import { H, LANES, TIMING, W, XS, raceMs } from "./data";
import LaneArt from "./LaneArt";
import LaneText from "./LaneText";

/* The race board for one scenario (mounted per scenario, so every transform
 * closes over that scenario's timing): the customer's request on the left
 * forks into two lanes that start together; the rules lane breaks, the agent
 * lane reaches its flag. */

export const LEAD = 450;
const { place, fs } = frame(W, H);
const CARD_Y = 186;

function Fork({ rail, t }: { rail: number; t: MotionValue<number> }) {
  const d = `M 262 ${CARD_Y + 74} C 292 ${CARD_Y + 74}, 286 ${rail}, ${XS - 10} ${rail}`;
  const pathLength = useTransform(t, (v) => seg(v, -LEAD, -40));
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={mix(FG, 18)} strokeWidth={2} strokeDasharray="2 7" />
      <motion.path d={d} stroke={CYAN} strokeWidth={2.5} style={{ pathLength }} />
    </g>
  );
}

export default function Board({ index, p }: { index: number; p: MotionValue<number> }) {
  const c = useTimelineCopy();
  const sc = c.scenarios[index];
  const timing = TIMING[index];
  const t = useTransform(p, (v) => -LEAD + v * (raceMs(index) + LEAD));
  const lanes = [
    { kind: "rules" as const, timing: timing.rules, name: c.v1.rulesLane, steps: sc.rules.slice(0, -1), stamp: sc.rules.at(-1), badge: c.v1.stuck, result: sc.rulesResult },
    { kind: "agent" as const, timing: timing.agent, name: c.v1.agentLane, steps: sc.agent, stamp: undefined, badge: c.v1.resolved, result: sc.agentResult },
  ];

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={c.v1.artLabel}>
        <defs>
          <filter id="tl1-blur" x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <linearGradient id="tl1-sheen" x1="0" x2="1">
            <stop offset="0" stopColor={FG} stopOpacity="0" />
            <stop offset="0.5" stopColor={FG} stopOpacity="0.28" />
            <stop offset="1" stopColor={FG} stopOpacity="0" />
          </linearGradient>
          <pattern id="tl1-check" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill={BG} />
            <rect width="6" height="6" fill={FG} fillOpacity="0.8" />
            <rect x="6" y="6" width="6" height="6" fill={FG} fillOpacity="0.8" />
          </pattern>
          <radialGradient id="tl1-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.12" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={W / 2 + 120} cy={H / 2} rx={560} ry={250} fill="url(#tl1-glow)" />
        {LANES.map((l) => (
          <Fork key={l.rail} rail={l.rail} t={t} />
        ))}
        {lanes.map((l, i) => (
          <LaneArt key={l.kind} kind={l.kind} timing={l.timing} top={LANES[i].top} rail={LANES[i].rail} t={t} />
        ))}
      </svg>

      <div className="rounded-2xl border border-glass bg-background/80 p-4 shadow-lg backdrop-blur" style={place(4, CARD_Y, 256)}>
        <p className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-[0.12em] text-brand-cyan" style={fs(13, 12)}>
          <MessageSquareQuote className="h-[1.2em] w-[1.2em]" aria-hidden />
          {c.v1.request}
        </p>
        <p className="font-medium leading-snug text-foreground" style={fs(18, 15)}>
          {sc.trigger}
        </p>
      </div>
      {lanes.map((l, i) => (
        <LaneText key={l.kind} {...l} top={LANES[i].top} rail={LANES[i].rail} t={t} />
      ))}
    </motion.div>
  );
}

export function RaceCount({ index, total }: { index: number; total: number }) {
  const c = useTimelineCopy();
  return (
    <span className="absolute font-mono uppercase tracking-[0.14em] text-muted-dark" style={{ ...place(6, 150), ...fs(13, 12) }}>
      {c.v1.raceOf.replace("{n}", String(index + 1)).replace("{total}", String(total))}
    </span>
  );
}

