"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { ARENA_ROUNDS } from "../../data";
import { arenaContenders, deltaVsBaseline, isRegression, type ArenaSide } from "../../ledger";
import type { LabVariantProps } from "../types";
import { Legend, Plate, SpecTag, strainLabel } from "./Plate";
import ArenaDish, { type ColonyState } from "./ArenaDish";
import { useCultureGate, useStepClock } from "./motion";
import { specimenCopy } from "./copy";

const R = ARENA_ROUNDS.length;
/** Even steps incubate a trial, odd steps hold its scored result. */
const trialMs = (s: number) => (s % 2 === 0 ? 1000 : 2600);
const SIDE_COLOR: Record<ArenaSide, BrandKey> = { A: "cyan", B: "purple" };

/**
 * Plate II: two strains under a split lens, cultured on the same five inputs.
 * The trial clock is ambient (still under reduced motion, parked off-screen
 * and in a hidden tab); the trial chips seek straight to any scored trial.
 */
export default function ArenaPlate({ ledger }: LabVariantProps) {
  const { t } = useTranslation();
  const words = labSectionCopy.arena;
  const copy = specimenCopy.arena;
  const ref = useRef<HTMLDivElement>(null);
  const { still, running } = useCultureGate(ref);
  const [step, setStep] = useStepClock(2 * R, trialMs, running, 2 * R - 1);
  const shown = still ? step | 1 : step;
  const current = Math.floor(shown / 2);
  const scored = shown % 2 === 1;
  const round = ARENA_ROUNDS[current];
  const contenders = arenaContenders(ledger);

  const stateOf = (side: ArenaSide, i: number): ColonyState => {
    if (i > current) return "future";
    if (i === current && !scored) return "incubating";
    return ARENA_ROUNDS[i].winner === side ? "won" : "lost";
  };
  const survived = (side: ArenaSide) =>
    ARENA_ROUNDS.filter((r, i) => (i < current || (i === current && scored)) && r.winner === side).length;

  return (
    <Plate
      tab="arena"
      title={copy.title}
      bodyRef={ref}
      status={
        <span>
          {fillTemplate(copy.trial, { n: current + 1, total: R })} ·{" "}
          <span className="text-foreground">{scored ? copy.scored : copy.incubating}</span>
        </span>
      }
      footer={
        <>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Legend color={BRAND_VAR.purple}>{copy.survives}</Legend>
            <Legend color="var(--foreground)" kind="dash">{copy.fades}</Legend>
          </span>
          <span className="hidden font-serif text-base italic text-foreground/75 md:inline">{copy.note}</span>
        </>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-glass px-5 py-2">
          <p className="min-w-0 flex-1 truncate text-base text-foreground/90">
            <span className="mr-2 font-mono text-sm uppercase tracking-[0.14em] text-foreground/70">{copy.medium}</span>
            {words.inputs[round.input]}
          </p>
          <div role="group" aria-label={copy.trialsLabel} className="flex gap-1.5">
            {ARENA_ROUNDS.map((r, i) => {
              const on = i === current;
              const resolved = i < current || (on && scored);
              const k = SIDE_COLOR[r.winner];
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${fillTemplate(copy.trial, { n: i + 1, total: R })}: ${words.inputs[r.input]}`}
                  onClick={() => setStep(i * 2 + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border font-mono text-sm tabular-nums text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    borderColor: on ? BRAND_VAR[k] : "var(--border-glass)",
                    background: resolved ? tint(k, on ? 26 : 12) : "transparent",
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div role="img" aria-label={copy.dishLabel} className="relative grid min-h-0 flex-1 grid-cols-2">
          <span aria-hidden className="absolute inset-y-4 left-1/2 w-px bg-glass" />
          {(["A", "B"] as const).map((side) => {
            const id = contenders[side];
            const row = ledger.rows.find((r) => r.id === id);
            const delta = deltaVsBaseline(ledger, id);
            const color = SIDE_COLOR[side];
            const score = side === "A" ? round.scoreA : round.scoreB;
            const won = scored && round.winner === side;
            return (
              <div key={side} className="flex min-h-0 flex-col px-3 py-2 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-base font-bold" style={{ color: BRAND_VAR[color] }}>
                    {side}
                  </span>
                  <span className="font-serif text-base italic text-foreground">{strainLabel(id)}</span>
                  {id === ledger.liveId && <SpecTag color="emerald" solid>{t.labVersions.live}</SpecTag>}
                </div>
                <div className="font-mono text-sm tabular-nums text-foreground/75">
                  {copy.rating} <span className="text-foreground">{row?.rating ?? "—"}</span> ·{" "}
                  <span style={{ color: delta === null ? undefined : isRegression(delta) ? BRAND_VAR.rose : delta >= 0 ? BRAND_VAR.emerald : BRAND_VAR.amber }}>
                    {delta === null ? copy.noDelta : `${delta > 0 ? "+" : ""}${delta}`}
                  </span>
                </div>
                <div className="relative mt-1 min-h-0 flex-1 [container-type:size]">
                  <div className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2" style={{ width: "min(100cqw, 100cqh)" }}>
                    <ArenaDish side={side} color={color} rounds={ARENA_ROUNDS} states={ARENA_ROUNDS.map((_, i) => stateOf(side, i))} current={current} running={running} still={still} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                      <motion.span
                        key={`${current}-${scored}`}
                        initial={still ? false : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-mono text-2xl font-bold tabular-nums"
                        style={{ color: scored ? BRAND_VAR[color] : "var(--foreground)" }}
                      >
                        {scored ? score : "…"}
                      </motion.span>
                      <span className="mt-1 hidden font-mono text-sm text-foreground/75 sm:inline">
                        {scored ? (won ? copy.survives : copy.fades) : copy.incubating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center font-mono text-sm tabular-nums text-foreground/80">
                  {fillTemplate(copy.tally, { n: survived(side), total: R })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Plate>
  );
}
