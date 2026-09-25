"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import { Clock, Download, FlaskConical, KeyRound, PenLine, Rocket } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { GetStartedIntro, ReplayButton, beat, usePlayOnce } from "./GetStarted.shared";
import { DigestChip, Label, Lit, RunDot, StepMark } from "./GetStarted.handoff.parts";
import HandoffPhone from "./GetStarted.handoff.phone";
import {
  AGENT_LINE, AGENT_Y, AXIS_Y, DAYS, DRAFT, FIRST_RUN, HANDOFF_AT, HANDOFF_D, LAB, LANE_BOTTOM, LANE_TOP,
  RUNS, STEPS, VIEW_H, VIEW_W, YOU_Y, dayCenter,
} from "./GetStarted.handoff.geometry";

/* /illustrate r3 variant "handoff" (mechanism): two lanes over a week. You do four
 * things on Monday; from then on the agent runs every morning and hands you the
 * digest; you step in once, in the Lab. Beats in GetStarted.handoff.geometry.ts. */

const WORDS = {
  lede:
    "You do four things once: install Personas, connect your apps, describe the agent, then test and promote it. After that it runs on its own schedule on your computer, and you come back only to improve it.",
  artLabel:
    "A week in two lanes. On Monday you install Personas with Claude Code signed in, connect Gmail and Slack, describe the agent, then test and promote it; it runs once. From Tuesday to Friday the agent runs daily at 08:00 and posts a digest to Slack, and on Wednesday you make version 2 active in the Lab.",
  replay: "Replay the animation",
  you: "You",
  agent: "Your agent",
  trigger: "Daily 08:00",
  days: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" },
  steps: { install: "Install Personas", connect: "Connect Gmail, Slack", describe: "Describe the agent", promote: "Test & promote" },
  claudeCode: "Claude Code signed in",
  draft: "Draft",
  firstRun: "First run",
  digest: "Digest in Slack",
  lab: "Lab: v2 active",
  v2: "v2",
} as const;

const ICONS = { install: Download, connect: KeyRound, describe: PenLine, promote: Rocket } as const;
const DURATION = 3.4;

export default function GetStartedHandoff() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  const youLine = useTransform(p, (v) => beat(v, 0.02, 0.28));
  const handoff = useTransform(p, (v) => beat(v, HANDOFF_AT, 0.08));
  const agentLine = useTransform(p, (v) => beat(v, AGENT_LINE.from, AGENT_LINE.to - AGENT_LINE.from));

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <GetStartedIntro lede={WORDS.lede} />
      <div data-stage-slot>
        <div
          ref={ref}
          data-stage-art
          className="relative mx-auto mt-8 hidden w-full md:block"
          style={{ "--art-ar": (VIEW_W + 32) / (VIEW_H + 32) } as CSSProperties}
        >
          <div
            data-illustrate-art
            role="img"
            aria-label={WORDS.artLabel}
            className="relative mx-auto w-full max-w-[1060px] rounded-2xl border border-glass bg-white/[0.02] p-4"
          >
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden fill="none">
              {/* Lanes and days */}
              <rect x={150} y={LANE_TOP} width={850} height={156} rx={14} fill="currentColor" className="text-foreground" fillOpacity={0.03} />
              <rect x={150} y={206} width={850} height={LANE_BOTTOM - 206} rx={14} fill={tint("emerald", 6)} />
              {DAYS.slice(1).map((d) => (
                <line key={d.key} x1={d.x0} x2={d.x0} y1={LANE_TOP} y2={LANE_BOTTOM} stroke="currentColor" className="text-foreground" strokeOpacity={0.2} strokeDasharray="3 6" />
              ))}
              {DAYS.map((d, i) => (
                <Label key={d.key} x={dayCenter(i)} y={AXIS_Y + 8} size={16} weight={600} fillOpacity={0.7}>
                  {WORDS.days[d.key]}
                </Label>
              ))}

              {/* Lane names; the agent's trigger sits with its name */}
              <Label x={16} y={YOU_Y + 7} anchor="start" size={20} weight={700}>{WORDS.you}</Label>
              <Label x={16} y={AGENT_Y - 8} anchor="start" size={18} weight={700} tone="text-brand-emerald" fillOpacity={1}>
                {WORDS.agent}
              </Label>
              <rect x={14} y={AGENT_Y + 6} width={130} height={30} rx={15} fill={tint("emerald", 12)} stroke={BRAND_VAR.emerald} strokeOpacity={0.6} />
              <Clock x={24} y={AGENT_Y + 13} width={16} height={16} color={BRAND_VAR.emerald} strokeWidth={2.2} />
              <Label x={46} y={AGENT_Y + 26} anchor="start" size={15} weight={600}>{WORDS.trigger}</Label>

              {/* Monday: your four steps */}
              <motion.line x1={STEPS[0].x} x2={STEPS[3].x} y1={YOU_Y} y2={YOU_Y} stroke={BRAND_VAR.cyan} strokeWidth={3} strokeOpacity={0.55} style={{ scaleX: youLine, originX: 0, transformBox: "fill-box" }} />
              {STEPS.map((s) => (
                <Lit key={s.key} p={p} at={s.at}>
                  <StepMark x={s.x} Icon={ICONS[s.key]} />
                  <Label x={s.x} y={s.side === "above" ? (s.key === "install" ? 40 : 52) : YOU_Y + 46}>{WORDS.steps[s.key]}</Label>
                  {s.key === "install" && (
                    <Label x={s.x} y={61} size={15} weight={500} fillOpacity={0.75}>{WORDS.claudeCode}</Label>
                  )}
                </Lit>
              ))}

              {/* The draft exists from "describe" until promote */}
              <Lit p={p} at={DRAFT.at}>
                <line x1={DRAFT.x0} x2={DRAFT.x1} y1={AGENT_Y} y2={AGENT_Y} stroke="currentColor" className="text-foreground" strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="6 6" />
                <circle cx={DRAFT.x0} cy={AGENT_Y} r={7} fill="var(--background)" stroke="currentColor" className="text-foreground" strokeOpacity={0.6} strokeWidth={2} />
                <Label x={(DRAFT.x0 + DRAFT.x1) / 2} y={AGENT_Y + 36} size={15} weight={500} fillOpacity={0.75}>{WORDS.draft}</Label>
              </Lit>

              {/* Hand-off: promote puts the agent live, and it runs once */}
              <motion.path d={HANDOFF_D} stroke={BRAND_VAR.emerald} strokeWidth={2.5} strokeLinecap="round" style={{ pathLength: handoff }} />
              <motion.line x1={AGENT_LINE.x0} x2={AGENT_LINE.x1} y1={AGENT_Y} y2={AGENT_Y} stroke={BRAND_VAR.emerald} strokeWidth={3} strokeOpacity={0.5} style={{ scaleX: agentLine, originX: 0, transformBox: "fill-box" }} />
              <Lit p={p} at={FIRST_RUN.at}>
                <RunDot x={FIRST_RUN.x} brand="emerald" />
                <Label x={FIRST_RUN.x} y={AGENT_Y + 38} size={16}>{WORDS.firstRun}</Label>
              </Lit>

              {/* Every morning: a run, and a digest handed to you */}
              {RUNS.map((r, i) => (
                <Lit key={r.x} p={p} at={r.at} dim={0.22}>
                  <DigestChip x={r.x} />
                  <RunDot x={r.x} brand={r.v2 ? "purple" : "emerald"} />
                  {r.v2 && (
                    <Label x={r.x + 22} y={AGENT_Y + 6} anchor="start" size={15} weight={700} tone="text-brand-purple" fillOpacity={1}>
                      {WORDS.v2}
                    </Label>
                  )}
                  {i === 0 && <Label x={r.x} y={52} size={16}>{WORDS.digest}</Label>}
                </Lit>
              ))}

              {/* You step in once: a better version goes live */}
              <Lit p={p} at={LAB.at}>
                <circle cx={LAB.x} cy={LAB.y} r={16} fill={tint("purple", 18)} stroke={BRAND_VAR.purple} strokeWidth={2} />
                <FlaskConical x={LAB.x - 9} y={LAB.y - 9} width={18} height={18} color={BRAND_VAR.purple} strokeWidth={2.2} />
                <Label x={LAB.x + 24} y={LAB.y + 6} anchor="start" size={16} tone="text-brand-purple" fillOpacity={1}>{WORDS.lab}</Label>
              </Lit>
            </svg>
            <ReplayButton onClick={play} disabled={still} label={WORDS.replay} />
          </div>
        </div>
        <HandoffPhone w={WORDS} />
      </div>
    </SectionWrapper>
  );
}

export type HandoffWords = typeof WORDS;
