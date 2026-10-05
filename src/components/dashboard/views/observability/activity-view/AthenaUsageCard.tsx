"use client";

import { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { AthenaAction } from "@/components/dashboard/AthenaUsageChart";
import { SERIES } from "@/lib/chart-theme";
import type { AthenaUsagePoint } from "@/lib/mock-dashboard-data";

// recharts (+ d3) is a 344 KB chunk. Imported directly by this card it landed
// in the first load of every route rendering it; deferred, it is fetched when
// the card mounts. Matches PerformanceLatencyCard / PerformanceSpendCard.
const AthenaUsageChart = dynamic(() => import("@/components/dashboard/AthenaUsageChart"), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-lg bg-white/[0.03]" />,
});

const ATHENA_ACTIONS: readonly AthenaAction[] = [
  { key: "invoke", color: SERIES.cyan },
  { key: "recall", color: SERIES.violet },
  { key: "fallback", color: SERIES.amber },
];

/**
 * Athena (Companion) usage: a stacked area of daily cost by action — invoke /
 * recall / fallback — with a dashed previous-period total overlaid when compare
 * is on. The web counterpart to the desktop overview's Athena Usage chart.
 */
export const AthenaUsageCard = memo(function AthenaUsageCard({
  data,
  compare,
}: {
  data: AthenaUsagePoint[];
  compare: boolean;
}) {
  const { t } = useTranslation();
  const lp = t.observabilityPage;
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.invoke + d.recall + d.fallback, 0),
    [data],
  );

  return (
    <GlowCard accent="purple" className="p-5 lg:col-span-3">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <div>
            <h2 className="text-base font-semibold text-foreground">{lp.athenaUsage}</h2>
            <p className="text-sm text-muted-dark">{lp.athenaSubtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-foreground">${total.toFixed(2)}</p>
          <p className="text-sm text-muted-dark">{lp.last14Days}</p>
        </div>
      </div>

      <AthenaUsageChart
        data={data}
        compare={compare}
        labels={{
          invoke: lp.athenaActions.invoke,
          recall: lp.athenaActions.recall,
          fallback: lp.athenaActions.fallback,
          previous: lp.previousPeriod,
        }}
        actions={ATHENA_ACTIONS}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-dark">
        {ATHENA_ACTIONS.map((a) => (
          <span key={a.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
            {lp.athenaActions[a.key]}
          </span>
        ))}
        {compare && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3" style={{ backgroundColor: SERIES.rose }} />
            {lp.previousPeriod}
          </span>
        )}
      </div>
    </GlowCard>
  );
});
