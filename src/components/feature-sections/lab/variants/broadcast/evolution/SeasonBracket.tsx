"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import type { LabVariantProps } from "../../types";
import { BroadcastFrame, Plate, Ticker } from "../Frame";
import { beat, useOnAir } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { CHAMP, EVO_STEPS, GENS, SUMMARY, evoMs, genCounts, nodeForVersion } from "./season";
import Bracket from "./Bracket";

/**
 * Evolution as a season bracket: each generation is a round of the draft,
 * survivors advance, the culled are struck, and the champion's line through
 * the bracket is the best lineage. The ledger's versions are named on the
 * entries they were measured as.
 */
export default function SeasonBracket({ ledger }: Pick<LabVariantProps, "ledger">) {
  const c = broadcastCopy.evolution;
  const e = labSectionCopy.evolution;
  const ref = useRef<HTMLDivElement>(null);
  const air = useOnAir(ref, EVO_STEPS, evoMs);
  const entered = Math.min(air.at, GENS);
  const crowned = air.at >= EVO_STEPS;

  const versionOf = new Map<string, string>();
  for (const row of ledger.rows) {
    const node = nodeForVersion(row.id);
    if (node) versionOf.set(node, row.id);
  }
  const liveNode = nodeForVersion(ledger.liveId);
  const gain = `${SUMMARY.lineageGainPct >= 0 ? "+" : ""}${SUMMARY.lineageGainPct}%`;

  const ticker = crowned
    ? fillTemplate(c.tickerChamp, { fitness: SUMMARY.best, gain })
    : entered <= 1
      ? c.warmup
      : fillTemplate(c.tickerGen, { gen: entered - 1, ...genCounts(entered - 1) });

  return (
    <BroadcastFrame
      rootRef={ref}
      tone="amber"
      segment={broadcastCopy.segments.evolution}
      live={air.live}
      moving={air.moving}
      meta={
        <>
          <span className="text-foreground/70">
            {e.gen} <span className="font-semibold text-foreground">{Math.max(0, entered - 1)}</span>
          </span>
          <span className="text-foreground/70">
            {e.best} <span className="font-semibold" style={{ color: BRAND_VAR.amber }}>{SUMMARY.best}</span>
          </span>
          <span className="text-foreground/70">
            {e.lineage} <span className="font-semibold" style={{ color: BRAND_VAR.emerald }}>{gain}</span>
          </span>
        </>
      }
      footer={
        <Ticker label={c.ticker} tone="amber" text={ticker} moving={air.moving}>
          <motion.span
            className="inline-flex"
            initial={false}
            animate={{ opacity: crowned ? 1 : 0, scale: crowned ? 1 : 0.8 }}
            transition={beat(air.moving, 0.4)}
          >
            <Plate tone="amber" solid>
              <Trophy className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {c.champion} {CHAMP?.fitness}
            </Plate>
          </motion.span>
        </Ticker>
      }
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-2 text-sm">
          <span className="font-semibold uppercase tracking-wider text-foreground/70">{c.board}</span>
          <Legend />
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto px-2 pb-2 scrollbar-hide">
          <Bracket entered={entered} crowned={crowned} versionOf={versionOf} liveNode={liveNode} moving={air.moving} />
        </div>
      </div>
    </BroadcastFrame>
  );
}

function Legend() {
  const e = labSectionCopy.evolution;
  const items = [
    { label: e.bestLineage, color: BRAND_VAR.amber },
    { label: e.alive, color: BRAND_VAR.emerald },
    { label: e.culled, color: "color-mix(in srgb, var(--foreground) 35%, transparent)" },
  ];
  return (
    <span className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-foreground/80">
          <span className="h-2 w-3 -skew-x-12 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </span>
  );
}
