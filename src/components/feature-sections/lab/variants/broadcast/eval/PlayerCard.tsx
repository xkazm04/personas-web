"use client";

import { useRef, useState } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { EVAL_SAMPLE_RUNS } from "../../../data";
import type { LabVariantProps } from "../../types";
import { BroadcastFrame, CAPS, SLANT, Plate, Ticker } from "../Frame";
import { useOnAir } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { nodeForVersion } from "../evolution/season";
import { LEAGUE_SIZE, statCard, tier } from "./stats";
import HexChart from "./HexChart";
import AttributeRows from "./AttributeRows";

const noClock = () => 0;

/**
 * Eval as a post-match player card. It scouts the LIVE version by default
 * (follow the ledger: activate v4.3 and the card turns over to it) and can
 * scout any ledger version: overall rating from the ledger, the hex chart and
 * attribute bars against the pre-refinement baseline, league ranks.
 */
export default function PlayerCard({ ledger }: Pick<LabVariantProps, "ledger">) {
  const { t } = useTranslation();
  const c = broadcastCopy.eval;
  const ev = labSectionCopy.eval;
  const ref = useRef<HTMLDivElement>(null);
  // No run sheet here, just the gate: entrance-only motion and the LIVE bug.
  const air = useOnAir(ref, 0, noClock);
  const moving = air.moving;
  const [scout, setScout] = useState<string | null>(null);
  const scouted = ledger.rows.find((r) => r.id === scout) ?? ledger.rows.find((r) => r.id === ledger.liveId) ?? ledger.rows[0];
  const card = statCard(nodeForVersion(scouted.id) ?? "");
  const delta = card.avg - card.avgBaseline;
  const signed = delta > 0 ? `+${delta}` : String(delta);
  const tierKey = tier(scouted.rating);

  return (
    <BroadcastFrame
      rootRef={ref}
      tone="emerald"
      segment={broadcastCopy.segments.eval}
      live={air.live}
      moving={moving}
      meta={
        <>
          <span className="text-foreground/70">
            {ev.avg} <span className="font-semibold" style={{ color: BRAND_VAR.emerald }}>{card.avg}</span>
          </span>
          <span className="text-foreground/70">
            {ev.deltaVsBaseline} <span className="font-semibold" style={{ color: delta >= 0 ? BRAND_VAR.emerald : BRAND_VAR.rose }}>{signed}</span>
          </span>
        </>
      }
      footer={
        <Ticker
          label={c.ticker}
          tone="emerald"
          text={fillTemplate(c.tickerCard, { version: scouted.id, delta: signed, rank: card.leagueRank, total: LEAGUE_SIZE })}
          moving={moving}
        />
      }
    >
      <div className="grid h-full gap-4 p-4 md:grid-cols-[15rem_minmax(0,1fr)] stage:py-3">
        {/* the card itself: who, overall, tier, league rank, the hex */}
        <div className="flex min-h-0 flex-col gap-2 rounded-lg border p-3" style={{ borderColor: tint("emerald", 40), background: `linear-gradient(160deg, ${tint("emerald", 14)}, transparent 60%)` }}>
          <div role="group" aria-label={c.scout} className="flex gap-1.5">
            {ledger.rows.map((r) => {
              const on = r.id === scouted.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setScout(r.id)}
                  className={`${SLANT} inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 hover:border-glass-hover`}
                  style={{ borderColor: on ? BRAND_VAR.emerald : "var(--border-glass)", background: on ? tint("emerald", 16) : "transparent", color: on ? BRAND_VAR.emerald : "var(--foreground)" }}
                >
                  {r.id}
                  {r.id === ledger.liveId && <>
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_VAR.rose }} />
                      <span className="sr-only">{t.labVersions.live}</span>
                    </>}
                </button>
              );
            })}
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className={`${SLANT} text-3xl leading-none text-foreground`}>{scouted.id}</div>
              <div className="mt-1 flex items-center gap-2">
                <Plate tone={tierKey === "elite" ? "amber" : "emerald"}>{c.tiers[tierKey]}</Plate>
                <span className="font-mono text-sm tabular-nums text-foreground/80">
                  <span aria-hidden>{fillTemplate(c.leagueRank, { rank: card.leagueRank, total: LEAGUE_SIZE })}</span>
                  <span className="sr-only">{fillTemplate(c.rankAria, { rank: card.leagueRank, total: LEAGUE_SIZE })}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-5xl font-black italic leading-none tabular-nums" style={{ color: BRAND_VAR.emerald }}>
                {scouted.rating}
              </div>
              <div className={`${CAPS} text-sm text-foreground/70`}>{c.ovr}</div>
            </div>
          </div>
          <div className="relative min-h-[11rem] flex-1 stage:min-h-0">
            <div className="absolute inset-0">
              <HexChart attributes={card.attributes} moving={moving} />
            </div>
          </div>
        </div>

        {/* the attribute bars */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/70">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-3 w-0.5 rounded-full bg-foreground/70" /> {c.baselineRef}
            </span>
            <span className="font-mono">{fillTemplate(ev.footer, { dimensions: card.attributes.length, runs: EVAL_SAMPLE_RUNS })}</span>
          </div>
          <div className="min-h-0 flex-1">
            <AttributeRows key={scouted.id} attributes={card.attributes} moving={moving} />
          </div>
        </div>
      </div>
    </BroadcastFrame>
  );
}
