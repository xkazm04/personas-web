"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { TeamCanvasShell, ReplayButton, artStyle, after, usePlayOnce } from "./TeamCanvas.shared";
import { Edge, GoalCard, LandedCard, StepCard } from "./TeamCanvas.relay.parts";
import { LANDED_AT, LOOP_AT, ROUND_AT, TALL, WIDE, arrowD, edges, type NodeKey, type RelayLayout } from "./TeamCanvas.relay.geometry";

/*
 * /illustrate 1.2.0 round 3, variant "relay" (mechanism): one mission's step
 * graph. Scope, then Build PR, then Review and Test PR at the same time; QA
 * Guardian requests changes, the loop runs back to Dev Clone's step, QA's step
 * shows "round 2", and the mission lands. Beats: TeamCanvas.relay.geometry.ts.
 * Rests at the finished mission (p = 1) for first paint and reduced motion.
 */

const WORDS = {
  lede: "Give your agent team one goal. Personas splits it into steps, runs independent ones side by side, and when QA Guardian sends a PR back, Dev Clone fixes it before the mission lands.",
  artLabel:
    "The goal Add CSV export to Reports runs as steps: Solution Architect scopes, Dev Clone builds the PR, Code Reviewer and QA Guardian work in parallel, QA requests changes once, Dev Clone fixes it in round 2, and the mission lands with the PR merged.",
  goal: ["Add CSV export", "to Reports"],
  steps: {
    scope: { title: "Scope", persona: "Solution Architect" },
    build: { title: "Build PR", persona: "Dev Clone" },
    review: { title: "Review", persona: "Code Reviewer" },
    test: { title: "Test PR", persona: "QA Guardian" },
  },
  parallel: "in parallel",
  loop: ["changes", "requested"],
  round: "round 2",
  landed: "Landed",
  merged: "PR merged",
} as const;

const DURATION = 6;
const AR = WIDE.w / WIDE.h;
const KEYS: NodeKey[] = ["scope", "build", "review", "test"];

function RelayArt({ l, p, className }: { l: RelayLayout; p: MotionValue<number>; className: string }) {
  const loopLit = useTransform(p, (v) => after(v, LOOP_AT, 0.03));
  const badge = useTransform(p, (v) => after(v, ROUND_AT, 0.03));
  const badgeScale = useTransform(badge, (v) => 0.6 + 0.4 * v);
  const [bx, by] = l.badge;
  const amber = BRAND_VAR.amber;
  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} aria-hidden fill="none">
      {edges(l).map((e, i) => (
        <Edge key={i} p={p} d={e.d} at={e.at} end={e.end} dir={l.dir} />
      ))}

      {/* The QA fix loop: Test PR back to Build PR. Drawn at rest, lit on the bounce. */}
      <path d={l.loop} stroke={amber} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="5 6" />
      <path d={arrowD(l.loopArrow.at, l.loopArrow.dir, 5)} fill={amber} fillOpacity={0.5} />
      <motion.g style={{ opacity: loopLit }}>
        <path d={l.loop} stroke={amber} strokeWidth={2.5} strokeDasharray="5 6" />
        <path d={arrowD(l.loopArrow.at, l.loopArrow.dir, 5)} fill={amber} />
      </motion.g>
      <text x={l.loopLabel.x} y={l.loopLabel.y} textAnchor="middle" fontSize={l.sub} fontWeight={600} fill={amber}>
        {l.loopLabel.lines === 1 ? (
          WORDS.loop.join(" ")
        ) : (
          WORDS.loop.map((w, i) => (
            <tspan key={w} x={l.loopLabel.x} dy={i === 0 ? 0 : l.sub + 3}>
              {w}
            </tspan>
          ))
        )}
      </text>

      <text x={l.parallel[0]} y={l.parallel[1]} textAnchor="middle" fontSize={l.sub} fontWeight={500} fill="currentColor" fillOpacity={0.75} className="text-foreground">
        {WORDS.parallel}
      </text>

      <GoalCard l={l} lines={WORDS.goal} />
      {KEYS.map((k) => (
        <StepCard key={k} p={p} k={k} l={l} title={WORDS.steps[k].title} persona={WORDS.steps[k].persona} />
      ))}
      <LandedCard p={p} l={l} at={LANDED_AT} label={WORDS.landed} sub={WORDS.merged} />

      {/* The app's rework badge on QA's step: "round {n}". */}
      <motion.g style={{ opacity: badge, scale: badgeScale, transformBox: "fill-box", originX: 0.5, originY: 0.5 }}>
        <rect x={bx} y={by} width={68} height={24} rx={7} fill="var(--background)" />
        <rect x={bx} y={by} width={68} height={24} rx={7} fill={tint("amber", 16)} stroke={amber} strokeOpacity={0.6} />
        <text x={bx + 34} y={by + 16.5} textAnchor="middle" fontSize={13} fontWeight={600} fill={amber}>
          {WORDS.round}
        </text>
      </motion.g>
    </svg>
  );
}

export default function TeamCanvasRelay() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  return (
    <TeamCanvasShell lede={WORDS.lede}>
      <div ref={ref} data-stage-art style={artStyle(AR, 1180, 48, 40)} className="relative mx-auto w-full">
        <div
          data-illustrate-art
          role="img"
          aria-label={WORDS.artLabel}
          className="rounded-2xl border border-glass px-3 py-4 md:px-6 md:py-5"
          style={{ backgroundColor: "rgba(var(--surface-overlay), 0.02)" }}
        >
          <RelayArt l={WIDE} p={p} className="hidden h-auto w-full md:block" />
          <RelayArt l={TALL} p={p} className="mx-auto block h-auto w-full max-w-sm md:hidden" />
        </div>
        <ReplayButton onClick={play} disabled={still} />
      </div>
    </TeamCanvasShell>
  );
}
