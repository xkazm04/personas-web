"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { ScoreBand } from "@/components/dashboard/ScoreDistributionChart";
import type { DirectorScoreBand } from "@/lib/mock-dashboard-data";

import { scoreTone, type RosterFacet } from "./directorMeta";

// recharts (+ d3) is a 344 KB chunk; importing it here put it in this route's
// first load. Deferred, it is fetched when the card mounts. Matches
// PerformanceLatencyCard / PerformanceSpendCard on the observability route.
const ScoreDistributionChart = dynamic(
  () => import("@/components/dashboard/ScoreDistributionChart"),
  {
    ssr: false,
    loading: () => <div className="h-[200px] animate-pulse rounded-lg bg-white/[0.03]" />,
  },
);

/**
 * Score distribution — how the latest 0–5 verdicts spread across the coaching
 * scope, always six bands. Clicking a band filters the coaching table to
 * agents at that score; the header pill carries the portfolio mean. Desktop
 * parity: the Director tab's ScoreDistribution histogram.
 */
export function ScoreDistributionCard({
  distribution,
  avgScore,
  facet,
  onFacetChange,
}: {
  distribution: DirectorScoreBand[];
  avgScore: number | null;
  facet: RosterFacet | null;
  onFacetChange: (facet: RosterFacet | null) => void;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.distribution;
  const hasScores = distribution.some((band) => band.count > 0);
  const selectedScore = facet?.type === "score" ? facet.score : null;

  // Resolve the per-band colour here so the chart module stays free of
  // director-page imports (and so importing it cannot drag recharts back in).
  const bands = useMemo<ScoreBand[]>(
    () =>
      distribution.map((band) => ({
        score: band.score,
        count: band.count,
        fill: scoreTone(band.score).series,
      })),
    [distribution],
  );

  return (
    <GlowCard accent="purple" className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.title}</h2>
        {avgScore !== null && (
          <span className="ml-auto rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-sm font-medium tabular-nums text-purple-300">
            {lp.avgLabel} {avgScore.toFixed(1)}
          </span>
        )}
      </div>

      {!hasScores ? (
        <p className="flex flex-1 items-center justify-center py-8 text-sm text-muted-dark">
          {lp.empty}
        </p>
      ) : (
        <ScoreDistributionChart
          bands={bands}
          selectedScore={selectedScore}
          onSelectScore={(score) =>
            onFacetChange(selectedScore === score ? null : { type: "score", score })
          }
          agentsLabel={lp.agents}
        />
      )}
    </GlowCard>
  );
}
