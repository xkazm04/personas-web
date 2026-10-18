"use client";

import { useRef } from "react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { ARENA_ROUNDS } from "../../../data";
import { arenaContenders } from "../../../ledger";
import type { LabVariantProps } from "../../types";
import Frame, { Readout } from "../parts/Frame";
import Ticker from "../parts/Ticker";
import { useBenchClock } from "../parts/useBenchClock";
import { instrumentCopy } from "../copy";
import { ARENA_STEPS, ROUNDS, SIDE_COLOR, arenaStepMs, profile, tally } from "./arena";
import ArenaScope from "./ArenaScope";
import RoundStrip from "./RoundStrip";

const FINAL = ARENA_STEPS - 1;

/**
 * Arena as a dual-channel compare. The step clock walks the five inputs
 * (acquire, then lock); it runs only while the bench is on screen with the
 * tab foregrounded, and rests on the last locked round under reduced motion.
 * Contender ids and the Live tag come from the ledger.
 */
export default function ArenaBench({ ledger }: Pick<LabVariantProps, "ledger">) {
  const { t } = useTranslation();
  const a = labSectionCopy.arena;
  const c = instrumentCopy.arena;
  const ref = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(ref);
  const [step, setStep] = useBenchClock(ARENA_STEPS, arenaStepMs, run, 0);
  // Still: rest on the last locked round, or on the locked round the visitor picked.
  const shown = still ? (step === 0 ? FINAL : step | 1) : step;
  const round = Math.floor(shown / 2);
  const locked = shown % 2 === 1;
  const r = ARENA_ROUNDS[round];
  const contenders = arenaContenders(ledger);
  const wins = tally(locked ? round : round - 1);
  const margin = Math.abs(r.scoreA - r.scoreB);

  return (
    <div ref={ref} className="stage:h-full">
      <Frame
        channel={2}
        color="purple"
        title={c.title}
        readouts={
          <>
            <Readout label={a.round}>
              {round + 1}/{ROUNDS}
            </Readout>
            <Readout label={c.margin} color={locked ? SIDE_COLOR[r.winner] : undefined}>
              {locked ? <Ticker key={round} value={margin} signed /> : "…"}
            </Readout>
            <Readout label={c.tally}>
              <span style={{ color: BRAND_VAR.cyan }}>{wins.A}</span>
              <span className="text-foreground/60">:</span>
              <span style={{ color: BRAND_VAR.purple }}>{wins.B}</span>
            </Readout>
          </>
        }
        footer={
          <>
            <span className="flex flex-wrap items-center gap-4">
              {(["A", "B"] as const).map((side) => (
                <span key={side} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: BRAND_VAR[SIDE_COLOR[side]] }} />
                  <span className="text-foreground/85">
                    {fillTemplate(a.version, { version: `${side} · ${contenders[side]}` })}
                  </span>
                  {contenders[side] === ledger.liveId && (
                    <span className="font-semibold uppercase tracking-wider text-brand-emerald">{t.labVersions.live}</span>
                  )}
                </span>
              ))}
            </span>
            <span className="uppercase tracking-wider text-foreground/60">
              {locked ? `${c.locked} · ${fillTemplate(a.winsAria, { version: r.winner })}` : c.acquiring}
            </span>
          </>
        }
      >
        <div className="flex flex-col gap-2.5 p-3 stage:min-h-0 stage:flex-1">
          <div className="flex items-baseline gap-3 font-mono">
            <span className="shrink-0 text-sm uppercase tracking-[0.14em] text-foreground/60">{c.source}</span>
            <span className="min-w-0 truncate text-base text-foreground/90">&gt; {a.inputs[r.input]}</span>
          </div>
          <ArenaScope
            round={round}
            profiles={{ A: profile(contenders.A, round), B: profile(contenders.B, round) }}
            means={{ A: r.scoreA, B: r.scoreB }}
            winner={r.winner}
            locked={locked}
            still={still}
          />
          <RoundStrip current={round} locked={locked} still={still} onPick={(i) => setStep(i * 2 + 1)} />
        </div>
      </Frame>
    </div>
  );
}
