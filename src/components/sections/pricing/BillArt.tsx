"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Bot, Sparkles, SquareTerminal, Wallet } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { beat, pathD, type BillLayout } from "./billGeometry";
import { BeatCaption, Coin, Legend, Node, RunDot, WorkPulse } from "./BillParts";
import type { PricingSectionCopy } from "@/i18n/pending/pricingSection";

/*
 * Who you pay for one agent run (owner's pick from /illustrate round 3, "bill").
 * The run goes Personas -> Claude Code CLI -> Claude; the only payment line runs
 * from your Claude Pro or Max plan to Anthropic, around the box that holds
 * Personas. Facts (desktop app): engine_kind.rs (Claude Code CLI is the only
 * engine), cli_process.rs (runs on your subscription, API-key env stripped),
 * LICENSE (MIT). The round's per-run API-price chip was dropped on the owner's
 * call: the only thing paid is the user's Claude plan.
 */

type Words = PricingSectionCopy;

export default function BillArt({ l, p, w, className }: { l: BillLayout; p: MotionValue<number>; w: Words; className: string }) {
  const lit = useTransform(p, (v) => 0.25 + 0.75 * beat(v, 0, 0.3));
  const paid = useTransform(p, (v) => 0.35 + 0.65 * beat(v, 0.7, 0.92));
  const tagGlow = useTransform(p, (v) => 0.4 + 0.6 * beat(v, 0.9, 1));
  const { machine: m, cloud: c, tag } = l;
  const [endX, endY] = l.money[l.money.length - 1];
  const claudeCentre: [number, number] = [l.claude.x + l.claude.w / 2, l.claude.y + l.claude.h / 2];

  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} aria-hidden="true">
      {/* Your computer: dashed frame; Anthropic: solid frame outside it. */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={22} fill={tint("cyan", 4)} stroke={BRAND_VAR.cyan} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="8 7" />
      <motion.rect x={c.x} y={c.y} width={c.w} height={c.h} rx={22} fill={tint("amber", 6)} stroke={BRAND_VAR.amber} strokeWidth={2} style={{ strokeOpacity: paid }} />
      <Legend at={l.machineLegend.at} anchor={l.machineLegend.anchor} text={w.computer} />
      <Legend at={l.cloudLegend} text={w.anthropic} brand="amber" />

      {/* The run's lane, drawn under the nodes. */}
      <path d={pathD(l.lane)} stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={3} strokeDasharray="4 8" fill="none" />
      <motion.path d={pathD(l.lane)} stroke={BRAND_VAR.cyan} strokeWidth={3} fill="none" style={{ opacity: lit }} />

      <Node box={l.personas} icon={Bot} label={w.personas} brand="cyan" font={l.font} />
      <Node box={l.cli} icon={SquareTerminal} label={w.cli} brand="purple" font={l.font * 0.95} />
      <Node box={l.claude} icon={Sparkles} label={w.claude} brand="amber" font={l.font} />
      <WorkPulse at={claudeCentre} p={p} />
      <RunDot lane={l.lane} p={p} />

      {/* What Personas costs: the tag on the app itself. */}
      <motion.g style={{ opacity: tagGlow }}>
        <rect x={tag.x} y={tag.y} width={tag.w} height={tag.h} rx={tag.h / 2} fill={tint("emerald", 18)} stroke={BRAND_VAR.emerald} strokeWidth={1.5} />
      </motion.g>
      <text x={tag.x + tag.w / 2} y={tag.y + tag.h / 2 + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill={BRAND_VAR.emerald}>
        {w.tag}
      </text>

      {/* The one payment: your plan to Anthropic, never through Personas. */}
      <motion.path d={pathD(l.money)} stroke={BRAND_VAR.amber} strokeWidth={3} fill="none" strokeLinejoin="round" style={{ opacity: paid }} />
      <path d={`M${endX - 9} ${endY + 12} L${endX} ${endY} L${endX + 9} ${endY + 12}`} stroke={BRAND_VAR.amber} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Wallet x={l.wallet[0]} y={l.wallet[1]} width={36} height={36} color={BRAND_VAR.amber} strokeWidth={2} />
      <text x={l.planLabel[0]} y={l.planLabel[1]} fontSize={l.font} fontWeight={600} fill="var(--foreground)">
        {w.plan}
      </text>
      <Coin money={l.money} p={p} />

      {/* Step axis: the mechanism as four numbered beats. */}
      {w.beats.map((b, i) => (
        <BeatCaption key={b} at={l.beats[i]} index={i} text={b} p={p} font={l.font} />
      ))}
    </svg>
  );
}
