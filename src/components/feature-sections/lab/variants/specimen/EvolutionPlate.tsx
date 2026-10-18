"use client";

import { Sprout } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { GENOME_NODES } from "../../data";
import { genomeSummary } from "../../genome";
import { useStageBox } from "../../useStageBox";
import type { LabVariantProps } from "../types";
import { Legend, Plate } from "./Plate";
import EvolutionTree from "./EvolutionTree";
import { useCultureGate, useGrowth } from "./motion";
import { specimenCopy } from "./copy";

const SUMMARY = genomeSummary(GENOME_NODES);
/** Below the stage the tree keeps one design box (phones scale it down). */
const DESIGN_BOX = { w: 400, h: 340 };

/**
 * Plate III: the persona's phylogeny. It grows once when the plate comes
 * into view (resolved at once under reduced motion); "regrow culture" plays
 * it again unless the tab is hidden.
 */
export default function EvolutionPlate({ ledger }: LabVariantProps) {
  const words = labSectionCopy.evolution;
  const copy = specimenCopy.evolution;
  const [boxRef, box] = useStageBox<HTMLDivElement>();
  const { running } = useCultureGate(boxRef);
  const { p, play, still } = useGrowth(boxRef, 5.4);

  return (
    <Plate
      tab="evolution"
      title={copy.title}
      status={
        <>
          <span>
            {words.gen} <span className="font-semibold tabular-nums text-foreground">{SUMMARY.generation}</span>
          </span>
          <span>
            {words.best} <span className="font-semibold tabular-nums text-brand-amber">{SUMMARY.best}</span>
          </span>
          <span>
            {words.lineage}{" "}
            <span className="font-semibold tabular-nums text-brand-emerald">
              {SUMMARY.lineageGainPct >= 0 ? "+" : ""}
              {SUMMARY.lineageGainPct}%
            </span>
          </span>
        </>
      }
      footer={
        <>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Legend color={BRAND_VAR.amber}>{copy.vein}</Legend>
            <Legend color={BRAND_VAR.emerald}>{words.alive}</Legend>
            <Legend color="var(--foreground)" kind="dash">{copy.withered}</Legend>
          </span>
          <button
            type="button"
            onClick={play}
            disabled={still}
            className="flex h-9 items-center gap-1.5 rounded-md border border-brand-amber/50 bg-brand-amber/10 px-3 uppercase tracking-wider text-brand-amber disabled:opacity-40"
          >
            <Sprout className="h-3.5 w-3.5" aria-hidden /> {copy.regrow}
          </button>
        </>
      }
    >
      <div ref={boxRef} role="img" aria-label={copy.treeLabel} className="relative h-full">
        <EvolutionTree box={box ?? DESIGN_BOX} p={p} liveId={ledger.liveId} running={running} />
      </div>
    </Plate>
  );
}
