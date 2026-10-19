"use client";

import { useRef } from "react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useLoopGate } from "@/hooks/useLoopGate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { EVAL_SAMPLE_RUNS } from "../../data";
import { EVAL_BASELINE_NODE, LEDGER_NODE, evalDimensions } from "../../experiment";
import type { BenchProps } from "../types";
import Frame, { Readout } from "../parts/Frame";
import Ticker from "../parts/Ticker";
import Meter from "./Meter";

const NODE: Record<string, string> = LEDGER_NODE;
const mean = (xs: number[]) => Math.round(xs.reduce((s, v) => s + v, 0) / xs.length);

/**
 * Eval as a meter bank: one dial per scored dimension, reading the version
 * the ledger has live against the reference version. Activating another
 * version on the rail swings every needle to its scores. The needles' quiver
 * is an ambient loop (on screen, tab foregrounded, motion allowed).
 */
export default function EvalBench({ ledger }: Pick<BenchProps, "ledger">) {
  const e = labSectionCopy.eval;
  const c = labSectionCopy.bench.eval;
  const ref = useRef<HTMLDivElement>(null);
  const { run, still } = useLoopGate(ref);
  const node = NODE[ledger.liveId] ?? NODE["v4.2"];
  const dims = evalDimensions(node, EVAL_BASELINE_NODE);
  const avg = mean(dims.map((d) => d.score));
  const avgDelta = avg - mean(dims.map((d) => d.baseline));

  return (
    <div ref={ref} className="stage:h-full">
      <Frame
        channel={4}
        color="emerald"
        title={c.title}
        readouts={
          <>
            <Readout label={c.reading} color="emerald">
              {ledger.liveId}
            </Readout>
            <Readout label={e.avg}>
              <Ticker value={avg} from={60} />
            </Readout>
            <Readout label={e.deltaVsBaseline} color={avgDelta < 0 ? "rose" : "emerald"}>
              <Ticker value={avgDelta} signed />
            </Readout>
          </>
        }
        footer={
          <>
            <span className="flex flex-wrap items-center gap-4 text-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-3 w-0.5 rotate-45 rounded-full" style={{ background: BRAND_VAR.emerald }} />
                {fillTemplate(c.needle, { version: ledger.liveId })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-3 w-0.5 rounded-full bg-foreground/80" />
                {c.refMark}
              </span>
            </span>
            <span className="uppercase tracking-wider text-foreground/60">
              {fillTemplate(e.footer, { dimensions: dims.length, runs: EVAL_SAMPLE_RUNS })}
            </span>
          </>
        }
      >
        <div
          role="img"
          aria-label={c.screenLabel}
          className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 stage:min-h-0 stage:flex-1 stage:grid-rows-2"
        >
          {dims.map((d, i) => (
            <Meter
              key={d.key}
              label={e.dimensions[d.key]}
              score={d.score}
              baseline={d.baseline}
              still={still}
              run={run}
              index={i}
            />
          ))}
        </div>
        <ul className="sr-only">
          {dims.map((d) => (
            <li key={d.key}>{`${e.dimensions[d.key]}: ${d.score} (${e.baseline} ${d.baseline})`}</li>
          ))}
        </ul>
      </Frame>
    </div>
  );
}
