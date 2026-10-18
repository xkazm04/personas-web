"use client";

import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { EVAL_DIMENSIONS, EVAL_SAMPLE_RUNS } from "../../data";
import { EVAL_BASELINE_NODE } from "../../experiment";
import { initialLedger } from "../../ledger";
import { useStageBox } from "../../useStageBox";
import type { LabVariantProps } from "../types";
import { Legend, Plate, SpecTag, nodeCode, strainLabel } from "./Plate";
import EvalMembrane from "./EvalMembrane";
import { useCultureGate, useGrowth } from "./motion";
import { specimenCopy } from "./copy";

/** The assay measures the ledger's original live strain (data.ts EVAL_DIMENSIONS). */
const STRAIN = initialLedger().liveId;
const N = EVAL_DIMENSIONS.length;
const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
const AVG = avg(EVAL_DIMENSIONS.map((d) => d.score));
const AVG_DELTA = AVG - avg(EVAL_DIMENSIONS.map((d) => d.baseline));
/** Lobes ranked by how far they swelled past the ancestor. */
const RANKED = [...EVAL_DIMENSIONS].sort((a, b) => b.score - b.baseline - (a.score - a.baseline));
const WIDEST = RANKED[0].key;
const THINNEST = [...EVAL_DIMENSIONS].sort((a, b) => a.score - b.score)[0].key;
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
/** Bar position on the membrane's 50-100 scale. */
const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - 50) / 50) * 100))}%`;

/**
 * Plate IV: the membrane assay. The cell swells lobe by lobe when the plate
 * comes into view (resolved under reduced motion; "re-assay" replays it
 * unless the tab is hidden); the assay sheet ranks every lobe by its swell.
 */
export default function EvalPlate({ ledger }: LabVariantProps) {
  const { t } = useTranslation();
  const words = labSectionCopy.eval;
  const copy = specimenCopy.eval;
  const [boxRef, box] = useStageBox<HTMLDivElement>();
  const { running } = useCultureGate(boxRef);
  const { p, play, still } = useGrowth(boxRef, 3.6);
  const labelSize = box ? Math.min(24, Math.max(16, (15 * 412) / box.h)) : 16;

  return (
    <Plate
      tab="eval"
      title={copy.title}
      status={
        <>
          <span>
            {words.avg} <span className="font-semibold tabular-nums text-foreground">{AVG}</span>
          </span>
          <span>
            {words.deltaVsBaseline} <span className="font-semibold tabular-nums text-brand-emerald">{signed(AVG_DELTA)}</span>
          </span>
        </>
      }
      footer={
        <>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Legend color={BRAND_VAR.emerald}>{strainLabel(STRAIN)}</Legend>
            <Legend color="var(--foreground)" kind="dash">{copy.ghost}</Legend>
            <span className="hidden uppercase tracking-wider text-foreground/60 lg:inline">
              {fillTemplate(words.footer, { dimensions: N, runs: EVAL_SAMPLE_RUNS })}
            </span>
          </span>
          <button
            type="button"
            onClick={play}
            disabled={still}
            className="flex h-9 items-center gap-1.5 rounded-md border border-brand-emerald/50 bg-brand-emerald/10 px-3 uppercase tracking-wider text-brand-emerald disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {copy.reassay}
          </button>
        </>
      }
    >
      <div className="flex h-full flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_15rem] stage:grid-cols-[minmax(0,1fr)_17rem]">
        <div ref={boxRef} role="img" aria-label={copy.membraneLabel} className="relative min-h-0 flex-1 sm:h-full">
          <EvalMembrane p={p} running={running} labelSize={labelSize} />
        </div>

        <div className="flex min-h-0 flex-col gap-2 border-t border-glass px-4 py-3 sm:border-l sm:border-t-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-serif text-base italic text-foreground">{strainLabel(STRAIN)}</span>
            {ledger.liveId === STRAIN && <SpecTag color="emerald" solid>{t.labVersions.live}</SpecTag>}
            <span className="font-mono text-sm text-foreground/70">
              {fillTemplate(copy.strainVsAncestor, { node: nodeCode(EVAL_BASELINE_NODE) })}
            </span>
          </div>
          <ol className="grid min-h-0 flex-1 grid-cols-3 gap-x-3 gap-y-1 sm:flex sm:flex-col sm:justify-center sm:gap-2">
            {RANKED.map((d, rank) => {
              const delta = d.score - d.baseline;
              const mark = d.key === WIDEST ? copy.widest : d.key === THINNEST ? copy.thinnest : null;
              return (
                <motion.li
                  key={d.key}
                  initial={still ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: still ? 0 : 0.3 + rank * 0.07 }}
                  className="min-w-0"
                >
                  <div className="flex items-baseline justify-between gap-2 font-mono text-sm tabular-nums">
                    <span className="truncate text-foreground/85">
                      <span className="hidden text-foreground/60 sm:inline">{rank + 1}. </span>
                      {words.dimensions[d.key]}
                    </span>
                    <span>
                      <span className="font-semibold text-foreground">{d.score}</span>{" "}
                      <span style={{ color: delta >= 0 ? BRAND_VAR.emerald : BRAND_VAR.rose }}>{signed(delta)}</span>
                    </span>
                  </div>
                  <div className="relative mt-1 hidden h-1.5 rounded-full sm:block" style={{ background: tint("emerald", 10) }}>
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(d.score), background: tint("emerald", 70) }} />
                    <span aria-hidden className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-foreground/70" style={{ left: pct(d.baseline) }} />
                  </div>
                  {mark && <span className="hidden font-serif text-sm italic text-foreground/75 sm:block">{mark}</span>}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </Plate>
  );
}
