"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { useTranslation } from "@/i18n/useTranslation";
import { deltaVsBaseline, isRegression, type ArenaSide, type LedgerState } from "../../../ledger";
import { CAPS, SLANT } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { N, ROUNDS } from "./match";

export const SIDE_TONE: Record<ArenaSide, BrandKey> = { A: "cyan", B: "amber" };

/**
 * The scorebug: both contenders as the ledger names and rates them (rating,
 * Δ vs the pinned baseline, the LIVE tag), the series tally, and one pip per
 * round coloured by who took it.
 */
export default function Scorebug({
  contenders,
  ledger,
  shown,
  round,
  final,
  moving,
}: {
  contenders: Record<ArenaSide, string>;
  ledger: LedgerState;
  shown: number;
  round: number;
  final: boolean;
  moving: boolean;
}) {
  const c = broadcastCopy.arena;
  const wins = { A: 0, B: 0 };
  for (let i = 0; i < shown; i++) wins[ROUNDS[i].winner]++;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch border-b border-glass">
      {(["A", "B"] as const).map((side) => {
        const id = contenders[side];
        const row = ledger.rows.find((r) => r.id === id);
        const delta = deltaVsBaseline(ledger, id);
        const tone = SIDE_TONE[side];
        const team = (
          <div key={side} className={`flex min-w-0 items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3 ${side === "B" ? "flex-row-reverse text-right" : ""}`} style={{ background: `linear-gradient(${side === "A" ? "90deg" : "270deg"}, ${tint(tone, 16)}, transparent)` }}>
            <span className={`${CAPS} hidden h-9 w-9 shrink-0 sm:flex -skew-x-12 items-center justify-center rounded-sm text-xl`} style={{ background: BRAND_VAR[tone], color: "var(--background)" }}>
              <span className="skew-x-12">{side}</span>
            </span>
            <div className="min-w-0">
              <div className={`flex items-center gap-2 ${side === "B" ? "justify-end" : ""}`}>
                <span className={`${SLANT} truncate text-lg text-foreground`}>{id}</span>
                {id === ledger.liveId && <LiveTag />}
              </div>
              <div className="font-mono text-sm tabular-nums text-foreground/70">
                {c.rating} <span className="font-semibold text-foreground">{row?.rating ?? "—"}</span>
                {delta !== null && (
                  <span className="ml-2 hidden font-semibold sm:inline" style={{ color: isRegression(delta) ? BRAND_VAR.rose : delta >= 0 ? BRAND_VAR.emerald : BRAND_VAR.amber }}>
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                )}
              </div>
            </div>
            <motion.span
              key={wins[side]}
              className={`font-mono text-3xl font-black italic tabular-nums sm:text-4xl ${side === "B" ? "mr-auto" : "ml-auto"}`}
              style={{ color: BRAND_VAR[tone] }}
              initial={moving ? { y: -14, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={beat(moving, 0.35)}
            >
              {wins[side]}
            </motion.span>
          </div>
        );
        if (side === "A") return team;
        return [<RoundClock key="clock" round={round} final={final} shown={shown} />, team];
      })}
    </div>
  );
}

function LiveTag() {
  const { t } = useTranslation();
  return (
    <span className={`${CAPS} rounded-sm px-1.5 text-sm`} style={{ background: tint("emerald", 16), color: BRAND_VAR.emerald }}>
      {t.labVersions.live}
    </span>
  );
}

function RoundClock({ round, final, shown }: { round: number; final: boolean; shown: number }) {
  const c = broadcastCopy.arena;
  return (
    <div className="flex flex-col items-center justify-center gap-1 border-x border-glass bg-foreground/[0.04] px-2 py-1.5 sm:px-3">
      <span className="font-mono text-base font-black uppercase italic tabular-nums text-foreground">
        {final ? c.final : `${fillTemplate(c.roundShort, { n: round + 1 })} / ${N}`}
      </span>
      <span className="flex gap-1" aria-hidden>
        {ROUNDS.map((r, i) => (
          <span
            key={r.id}
            className="h-1.5 w-3 -skew-x-12 rounded-sm transition-colors duration-300"
            style={{ background: i < shown ? BRAND_VAR[SIDE_TONE[r.winner]] : "color-mix(in srgb, var(--foreground) 15%, transparent)" }}
          />
        ))}
      </span>
    </div>
  );
}
