"use client";

import { Check, Clock, Download, FlaskConical, KeyRound, PenLine, Rocket, type LucideIcon } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Mark } from "./GetStarted.shared";
import { Label } from "./GetStarted.handoff.parts";
import type { HandoffWords } from "./GetStarted.handoff";

/* Below md: the same week turned on its side - time runs down, you on the left, the
 * agent on the right. The resolved end state only (viewBox 360 x 760). */

const YOU_X = 34;
const AGENT_X = 268;
const STEP_Y = [140, 210, 280, 350];
const RUN_Y = [461, 544, 627, 710];
const BANDS = [84, 420, 503, 586, 669, 752];
const ICONS: LucideIcon[] = [Download, KeyRound, PenLine, Rocket];

export default function HandoffPhone({ w }: { w: HandoffWords }) {
  const steps = [w.steps.install, w.steps.connect, w.steps.describe, w.steps.promote];
  const days = [w.days.mon, w.days.tue, w.days.wed, w.days.thu, w.days.fri];
  const emerald = BRAND_VAR.emerald;
  return (
    <div data-illustrate-art role="img" aria-label={w.artLabel} className="mx-auto mt-8 w-full max-w-sm rounded-2xl border border-glass bg-white/[0.02] p-2 md:hidden">
      <svg viewBox="0 0 360 760" className="block h-auto w-full" aria-hidden fill="none">
        <rect x={8} y={84} width={198} height={668} rx={12} fill="currentColor" className="text-foreground" fillOpacity={0.03} />
        <rect x={214} y={84} width={138} height={668} rx={12} fill={tint("emerald", 6)} />
        {BANDS.slice(1, -1).map((y) => (
          <line key={y} x1={8} x2={352} y1={y} y2={y} stroke="currentColor" className="text-foreground" strokeOpacity={0.2} strokeDasharray="3 6" />
        ))}
        {days.map((d, i) => (
          <Label key={d} x={344} y={BANDS[i] + 20} anchor="end" size={13} fillOpacity={0.7}>{d}</Label>
        ))}

        <Label x={20} y={30} anchor="start" size={18} weight={700}>{w.you}</Label>
        <Label x={214} y={30} anchor="start" size={16} weight={700} tone="text-brand-emerald" fillOpacity={1}>{w.agent}</Label>
        <rect x={212} y={42} width={124} height={28} rx={14} fill={tint("emerald", 12)} stroke={emerald} strokeOpacity={0.6} />
        <Clock x={222} y={48} width={16} height={16} color={emerald} strokeWidth={2.2} />
        <Label x={244} y={61} anchor="start" size={14}>{w.trigger}</Label>

        {/* Monday: your four steps, down the left */}
        <line x1={YOU_X} x2={YOU_X} y1={STEP_Y[0]} y2={STEP_Y[3]} stroke={BRAND_VAR.cyan} strokeWidth={3} strokeOpacity={0.55} />
        {steps.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <g key={s}>
              <circle cx={YOU_X} cy={STEP_Y[i]} r={16} fill={tint("cyan", 16)} stroke={BRAND_VAR.cyan} strokeWidth={2} />
              <Icon x={YOU_X - 8} y={STEP_Y[i] - 8} width={16} height={16} color={BRAND_VAR.cyan} strokeWidth={2.2} />
              <Label x={58} y={STEP_Y[i] + (i === 0 ? -2 : 5)} anchor="start" size={14}>{s}</Label>
            </g>
          );
        })}
        <Label x={58} y={STEP_Y[0] + 17} anchor="start" size={12.5} weight={500} fillOpacity={0.75}>{w.claudeCode}</Label>

        {/* Draft, the hand-off and the first run */}
        <line x1={AGENT_X} x2={AGENT_X} y1={STEP_Y[2]} y2={STEP_Y[3]} stroke="currentColor" className="text-foreground" strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="6 6" />
        <Label x={AGENT_X + 12} y={(STEP_Y[2] + STEP_Y[3]) / 2 + 5} anchor="start" size={13} weight={500} fillOpacity={0.75}>{w.draft}</Label>
        <path d={`M ${YOU_X + 17} ${STEP_Y[3]} C 150 ${STEP_Y[3]} ${AGENT_X} 350 ${AGENT_X} 380`} stroke={emerald} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={AGENT_X} x2={AGENT_X} y1={395} y2={RUN_Y[3]} stroke={emerald} strokeWidth={3} strokeOpacity={0.5} />
        <Run y={395} brand="emerald" />
        <Label x={AGENT_X + 20} y={400} anchor="start" size={14}>{w.firstRun}</Label>

        {/* Every morning: a run, and a digest handed to you */}
        {RUN_Y.map((y, i) => (
          <g key={y}>
            <line x1={AGENT_X - 16} x2={176} y1={y} y2={y} stroke={emerald} strokeOpacity={0.55} strokeWidth={1.8} strokeDasharray="4 5" />
            <rect x={128} y={y - 14} width={44} height={28} rx={8} fill="var(--background)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} className="text-foreground" />
            <g className="text-foreground" opacity={0.85}>
              <Mark name="slack" x={150} y={y} size={15} />
            </g>
            <Run y={y} brand={i >= 2 ? "purple" : "emerald"} />
            {i >= 2 && <Label x={AGENT_X + 20} y={y + 5} anchor="start" size={13} weight={700} tone="text-brand-purple" fillOpacity={1}>{w.v2}</Label>}
            {i === 0 && <Label x={118} y={y + 5} anchor="end" size={13}>{w.digest}</Label>}
          </g>
        ))}

        {/* You step in once, in the Lab */}
        <circle cx={YOU_X} cy={BANDS[3]} r={15} fill={tint("purple", 18)} stroke={BRAND_VAR.purple} strokeWidth={2} />
        <FlaskConical x={YOU_X - 8} y={BANDS[3] - 8} width={16} height={16} color={BRAND_VAR.purple} strokeWidth={2.2} />
        <Label x={56} y={BANDS[3] + 5} anchor="start" size={13} tone="text-brand-purple" fillOpacity={1}>{w.lab}</Label>
      </svg>
    </div>
  );
}

function Run({ y, brand }: { y: number; brand: "emerald" | "purple" }) {
  return (
    <g>
      <circle cx={AGENT_X} cy={y} r={14} fill={tint(brand, 22)} stroke={BRAND_VAR[brand]} strokeWidth={2.2} />
      <Check x={AGENT_X - 7} y={y - 7} width={14} height={14} color={BRAND_VAR[brand]} strokeWidth={3} />
    </g>
  );
}
