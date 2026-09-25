"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Bot, Sparkles, SquareTerminal, Wallet } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import PricingShell, { usePlayOnce } from "./pricingShell";
import { TALL, WIDE, beat, pathD, type BillLayout } from "./Pricing.bill.geometry";
import { BeatCaption, Coin, Legend, Node, RunDot, WorkPulse } from "./Pricing.bill.parts";

/*
 * /illustrate r3 pricing variant "bill" (mechanism): who you pay for one agent run.
 * The run goes Personas -> Claude Code CLI -> Claude; the only payment line runs
 * from your Claude Pro or Max plan to Anthropic, around the box that holds
 * Personas. Facts: engine_kind.rs (Claude Code CLI only), cli_process.rs (runs on
 * your subscription, API keys stripped), CostBreakdownBar.tsx ("included on your
 * Claude subscription"), LICENSE (MIT).
 */

const WORDS = {
  lede: "The app, its MIT source and every feature cost nothing, with no account or licence key. Your agents run through Claude Code on your own Claude Pro or Max plan, so the only bill is Anthropic's.",
  artLabel:
    "An agent run leaves Personas on your computer, passes the Claude Code CLI and reaches Claude at Anthropic. Personas is tagged $0 with an MIT licence; the only payment line runs from your Claude Pro or Max plan to Anthropic, and the run comes back showing its API price as included in your plan.",
  computer: "Your computer",
  tag: "$0, MIT licence",
  personas: "Personas",
  cli: "Claude Code CLI",
  anthropic: "Anthropic",
  claude: "Claude",
  chipPrice: "≈$0.42 at API prices",
  chipIncluded: "included in your plan",
  plan: "Your Claude Pro or Max plan",
  beats: ["Run starts", "On your plan", "Claude works", "Cost shown, not billed"],
} as const;

const DURATION = 4.2;

function BillArt({ l, p, className }: { l: BillLayout; p: MotionValue<number>; className: string }) {
  const lit = useTransform(p, (v) => 0.25 + 0.75 * beat(v, 0, 0.3));
  const chip = useTransform(p, (v) => beat(v, 0.6, 0.7));
  const chipY = useTransform(chip, (v) => 8 * (1 - v));
  const paid = useTransform(p, (v) => 0.35 + 0.65 * beat(v, 0.7, 0.92));
  const tagGlow = useTransform(p, (v) => 0.4 + 0.6 * beat(v, 0.9, 1));
  const { machine: m, cloud: c, tag, chip: ch } = l;
  const [endX, endY] = l.money[l.money.length - 1];
  const claudeCentre: [number, number] = [l.claude.x + l.claude.w / 2, l.claude.y + l.claude.h / 2];

  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} aria-hidden="true">
      {/* Your computer: dashed frame; Anthropic: solid frame outside it. */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={22} fill={tint("cyan", 4)} stroke={BRAND_VAR.cyan} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="8 7" />
      <motion.rect x={c.x} y={c.y} width={c.w} height={c.h} rx={22} fill={tint("amber", 6)} stroke={BRAND_VAR.amber} strokeWidth={2} style={{ strokeOpacity: paid }} />
      <Legend at={l.machineLegend.at} anchor={l.machineLegend.anchor} text={WORDS.computer} />
      <Legend at={l.cloudLegend} text={WORDS.anthropic} brand="amber" />

      {/* The run's lane, drawn under the nodes. */}
      <path d={pathD(l.lane)} stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={3} strokeDasharray="4 8" fill="none" />
      <motion.path d={pathD(l.lane)} stroke={BRAND_VAR.cyan} strokeWidth={3} fill="none" style={{ opacity: lit }} />

      <Node box={l.personas} icon={Bot} label={WORDS.personas} brand="cyan" font={l.font} />
      <Node box={l.cli} icon={SquareTerminal} label={WORDS.cli} brand="purple" font={l.font * 0.95} />
      <Node box={l.claude} icon={Sparkles} label={WORDS.claude} brand="amber" font={l.font} />
      <WorkPulse at={claudeCentre} p={p} />
      <RunDot lane={l.lane} p={p} />

      {/* What Personas costs: the tag on the app itself. */}
      <motion.g style={{ opacity: tagGlow }}>
        <rect x={tag.x} y={tag.y} width={tag.w} height={tag.h} rx={tag.h / 2} fill={tint("emerald", 18)} stroke={BRAND_VAR.emerald} strokeWidth={1.5} />
      </motion.g>
      <text x={tag.x + tag.w / 2} y={tag.y + tag.h / 2 + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill={BRAND_VAR.emerald}>
        {WORDS.tag}
      </text>

      {/* What the run cost: the app's own reframe of the API price. */}
      <motion.g style={{ opacity: chip, y: chipY }}>
        <rect x={ch.x} y={ch.y} width={ch.w} height={ch.h} rx={12} fill="var(--background)" fillOpacity={0.7} stroke="var(--foreground)" strokeOpacity={0.2} />
        <text x={ch.x + 16} y={ch.y + 25} fontSize={16} fontWeight={600} fill="var(--foreground)" fillOpacity={0.9} className="font-mono">
          {WORDS.chipPrice}
        </text>
        <text x={ch.x + 16} y={ch.y + 49} fontSize={16} fontWeight={600} fill={BRAND_VAR.emerald}>
          {WORDS.chipIncluded}
        </text>
      </motion.g>

      {/* The one payment: your plan to Anthropic, never through Personas. */}
      <motion.path d={pathD(l.money)} stroke={BRAND_VAR.amber} strokeWidth={3} fill="none" strokeLinejoin="round" style={{ opacity: paid }} />
      <path d={`M${endX - 9} ${endY + 12} L${endX} ${endY} L${endX + 9} ${endY + 12}`} stroke={BRAND_VAR.amber} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Wallet x={l.wallet[0]} y={l.wallet[1]} width={36} height={36} color={BRAND_VAR.amber} strokeWidth={2} />
      <text x={l.planLabel[0]} y={l.planLabel[1]} fontSize={l.font} fontWeight={600} fill="var(--foreground)">
        {WORDS.plan}
      </text>
      <Coin money={l.money} p={p} />

      {/* Step axis: the mechanism as four numbered beats. */}
      {WORDS.beats.map((b, i) => (
        <BeatCaption key={b} at={l.beats[i]} index={i} text={b} p={p} font={l.font} />
      ))}
    </svg>
  );
}

export default function PricingBill() {
  const { ref, p, replay, still } = usePlayOnce(DURATION);
  return (
    <PricingShell lede={WORDS.lede} artRef={ref} artLabel={WORDS.artLabel} aspect={WIDE.w / WIDE.h} maxWidth={1000} onReplay={replay} still={still}>
      <div className="rounded-2xl border border-glass bg-white/[0.02]">
        <BillArt l={WIDE} p={p} className="hidden h-auto w-full md:block" />
        <BillArt l={TALL} p={p} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
      </div>
    </PricingShell>
  );
}
