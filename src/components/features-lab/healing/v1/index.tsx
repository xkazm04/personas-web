"use client";

import { useRef, type CSSProperties } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import HealingSection from "../shared/HealingSection";
import { CASE_COLOR, fill } from "../shared/cases";
import { useLoopGate, useStepLoop } from "../shared/useStepLoop";
import { BRAND_LABEL, FINAL_STEP, LOOP, PHASES, V1_CASES, stepMs } from "./geometry";
import Board, { phaseColor } from "./Board";
import RunLog, { type LogLine } from "./RunLog";
import Stepper from "./Stepper";

/*
 * Features lab - healing V1 "Run circuit": the direct successor of the live
 * circuit board. Same mechanism (a trace breaks, Detect -> Diagnose -> Fix ->
 * Back on track, cycling through failures), but the board is now the agent's
 * own run (schedule, agent, the real Gmail / Slack / Notion connectors, the
 * report), each failure gets the fix the app really applies, and the expired
 * login is stopped and handed to you instead of being "repaired".
 * The art is sized in em from the stage slot's height (cqh), so it always fits.
 */
export default function HealingV1() {
  const t = useTranslation().t.featuresLab.healing;
  const ref = useRef<HTMLDivElement>(null);
  const { still, running } = useLoopGate(ref);
  const [step, setStep] = useStepLoop(LOOP, stepMs, running, FINAL_STEP);
  const shown = still ? FINAL_STEP + Math.floor(step / PHASES) * PHASES : step;
  const caseIdx = Math.floor(shown / PHASES);
  const phase = shown % PHASES;
  const caseId = V1_CASES[caseIdx];
  const c = t.cases[caseId];
  const escalated = caseId === "login";

  const lines: LogLine[] = [
    { stage: t.stages.detect, text: c.error, color: "rose" },
    { stage: t.stages.diagnose, text: c.diagnosis, color: "amber" },
    { stage: t.stages.fix, text: c.fix, sub: escalated ? undefined : fill(t.retry, 1), color: escalated ? "rose" : "cyan" },
    escalated
      ? { stage: t.stages.yours, text: c.result, sub: c.note, color: "rose" }
      : { stage: t.stages.done, text: c.result, sub: t.overseerNote, color: "emerald" },
  ];
  const statusColor = phaseColor(phase, escalated);
  const status = phase === 0 ? t.v1.healthy : lines[phase - 1].stage;

  const pick = (i: number) => setStep(i * PHASES + (still ? PHASES - 1 : 1));

  return (
    <HealingSection lede={t.v1.lede}>
      <div
        ref={ref}
        className="relative mx-auto w-full text-[14px] md:text-[15px] stage:[font-size:clamp(14px,min(calc(100cqh/29.5),calc(100cqw/59)),26px)]"
        style={{ maxWidth: "58em" } as CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[2em] -inset-y-[0.4em] -z-10 rounded-[3em] blur-3xl"
          style={{ background: `radial-gradient(60% 55% at 40% 50%, ${tint(statusColor, 12)}, transparent 70%)`, transition: "background 0.6s" }}
        />
        <div className="overflow-hidden rounded-[1.1em] border border-glass bg-background/80 shadow-[0_1.5em_4em_-1.5em_color-mix(in_srgb,var(--background)_70%,transparent)] backdrop-blur">
          {/* header: title + the failure picker */}
          <div className="flex flex-wrap items-center justify-between gap-[0.6em] border-b border-glass px-[1.1em] py-[0.65em]">
            <div className="flex items-baseline gap-[0.6em]">
              <span className="font-semibold text-foreground">{t.v1.title}</span>
              <span className="font-mono text-[0.8em] uppercase tracking-[0.14em] text-foreground/60">{t.stylised}</span>
            </div>
            <div role="group" aria-label={t.v1.casesLabel} className="flex flex-wrap gap-[0.35em]">
              {V1_CASES.map((id, i) => {
                const on = i === caseIdx;
                const k = CASE_COLOR[id];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(i)}
                    className="inline-flex items-center gap-[0.4em] rounded-full border px-[0.75em] py-[0.25em] text-[0.85em] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      borderColor: on ? tint(k, 55) : "var(--border-glass)",
                      background: on ? tint(k, 14) : "transparent",
                      color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 75%, transparent)",
                    }}
                  >
                    <span className="h-[0.5em] w-[0.5em] rounded-full" style={{ background: BRAND_VAR[k] }} />
                    {t.cases[id].name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* the circuit and its log */}
          <div
            data-tour-diagram="healing"
            role="img"
            aria-label={t.v1.artLabel}
            className="grid md:h-[20em] md:grid-cols-[1fr_17.5em] md:grid-rows-[20em]"
          >
            <div
              className="relative h-[16em] px-[0.8em] py-[0.6em] md:h-full"
              style={{ backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1.2px)", backgroundSize: "1em 1em" }}
            >
              <Board
                caseId={caseId}
                phase={phase}
                running={running}
                labels={{
                  schedule: t.v1.schedule,
                  agent: t.v1.agent,
                  gmail: BRAND_LABEL.gmail,
                  slack: BRAND_LABEL.slack,
                  notion: BRAND_LABEL.notion,
                  report: t.v1.report,
                  sub: BRAND_LABEL.model,
                }}
              />
            </div>
            <RunLog title={t.v1.log} status={status} statusColor={statusColor} lines={lines} reached={phase} running={running} />
          </div>

          <Stepper
            labels={[t.stages.detect, t.stages.diagnose, t.stages.fix, escalated ? t.stages.yours : t.stages.done]}
            colors={["rose", "amber", escalated ? "rose" : "cyan", escalated ? "rose" : "emerald"]}
            phase={phase}
            running={running}
          />
        </div>
      </div>
    </HealingSection>
  );
}
