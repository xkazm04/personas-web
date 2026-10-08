"use client";

import { useState } from "react";
import { CloudOff, Loader2 } from "lucide-react";

import CompareToggle from "@/components/dashboard/CompareToggle";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import { useTranslation } from "@/i18n/useTranslation";
import { AthenaActionMixCard } from "./activity-view/AthenaActionMixCard";
import { AthenaSpendLane } from "./activity-view/AthenaSpendLane";
import { AthenaUsageCard } from "./activity-view/AthenaUsageCard";
import { ValueRollupCard } from "./activity-view/ValueRollupCard";
import { useActivityMetrics } from "./activity-view/useActivityMetrics";

/**
 * Activity Metrics tab: Athena (Companion) cost-by-action stacked area +
 * value-delivered rollup (compare toggle overlays the previous period on
 * both), then the Athena lane — op-grammar action-type cost mix + the
 * turn-ledger spend summary (no compare; point-in-time totals). Demo-only — a
 * real (non-demo) session sees an empty state instead. Mirrors the desktop
 * overview's Activity tab.
 */
export default function ActivityMetricsView() {
  const { t } = useTranslation();
  const [compare, setCompare] = useState(false);
  const { athenaUsage, valueRollup, athenaActionMix, athenaLedger, isLoading, error, retry, liveUnavailable } =
    useActivityMetrics();

  // No synced source for Athena cost or value outcomes: say so rather than
  // presenting the demo fixture (or an endless spinner) as the tenant's own.
  if (liveUnavailable) {
    return (
      <EmptyState
        icon={CloudOff}
        title={t.dashboardUi.liveUnavailableTitle}
        description={t.dashboardUi.liveUnavailableDescription}
      />
    );
  }

  // A failed fetch would otherwise spin forever (valueRollup never arrives);
  // surface the error with a retry instead.
  if (error && !valueRollup) {
    return <DashboardErrorBanner message={error} onRetry={retry} />;
  }

  if (isLoading || !valueRollup) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <CompareToggle enabled={compare} onToggle={() => setCompare((prev) => !prev)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <AthenaUsageCard data={athenaUsage} compare={compare} />
        <ValueRollupCard rollup={valueRollup} compare={compare} />
      </div>
      {athenaLedger && (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <AthenaActionMixCard actions={athenaActionMix} />
          <AthenaSpendLane ledger={athenaLedger} />
        </div>
      )}
    </div>
  );
}
