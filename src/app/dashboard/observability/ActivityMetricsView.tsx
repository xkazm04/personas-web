"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import CompareToggle from "@/components/dashboard/CompareToggle";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { AthenaUsageCard } from "./activity-view/AthenaUsageCard";
import { ValueRollupCard } from "./activity-view/ValueRollupCard";
import { useActivityMetrics } from "./activity-view/useActivityMetrics";

/**
 * Activity Metrics tab: Athena (Companion) cost-by-action stacked area +
 * value-delivered rollup, with a compare toggle that overlays the previous
 * period on both. Demo-only. Mirrors the desktop overview's Activity Metrics.
 */
export default function ActivityMetricsView() {
  const [compare, setCompare] = useState(false);
  const { athenaUsage, valueRollup, isLoading, error, retry } = useActivityMetrics();

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
    </div>
  );
}
