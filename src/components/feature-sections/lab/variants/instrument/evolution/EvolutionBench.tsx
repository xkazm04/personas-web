"use client";

import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useLoopGate } from "@/hooks/useLoopGate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import type { LabVariantProps } from "../../types";
import Frame, { BenchKey, Readout, Swatch } from "../parts/Frame";
import Ticker from "../parts/Ticker";
import { canStart, useBenchClock } from "../parts/useBenchClock";
import { instrumentCopy } from "../copy";
import { SUMMARY, SWEEP_STEPS, cursorGen, sweepStepMs } from "./strip";
import StripChart from "./StripChart";

/**
 * Evolution as a strip-chart recorder. The sweep is an ambient loop (on
 * screen, tab foregrounded, motion allowed); reduced motion rests on the
 * full chart. Re-sweep restarts the pass and refuses on a hidden tab.
 */
export default function EvolutionBench({ ledger }: Pick<LabVariantProps, "ledger">) {
  const { t } = useTranslation();
  const e = labSectionCopy.evolution;
  const c = instrumentCopy.evolution;
  const ref = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(ref);
  const [step, setStep] = useBenchClock(SWEEP_STEPS, sweepStepMs, run, 0);
  const cursor = still ? SUMMARY.generation : cursorGen(step);
  const sweeping = !still && run && cursor < SUMMARY.generation;

  return (
    <div ref={ref} className="stage:h-full">
      <Frame
        channel={3}
        color="amber"
        title={c.title}
        readouts={
          <>
            <Readout label={e.gen}>{SUMMARY.generation}</Readout>
            <Readout label={e.best} color="amber">
              <Ticker value={SUMMARY.best} />
            </Readout>
            <Readout label={e.lineage} color="emerald">
              <Ticker value={SUMMARY.lineageGainPct} signed suffix="%" />
            </Readout>
          </>
        }
        footer={
          <>
            <span className="flex flex-wrap items-center gap-4">
              <Swatch color={BRAND_VAR.amber} label={e.bestLineage} />
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <span className="h-2 w-2 rounded-full" style={{ background: BRAND_VAR.emerald }} />
                {e.alive}
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <span aria-hidden className="font-bold text-foreground/70">×</span>
                {e.culled}
              </span>
              <Swatch color={BRAND_VAR.amber} dashed label={c.envelope} />
            </span>
            <span className="flex items-center gap-3">
              <span className="uppercase tracking-wider text-foreground/60">{sweeping ? c.sweep : ""}</span>
              <BenchKey color="amber" disabled={still} onClick={() => canStart() && setStep(0)}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {c.resweep}
              </BenchKey>
            </span>
          </>
        }
      >
        <div className="flex flex-col p-3 stage:min-h-0 stage:flex-1">
          <StripChart cursor={cursor} still={still} liveId={ledger.liveId} liveLabel={t.labVersions.live} />
        </div>
      </Frame>
    </div>
  );
}
