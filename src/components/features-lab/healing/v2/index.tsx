"use client";

import { useRef } from "react";
import { NotebookPen, RotateCcw } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import HealingSection from "../shared/HealingSection";
import { isEscalated, CASE_IDS } from "../shared/cases";
import { useLoopGate, useStepLoop } from "../shared/useStepLoop";
import { APEX, BASE_L, START_TICK, TICK_LOOP, VIEW, arrivals, stepMs } from "./geometry";
import Prism from "./Prism";
import Cards from "./Cards";

/*
 * Features lab - healing V2 "Prism": the diagnosis as optics. Failed steps
 * arrive as one rose beam; the prism reads each error and splits the stream
 * by cause, and every failure leaves on the beam of the fix the app really
 * applies (wait, more time, resume, a stronger model). Only the expired login
 * lands on "for you". The tallies are the medium: they count the shards that
 * actually land, so the ratio of fixed to yours builds up in front of you.
 */
export default function HealingV2() {
  const t = useTranslation().t.featuresLab.healing;
  const ref = useRef<HTMLDivElement>(null);
  const { running } = useLoopGate(ref);
  const [tick] = useStepLoop(TICK_LOOP, stepMs, running, START_TICK);
  const counts = arrivals(tick);
  const fixed = CASE_IDS.filter((id) => !isEscalated(id)).reduce((n, id) => n + counts[id], 0);
  const yours = counts.login;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <HealingSection lede={t.v2.lede}>
      <div
        ref={ref}
        className="relative mx-auto w-full text-[11px] sm:text-[13px] stage:[font-size:clamp(14px,min(calc(100cqh/28),calc(100cqw/61)),26px)]"
        style={{ maxWidth: "60em" }}
      >
        <div
          data-tour-diagram="healing"
          role="img"
          aria-label={t.v2.artLabel}
          className="relative w-full"
          style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
        >
          <Prism tick={tick} running={running} />

          <span
            className="absolute font-mono text-[0.8em] font-semibold uppercase tracking-[0.16em]"
            style={{ left: pct(20, VIEW.w), top: pct(196, VIEW.h), color: BRAND_VAR.rose }}
          >
            {t.v2.failures}
          </span>

          <span
            className="absolute -translate-x-1/2 text-center leading-tight"
            style={{ left: pct(APEX.x, VIEW.w), top: pct(BASE_L.y + 14, VIEW.h) }}
          >
            <span className="block text-[1.1em] font-semibold text-foreground">{t.v2.diagnose}</span>
            <span className="block whitespace-nowrap text-[0.85em] text-foreground/70">{t.v2.diagnoseSub}</span>
          </span>

          <div className="absolute flex flex-col gap-[0.2em]" style={{ left: pct(20, VIEW.w), top: pct(318, VIEW.h) }}>
            <Tally n={fixed} label={t.v2.fixed} color={BRAND_VAR.emerald} big />
            <Tally n={yours} label={t.v2.forYou} color={BRAND_VAR.rose} />
          </div>

          <Cards cases={t.cases} counts={counts} forYou={t.v2.forYou} running={running} />
        </div>

        <div className="mt-[0.9em] flex flex-wrap items-center justify-center gap-x-[2em] gap-y-[0.4em] text-[0.9em] text-foreground/80">
          <span className="inline-flex items-center gap-[0.45em]">
            <RotateCcw className="h-[1.05em] w-[1.05em]" style={{ color: BRAND_VAR.cyan }} aria-hidden />
            {t.v2.budget}
          </span>
          <span className="inline-flex items-center gap-[0.45em]">
            <NotebookPen className="h-[1.05em] w-[1.05em]" style={{ color: BRAND_VAR.purple }} aria-hidden />
            {t.v2.logged}
          </span>
          <span className="font-mono text-[0.85em] uppercase tracking-[0.14em] text-foreground/60">{t.stylised}</span>
        </div>
      </div>
    </HealingSection>
  );
}

function Tally({ n, label, color, big }: { n: number; label: string; color: string; big?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-[0.4em]">
      <span className={`font-bold tabular-nums leading-none ${big ? "text-[2.6em]" : "text-[1.6em]"}`} style={{ color }}>
        {n}
      </span>
      <span className="text-[0.95em] text-foreground/80">{label}</span>
    </span>
  );
}
