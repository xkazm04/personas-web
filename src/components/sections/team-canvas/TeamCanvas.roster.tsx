"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { TeamCanvasShell, ReplayButton, artStyle, after, usePlayOnce } from "./TeamCanvas.shared";
import { Converge, MemberCard, Route, StepChip } from "./TeamCanvas.roster.parts";
import { LANDED_AT, MEMBERS, SPLIT_AT, TALL, WIDE, splitD, type RosterLayout } from "./TeamCanvas.roster.geometry";

/*
 * /illustrate 1.2.0 round 3, variant "roster" (spatial): one goal, matched to
 * part of a team. Sonnet splits the goal into four steps; each step rides to
 * the SDLC Delivery Team member that runs it; Docs Steward and Security
 * Sentinel get nothing; the four busy members converge on Landed.
 * Rests at the finished mission (p = 1) for first paint and reduced motion.
 */

const WORDS = {
  lede: "Type one goal for your agent team. Sonnet splits it into steps and hands each to the member who fits; the rest stay free, and the mission lands when every step is done.",
  artLabel:
    "The goal Add CSV export to Reports goes to Sonnet, which splits it into Scope, Build, Review and Test. They go to Solution Architect, Dev Clone, Code Reviewer and QA Guardian of the SDLC Delivery Team; Docs Steward and Security Sentinel stay idle. The mission lands with the PR merged.",
  goal: ["Add CSV export", "to Reports"],
  splitter: "Sonnet",
  team: "SDLC Delivery Team",
  members: {
    architect: "Solution Architect",
    docs: "Docs Steward",
    dev: "Dev Clone",
    reviewer: "Code Reviewer",
    security: "Security Sentinel",
    qa: "QA Guardian",
  },
  steps: ["Scope", "Build", "Review", "Test"],
  landed: "Landed",
  merged: "PR merged",
} as const;

const DURATION = 5.5;
const AR = WIDE.w / WIDE.h;

function RosterArt({ l, p, className }: { l: RosterLayout; p: MotionValue<number>; className: string }) {
  const split = useTransform(p, (v) => after(v, SPLIT_AT, 0.04));
  const landed = useTransform(p, (v) => after(v, LANDED_AT, 0.04));
  const { goal: g, splitter: s, team: t, landed: d } = l;
  const rows = l.dir === "h" ? WORDS.goal : [WORDS.goal.join(" ")];
  const gy = g.y + g.h / 2 - ((rows.length - 1) * (l.font + 4)) / 2 + l.font * 0.35;
  const ic = l.sub + 2;
  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} aria-hidden fill="none">
      {/* The team: the whole roster the goal is matched against. */}
      <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={16} fill="currentColor" fillOpacity={0.025} stroke="currentColor" strokeOpacity={0.14} className="text-foreground" />
      <text x={l.teamLabel[0]} y={l.teamLabel[1]} textAnchor="middle" fontSize={l.sub} fontWeight={600} letterSpacing={0.4} fill="currentColor" fillOpacity={0.75} className="text-foreground">
        {WORDS.team}
      </text>

      <path d={splitD(l)} stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} className="text-foreground" />
      <motion.path d={splitD(l)} stroke={BRAND_VAR.cyan} strokeWidth={2.5} style={{ opacity: split }} />
      {MEMBERS.map((m, i) => (m.step === null ? null : <Route key={m.key} p={p} l={l} i={i} step={m.step} />))}
      {MEMBERS.map((m, i) => (m.step === null ? null : <Converge key={m.key} p={p} l={l} i={i} />))}

      {/* The goal, as typed. */}
      <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={g.h / 2} fill={tint("purple", 12)} stroke={BRAND_VAR.purple} strokeOpacity={0.6} strokeWidth={1.5} />
      <text textAnchor="middle" fontSize={l.font} fontWeight={600} fill="currentColor" className="text-foreground">
        {rows.map((r, i) => (
          <tspan key={r} x={g.x + g.w / 2} y={gy + i * (l.font + 4)}>
            {i === 0 ? "“" : ""}
            {r}
            {i === rows.length - 1 ? "”" : ""}
          </tspan>
        ))}
      </text>

      {/* Sonnet: decomposes the goal and suggests a member per step. */}
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.h / 2} fill="var(--background)" stroke={BRAND_VAR.cyan} strokeWidth={1.5} />
      <motion.rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.h / 2} fill={tint("cyan", 18)} style={{ opacity: split }} />
      <Sparkles x={s.x + 12} y={s.y + s.h / 2 - ic / 2} width={ic} height={ic} color={BRAND_VAR.cyan} />
      <text x={s.x + 16 + ic} y={s.y + s.h / 2 + l.font * 0.35} fontSize={l.font} fontWeight={600} fill="currentColor" className="text-foreground">
        {WORDS.splitter}
      </text>

      {MEMBERS.map((m, i) => (
        <MemberCard key={m.key} p={p} box={l.cards[i]} l={l} name={WORDS.members[m.key]} tone={m.tone} step={m.step} />
      ))}
      {MEMBERS.map((m, i) => (m.step === null ? null : <StepChip key={m.key} p={p} l={l} i={i} step={m.step} label={WORDS.steps[m.step]} />))}

      {/* Landed: every step done, PR merged. */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={14} fill={tint("emerald", 5)} stroke={BRAND_VAR.emerald} strokeOpacity={0.35} strokeWidth={1.5} />
      <motion.rect x={d.x} y={d.y} width={d.w} height={d.h} rx={14} fill={tint("emerald", 16)} stroke={BRAND_VAR.emerald} strokeWidth={2} style={{ opacity: landed }} />
      <motion.g style={{ opacity: landed }}>
        <circle cx={d.x + 24} cy={d.y + d.h / 2} r={11} fill={BRAND_VAR.emerald} />
        <path d={`M${d.x + 19} ${d.y + d.h / 2} l3.5 3.5 l6 -7`} stroke="var(--background)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <text x={d.x + 44} y={d.y + d.h / 2 - 3} fontSize={l.font + 2} fontWeight={700} fill={BRAND_VAR.emerald}>
        {WORDS.landed}
      </text>
      <text x={d.x + 44} y={d.y + d.h / 2 + l.sub + 3} fontSize={l.sub} fill="currentColor" fillOpacity={0.75} className="text-foreground">
        {WORDS.merged}
      </text>
    </svg>
  );
}

export default function TeamCanvasRoster() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  return (
    <TeamCanvasShell lede={WORDS.lede}>
      <div ref={ref} data-stage-art style={artStyle(AR, 1180, 32, 24)} className="relative mx-auto w-full">
        <div
          data-illustrate-art
          role="img"
          aria-label={WORDS.artLabel}
          className="rounded-2xl border border-glass px-3 py-4 md:px-4 md:py-3"
          style={{ backgroundColor: "rgba(var(--surface-overlay), 0.02)" }}
        >
          <RosterArt l={WIDE} p={p} className="hidden h-auto w-full md:block" />
          <RosterArt l={TALL} p={p} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
        </div>
        <ReplayButton onClick={play} disabled={still} />
      </div>
    </TeamCanvasShell>
  );
}
