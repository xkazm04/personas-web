"use client";

import { Check, Moon, NotebookPen, TriangleAlert, UserRound } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { CaseId } from "../shared/cases";
import { FAILING_STEP, STEPS } from "./data";
import { KICKER, type HealingCopy } from "./ShotsA";

/** Shot 4: the run back on track and the Overseer's note, or, for a login, the issue that waits for you. */
export default function ShotAfter({ t, caseId }: { t: HealingCopy; caseId: CaseId }) {
  const c = t.cases[caseId];
  if (caseId === "login")
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="w-[22em] rounded-[0.9em] border p-[0.9em]"
          style={{ borderColor: tint("rose", 60), background: tint("rose", 10), boxShadow: `0 0 2.5em ${tint("rose", 22)}` }}
        >
          <div className="mb-[0.5em] flex items-center justify-between gap-[0.6em]">
            <span className={KICKER} style={{ color: BRAND_VAR.rose }}>
              <TriangleAlert className="h-[1.1em] w-[1.1em]" aria-hidden />
              {t.v3.issueTitle}
            </span>
            <span
              className="inline-flex items-center gap-[0.3em] rounded-full px-[0.6em] py-[0.1em] text-[0.85em] font-semibold"
              style={{ color: BRAND_VAR.rose, background: tint("rose", 16) }}
            >
              <UserRound className="h-[1em] w-[1em]" aria-hidden />
              {t.stages.yours}
            </span>
          </div>
          <p className="text-[1.15em] font-semibold leading-tight text-foreground">{c.error}</p>
          <p className="mt-[0.3em] text-foreground/80">{c.note}</p>
        </div>
      </div>
    );

  return (
    <div className="flex h-full items-center gap-[1.2em]">
      <div className="flex min-w-0 flex-1 flex-col gap-[0.4em]">
        <span className={KICKER} style={{ color: BRAND_VAR.emerald }}>
          <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} aria-hidden />
          {t.stages.done}
        </span>
        <span className="text-[1.3em] font-semibold leading-tight text-foreground">{c.result}</span>
        <StepDots failAt={FAILING_STEP[caseId]} />
        <span className="mt-[0.2em] inline-flex items-center gap-[0.4em] text-[0.9em] text-foreground/80">
          <Moon className="h-[1em] w-[1em]" style={{ color: BRAND_VAR.cyan }} aria-hidden />
          {t.v3.noAlert}
        </span>
      </div>
      <div
        className="w-[12.5em] shrink-0 -rotate-2 rounded-[0.4em] p-[0.8em] shadow-[0_0.6em_1.4em_-0.6em_color-mix(in_srgb,var(--background)_80%,transparent)]"
        style={{ background: `linear-gradient(160deg, ${tint("amber", 26)}, ${tint("amber", 14)})` }}
      >
        <span className={KICKER} style={{ color: BRAND_VAR.amber }}>
          <NotebookPen className="h-[1.1em] w-[1.1em]" aria-hidden />
          {t.v3.overseer}
        </span>
        <p className="mt-[0.35em] leading-snug text-foreground">{c.note}</p>
      </div>
    </div>
  );
}

/** The run's four steps, all done; the one that healed carries a ring. */
function StepDots({ failAt }: { failAt: number }) {
  return (
    <span aria-hidden className="flex items-center gap-[0.35em]">
      {STEPS.map((s, i) => (
        <span
          key={s.key}
          className="flex h-[1.7em] w-[1.7em] items-center justify-center rounded-full"
          style={{ background: tint("emerald", i === failAt ? 30 : 14), boxShadow: i === failAt ? `0 0 0 2px ${BRAND_VAR.emerald}` : "none" }}
        >
          <Check className="h-[0.95em] w-[0.95em]" strokeWidth={3} style={{ color: BRAND_VAR.emerald }} />
        </span>
      ))}
    </span>
  );
}
