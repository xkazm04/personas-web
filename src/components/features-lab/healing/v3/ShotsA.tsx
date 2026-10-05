"use client";

import { Check, Search, X } from "lucide-react";
import type { Translations } from "@/i18n/en";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASE_COLOR, CASE_IDS, type CaseId } from "../shared/cases";
import { FAILING_STEP } from "./data";
import RunCard from "./RunCard";

export type HealingCopy = Translations["featuresLab"]["healing"];

export const KICKER = "inline-flex items-center gap-[0.4em] font-mono text-[0.8em] font-semibold uppercase tracking-[0.14em]";

/** Shot 1: the run, broken at one step. */
export function ShotFails({ t, caseId }: { t: HealingCopy; caseId: CaseId }) {
  return (
    <div className="flex h-full items-center gap-[1.1em]">
      <RunCard name={t.v3.runName} time={t.v1.schedule} labels={t.v3.steps} failAt={FAILING_STEP[caseId]} healed={false} healedTag={t.v1.healed} />
      <div className="flex min-w-0 flex-1 flex-col gap-[0.35em]">
        <span className={KICKER} style={{ color: BRAND_VAR.rose }}>
          <X className="h-[1.1em] w-[1.1em]" strokeWidth={3} aria-hidden />
          {t.stages.detect}
        </span>
        <span className="text-[1.3em] font-semibold leading-tight text-foreground">{t.cases[caseId].error}</span>
      </div>
    </div>
  );
}

/** Shot 2: the error read and matched to its cause. */
export function ShotWhy({ t, caseId }: { t: HealingCopy; caseId: CaseId }) {
  const c = t.cases[caseId];
  return (
    <div className="flex h-full items-center gap-[1.2em]">
      <div className="flex min-w-0 flex-1 flex-col gap-[0.6em]">
        <div
          className="relative rounded-[0.6em] border py-[0.5em] pl-[0.8em] pr-[1.8em] font-mono text-[0.85em] leading-snug text-foreground"
          style={{ borderColor: tint("rose", 45), background: tint("rose", 8) }}
        >
          {c.error}
          <span
            className="absolute -bottom-[0.9em] -right-[0.6em] flex h-[2.2em] w-[2.2em] items-center justify-center rounded-full border-2"
            style={{ borderColor: BRAND_VAR.amber, background: "var(--background)" }}
          >
            <Search className="h-[1.1em] w-[1.1em]" strokeWidth={2.6} style={{ color: BRAND_VAR.amber }} aria-hidden />
          </span>
        </div>
        <span className={KICKER} style={{ color: BRAND_VAR.amber }}>
          {t.stages.diagnose}
        </span>
        <span className="text-[1.3em] font-semibold leading-tight text-foreground">{c.diagnosis}</span>
      </div>
      <ul className="flex w-[9.5em] shrink-0 flex-col gap-[0.25em]">
        {CASE_IDS.map((id) => {
          const on = id === caseId;
          const k = CASE_COLOR[id];
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-[0.4em] rounded-full border px-[0.7em] py-[0.1em] text-[0.85em]"
              style={{
                borderColor: on ? tint(k, 70) : "var(--border-glass)",
                background: on ? tint(k, 18) : "transparent",
                color: on ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 60%, transparent)",
                fontWeight: on ? 650 : 400,
              }}
            >
              {t.cases[id].name}
              {on && <Check className="h-[1em] w-[1em]" strokeWidth={3} style={{ color: BRAND_VAR[k] }} aria-hidden />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
