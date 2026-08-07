"use client";

import { Layers } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { DirectorValueBreakdown } from "@/lib/mock-dashboard-data";

type BandKey = keyof DirectorValueBreakdown;

const BAND_ORDER: BandKey[] = ["delivered", "partial", "blocked", "noInput", "unassessed"];

const BAND_TONE: Record<BandKey, { bar: string; dot: string }> = {
  delivered: { bar: "bg-emerald-400", dot: "bg-emerald-400" },
  partial: { bar: "bg-amber-400", dot: "bg-amber-400" },
  blocked: { bar: "bg-rose-400", dot: "bg-rose-400" },
  noInput: { bar: "bg-cyan-400", dot: "bg-cyan-400" },
  unassessed: { bar: "bg-white/30", dot: "bg-white/40" },
};

/**
 * Value breakdown — where the fleet's assessed runs landed: delivered /
 * partial / blocked / no input / unassessed, as a stacked proportion bar with
 * a counted legend. Desktop parity: the Director tab's ValueLeakBar.
 */
export function ValueBreakdownCard({
  breakdown,
  total,
}: {
  breakdown: DirectorValueBreakdown;
  total: number;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.breakdown;

  return (
    <GlowCard accent="emerald" className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-emerald-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.title}</h2>
        <span className="ml-auto text-sm tabular-nums text-muted-dark">{total}</span>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-dark">{lp.empty}</p>
      ) : (
        <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
            {BAND_ORDER.map((key) =>
              breakdown[key] > 0 ? (
                <div
                  key={key}
                  className={BAND_TONE[key].bar}
                  style={{ width: `${(breakdown[key] / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {BAND_ORDER.map((key) => (
              <span key={key} className="flex items-center gap-1.5 text-muted-dark">
                <span className={`h-2 w-2 rounded-full ${BAND_TONE[key].dot}`} />
                {lp.bands[key]}
                <span className="font-semibold tabular-nums text-foreground">{breakdown[key]}</span>
                <span className="tabular-nums">
                  {Math.round((breakdown[key] / total) * 100)}%
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </GlowCard>
  );
}
