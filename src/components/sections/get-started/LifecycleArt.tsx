"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import { Clock, Compass, Download, FlaskConical, KeyRound, PenLine, Rocket, RotateCcw, UserCheck } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Draw, Label, Lit, Mark, RunDot, beat, usePlayOnce } from "./lifecycleParts";
import {
  AGENT_LINE, AGENT_Y, APPROVE, AXIS_Y, DAYS, DRAFT, FIRST_RUN, HANDOFF_AT, HANDOFF_D, LAB, LANES, LOOP, MID_Y,
  OVERSEER, RUNS, STEPS, VIEW_H, VIEW_W, WATCH, YOU_Y, dayCenter,
} from "./lifecycleGeometry";

/* The persona lifecycle over one week, in three lanes: you set the agent up on
 * Monday; it runs every morning; the Overseer companion reads its runs and writes a
 * coaching note, the Lab measures the fix, you approve it, and Friday's run is
 * better. Beats in lifecycleGeometry.ts. */

const ICONS = { install: Download, connect: KeyRound, describe: PenLine, promote: Rocket } as const;
const DURATION = 4.2;
const EMERALD = "text-brand-emerald";
const PURPLE = "text-brand-purple";

export default function LifecycleArt() {
  const copy = useTranslation().t.getStartedSection;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  const youLine = useTransform(p, (v) => beat(v, 0.02, 0.24));
  const agentLine = useTransform(p, (v) => beat(v, AGENT_LINE.from, AGENT_LINE.to - AGENT_LINE.from));
  const cyan = BRAND_VAR.cyan;
  const purple = BRAND_VAR.purple;

  return (
    <div
      ref={ref}
      data-stage-art
      className="relative mx-auto mt-8 hidden w-full md:block"
      style={{ "--art-ar": (VIEW_W + 32) / (VIEW_H + 32) } as CSSProperties}
    >
      <div
        data-illustrate-art
        role="img"
        aria-label={copy.artLabel}
        className="relative mx-auto w-full max-w-[1080px] rounded-2xl border border-glass bg-white/[0.02] p-4"
      >
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden fill="none">
          {/* Lanes and days */}
          <rect x={150} y={LANES.you.y0} width={850} height={LANES.you.y1 - LANES.you.y0} rx={14} fill="currentColor" className="text-foreground" fillOpacity={0.03} />
          <rect x={150} y={LANES.improve.y0} width={850} height={LANES.improve.y1 - LANES.improve.y0} rx={14} fill={tint("purple", 6)} />
          <rect x={150} y={LANES.agent.y0} width={850} height={LANES.agent.y1 - LANES.agent.y0} rx={14} fill={tint("emerald", 6)} />
          {DAYS.slice(1).map((d) => (
            <line key={d.key} x1={d.x0} x2={d.x0} y1={LANES.you.y0} y2={LANES.agent.y1} stroke="currentColor" className="text-foreground" strokeOpacity={0.18} strokeDasharray="3 6" />
          ))}
          {DAYS.map((d, i) => (
            <Label key={d.key} x={dayCenter(i)} y={AXIS_Y} size={16} op={0.7}>{copy.days[d.key]}</Label>
          ))}

          {/* Lane names; the agent's trigger sits with its name */}
          <Label x={16} y={YOU_Y + 7} anchor="start" size={20} weight={700}>{copy.lanes.you}</Label>
          <Label x={12} y={MID_Y + 6} anchor="start" size={15} weight={700} tone={PURPLE} op={1}>{copy.lanes.improve}</Label>
          <Label x={16} y={AGENT_Y - 8} anchor="start" size={18} weight={700} tone={EMERALD} op={1}>{copy.lanes.agent}</Label>
          <rect x={14} y={AGENT_Y + 6} width={130} height={30} rx={15} fill={tint("emerald", 12)} stroke={BRAND_VAR.emerald} strokeOpacity={0.6} />
          <Clock x={24} y={AGENT_Y + 13} width={16} height={16} color={BRAND_VAR.emerald} strokeWidth={2.2} />
          <Label x={44} y={AGENT_Y + 27} anchor="start" size={16}>{copy.trigger}</Label>

          {/* Monday: your four set-up steps */}
          <motion.line x1={STEPS[0].x} x2={STEPS[3].x} y1={YOU_Y} y2={YOU_Y} stroke={cyan} strokeWidth={3} strokeOpacity={0.55} style={{ scaleX: youLine, originX: 0, transformBox: "fill-box" }} />
          {STEPS.map((s) => (
            <Lit key={s.key} p={p} at={s.at}>
              <Mark x={s.x} y={YOU_Y} Icon={ICONS[s.key]} brand="cyan" />
              <Label x={s.x} y={s.side === "below" ? YOU_Y + 42 : s.key === "install" ? 26 : 36}>{copy.steps[s.key]}</Label>
              {s.key === "install" && <Label x={s.x} y={47} size={16} weight={500} op={0.8}>{copy.claudeCode}</Label>}
            </Lit>
          ))}

          {/* Draft, hand-off, first run */}
          <Lit p={p} at={DRAFT.at}>
            <line x1={DRAFT.x0} x2={DRAFT.x1} y1={AGENT_Y} y2={AGENT_Y} stroke="currentColor" className="text-foreground" strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="6 6" />
            <circle cx={DRAFT.x0} cy={AGENT_Y} r={7} fill="var(--background)" stroke="currentColor" className="text-foreground" strokeOpacity={0.6} strokeWidth={2} />
          </Lit>
          <Draw p={p} at={HANDOFF_AT} d={HANDOFF_D} color={BRAND_VAR.emerald} width={2.5} />
          <motion.line x1={AGENT_LINE.x0} x2={AGENT_LINE.x1} y1={AGENT_Y} y2={AGENT_Y} stroke={BRAND_VAR.emerald} strokeWidth={3} strokeOpacity={0.5} style={{ scaleX: agentLine, originX: 0, transformBox: "fill-box" }} />
          <Lit p={p} at={FIRST_RUN.at}>
            <RunDot x={FIRST_RUN.x} y={AGENT_Y} />
            <Label x={FIRST_RUN.x} y={AGENT_Y + 38} size={16}>{copy.firstRun}</Label>
          </Lit>

          {/* Every morning a run */}
          {RUNS.map((r) => (
            <Lit key={r.x} p={p} at={r.at} dim={0.25}>
              <RunDot x={r.x} y={AGENT_Y} better={r.better} />
              {r.healed && (
                <>
                  <Label x={r.x} y={AGENT_Y + 36} size={16} weight={500} op={0.8}>{copy.healed.top}</Label>
                  <Label x={r.x} y={AGENT_Y + 54} size={16} weight={500} op={0.8}>{copy.healed.bottom}</Label>
                </>
              )}
              {r.score && (
                <Label x={r.x} y={AGENT_Y + 42} size={17} weight={700} tone={r.better ? EMERALD : "text-foreground"} op={r.better ? 1 : 0.8}>
                  {r.score === "before" ? copy.scoreBefore : copy.scoreAfter}
                </Label>
              )}
            </Lit>
          ))}

          {/* Self-improvement: the Overseer reads the runs, the Lab measures the fix, you approve */}
          {WATCH.map((w) => (
            <Draw key={w.d} p={p} at={w.at} d={w.d} color={purple} dashed width={1.8} />
          ))}
          {LOOP.map((l) => (
            <Draw key={l.d} p={p} at={l.at} d={l.d} color={purple} width={2.4} />
          ))}
          <Lit p={p} at={OVERSEER.at}>
            <Mark x={OVERSEER.x} y={OVERSEER.y} Icon={Compass} brand="purple" />
            <Label x={OVERSEER.x} y={MID_Y - 26}>{copy.overseer}</Label>
            <Label x={(OVERSEER.x + LAB.x) / 2} y={MID_Y - 6} size={14} weight={600} tone={PURPLE} op={1}>{copy.coachingNote}</Label>
          </Lit>
          <Lit p={p} at={LAB.at}>
            <Mark x={LAB.x} y={LAB.y} Icon={FlaskConical} brand="purple" />
            <Label x={LAB.x} y={MID_Y - 26}>{copy.lab}</Label>
            <Label x={LAB.x} y={MID_Y + 38} size={16} weight={600} tone={PURPLE} op={1}>{copy.arena}</Label>
          </Lit>
          <Lit p={p} at={APPROVE.at}>
            <Mark x={APPROVE.x} y={APPROVE.y} Icon={UserCheck} brand="purple" />
            <Label x={APPROVE.x} y={36}>{copy.approve}</Label>
          </Lit>
        </svg>
        <button
          type="button"
          onClick={play}
          disabled={still}
          aria-label={copy.replay}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-glass bg-white/[0.03] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
