"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import type { DirectorMomentum, DirectorRosterEntry } from "@/lib/mock-dashboard-data";

import { MOMENTUM_ORDER, momentumCounts, type RosterFacet } from "./directorMeta";

const MOMENTUM_META: Record<
  DirectorMomentum,
  { Icon: React.ElementType; chip: string; activeRing: string }
> = {
  improving: {
    Icon: TrendingUp,
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    activeRing: "ring-1 ring-inset ring-emerald-400/60",
  },
  flat: {
    Icon: Minus,
    chip: "border-glass bg-white/[0.04] text-muted-dark",
    activeRing: "ring-1 ring-inset ring-white/40",
  },
  declining: {
    Icon: TrendingDown,
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    activeRing: "ring-1 ring-inset ring-rose-400/60",
  },
};

/**
 * Momentum summary — improving / flat / declining verdict-trend buckets across
 * the coaching scope. Each chip filters the coaching table; re-clicking clears.
 * When nothing is moving in either direction it collapses to a single
 * "holding steady" line (desktop parity).
 */
export function MomentumStrip({
  roster,
  facet,
  onFacetChange,
}: {
  roster: DirectorRosterEntry[];
  facet: RosterFacet | null;
  onFacetChange: (facet: RosterFacet | null) => void;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.momentum;
  const counts = momentumCounts(roster);
  const moving = counts.improving > 0 || counts.declining > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-dark">
        {lp.label}
      </span>
      {!moving ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-dark">
          <Minus className="h-3.5 w-3.5" />
          {lp.steady}
        </span>
      ) : (
        MOMENTUM_ORDER.map((momentum) => {
          const count = counts[momentum];
          if (count === 0) return null;
          const meta = MOMENTUM_META[momentum];
          const active = facet?.type === "momentum" && facet.momentum === momentum;
          return (
            <button
              key={momentum}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onFacetChange(active ? null : { type: "momentum", momentum })
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium tabular-nums transition-colors hover:bg-white/[0.06] focus-ring focus-visible:ring-offset-0 ${meta.chip} ${active ? meta.activeRing : ""}`}
            >
              <meta.Icon className="h-3.5 w-3.5" />
              {count} {lp[momentum]}
            </button>
          );
        })
      )}
    </div>
  );
}
