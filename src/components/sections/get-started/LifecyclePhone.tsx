"use client";

import { Clock, Compass, Download, FlaskConical, KeyRound, PenLine, Rocket, UserCheck, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Label, Mark, RunDot } from "./lifecycleParts";

/* Below md: the same week turned on its side - time runs down; you on the left, the
 * Overseer and the Lab in the middle, the agent on the right. Resolved state only
 * (viewBox 360 x 760). */

const YOU_X = 30;
const MID_X = 204;
const AGENT_X = 300;
const STEP_Y = [130, 200, 270, 340];
const BANDS = [80, 408, 496, 584, 672, 760];
const RUN_Y = [452, 540, 628, 716];
const ICONS: LucideIcon[] = [Download, KeyRound, PenLine, Rocket];
const PURPLE = "text-brand-purple";

export default function LifecyclePhone() {
  const c = useTranslation().t.getStartedSection;
  const steps = [c.steps.install, c.steps.connect, c.steps.describe, c.steps.promote];
  const days = [c.days.mon, c.days.tue, c.days.wed, c.days.thu, c.days.fri];
  const purple = BRAND_VAR.purple;
  const emerald = BRAND_VAR.emerald;
  const overseerY = RUN_Y[1];
  const labY = RUN_Y[2];
  const approveY = BANDS[4];
  return (
    <div data-illustrate-art role="img" aria-label={c.artLabel} className="mx-auto mt-8 w-full max-w-sm rounded-2xl border border-glass bg-white/[0.02] p-2 md:hidden">
      <svg viewBox="0 0 360 780" className="block h-auto w-full" aria-hidden fill="none">
        <rect x={6} y={BANDS[0]} width={150} height={BANDS[5] - BANDS[0]} rx={12} fill="currentColor" className="text-foreground" fillOpacity={0.03} />
        <rect x={160} y={BANDS[0]} width={92} height={BANDS[5] - BANDS[0]} rx={12} fill={tint("purple", 6)} />
        <rect x={256} y={BANDS[0]} width={98} height={BANDS[5] - BANDS[0]} rx={12} fill={tint("emerald", 6)} />
        {BANDS.slice(1, -1).map((y) => (
          <line key={y} x1={6} x2={354} y1={y} y2={y} stroke="currentColor" className="text-foreground" strokeOpacity={0.2} strokeDasharray="3 6" />
        ))}
        {days.map((d, i) => (
          <Label key={d} x={348} y={BANDS[i] + 18} anchor="end" size={13} op={0.7}>{d}</Label>
        ))}

        <Label x={14} y={28} anchor="start" size={18} weight={700}>{c.lanes.you}</Label>
        <Label x={MID_X} y={74} size={12} weight={700} tone={PURPLE} op={1}>{c.lanes.improve}</Label>
        <Label x={262} y={28} anchor="start" size={14} weight={700} tone="text-brand-emerald" op={1}>{c.lanes.agent}</Label>
        <rect x={258} y={40} width={96} height={22} rx={11} fill={tint("emerald", 12)} stroke={emerald} strokeOpacity={0.6} />
        <Clock x={265} y={44} width={14} height={14} color={emerald} strokeWidth={2.2} />
        <Label x={284} y={56} anchor="start" size={12}>{c.trigger}</Label>

        {/* Monday: your set-up steps */}
        <line x1={YOU_X} x2={YOU_X} y1={STEP_Y[0]} y2={STEP_Y[3]} stroke={BRAND_VAR.cyan} strokeWidth={3} strokeOpacity={0.55} />
        {steps.map((s, i) => (
          <g key={s}>
            <Mark x={YOU_X} y={STEP_Y[i]} Icon={ICONS[i]} brand="cyan" r={15} />
            <Label x={54} y={STEP_Y[i] + (i === 0 ? -2 : 5)} anchor="start" size={14}>{s}</Label>
          </g>
        ))}
        <Label x={54} y={STEP_Y[0] + 16} anchor="start" size={12.5} weight={500} op={0.78}>{c.claudeCode}</Label>

        {/* Draft, hand-off, first run */}
        <line x1={AGENT_X} x2={AGENT_X} y1={STEP_Y[2]} y2={STEP_Y[3]} stroke="currentColor" className="text-foreground" strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="6 6" />
        <path d={`M ${YOU_X} ${STEP_Y[3] + 16} C ${YOU_X} 376 150 380 ${AGENT_X - 16} 380`} stroke={emerald} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={AGENT_X} x2={AGENT_X} y1={380} y2={RUN_Y[3]} stroke={emerald} strokeWidth={3} strokeOpacity={0.5} />
        <RunDot x={AGENT_X} y={380} />
        <Label x={AGENT_X - 20} y={404} anchor="end" size={13}>{c.firstRun}</Label>

        {RUN_Y.map((y, i) => (
          <RunDot key={y} x={AGENT_X} y={y} better={i === 3} />
        ))}
        <Label x={AGENT_X} y={RUN_Y[0] + 32} size={12} weight={500} op={0.8}>{`${c.healed.top} ${c.healed.bottom}`}</Label>
        <Label x={AGENT_X + 30} y={RUN_Y[1] + 5} anchor="start" size={14} weight={700} op={0.8}>{c.scoreBefore}</Label>
        <Label x={AGENT_X + 30} y={RUN_Y[3] + 5} anchor="start" size={14} weight={700} tone="text-brand-emerald" op={1}>{c.scoreAfter}</Label>

        {/* Self-improvement loop */}
        <path d={`M ${AGENT_X - 15} ${RUN_Y[0]} C 250 ${RUN_Y[0]} ${MID_X + 10} 500 ${MID_X + 6} ${overseerY - 16}`} stroke={purple} strokeWidth={1.8} strokeDasharray="4 6" />
        <path d={`M ${AGENT_X - 15} ${RUN_Y[1]} L ${MID_X + 17} ${overseerY}`} stroke={purple} strokeWidth={1.8} strokeDasharray="4 6" />
        <path d={`M ${MID_X} ${overseerY + 16} L ${MID_X} ${labY - 18}`} stroke={purple} strokeWidth={2.4} />
        <path d={`M ${MID_X - 12} ${labY + 12} C 150 ${labY + 30} 60 ${approveY - 40} ${YOU_X + 14} ${approveY - 8}`} stroke={purple} strokeWidth={2.4} />
        <path d={`M ${YOU_X + 16} ${approveY + 6} C 150 ${approveY + 30} 240 ${RUN_Y[3]} ${AGENT_X - 24} ${RUN_Y[3]}`} stroke={purple} strokeWidth={2.4} />
        <Mark x={MID_X} y={overseerY} Icon={Compass} brand="purple" r={15} />
        <Label x={MID_X - 22} y={overseerY - 2} anchor="end" size={14}>{c.overseer}</Label>
        <Label x={MID_X - 22} y={overseerY + 16} anchor="end" size={12.5} weight={600} tone={PURPLE} op={1}>{c.coachingNote}</Label>
        <Mark x={MID_X} y={labY} Icon={FlaskConical} brand="purple" r={15} />
        <Label x={MID_X - 22} y={labY - 2} anchor="end" size={14}>{c.lab}</Label>
        <Label x={MID_X - 22} y={labY + 16} anchor="end" size={12.5} weight={600} tone={PURPLE} op={1}>{c.arena}</Label>
        <Mark x={YOU_X} y={approveY} Icon={UserCheck} brand="purple" r={15} />
        <Label x={YOU_X} y={approveY - 22} anchor="start" size={14}>{c.approve}</Label>
      </svg>
    </div>
  );
}
