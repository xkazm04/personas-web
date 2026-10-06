"use client";

import { DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import type { ObservabilityLabels } from "./performanceViewTypes";
import { useSparklines } from "./useSparklines";

export function PerformanceMetricsGrid({
  metrics,
  labels,
}: {
  metrics: {
    totalCost?: number;
    costTrend?: number;
    totalExecutions?: number;
    execTrend?: number;
    successRate?: number;
    successTrend?: number;
    activePersonas?: number;
  } | null;
  labels: ObservabilityLabels;
}) {
  const { data: sparklines, error, retry } = useSparklines();
  return (
    <>
      {error && <DashboardErrorBanner message={error} onRetry={retry} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard icon={DollarSign} label={labels.totalCost} value={`$${(metrics?.totalCost ?? 0).toFixed(2)}`} trend={metrics?.costTrend} trendLabel="vs last period" accent="cyan" sparklineData={sparklines.cost} goodDirection="down" />
        <MetricCard icon={Zap} label={labels.executions} value={String(metrics?.totalExecutions ?? 0)} trend={metrics?.execTrend} trendLabel="vs last period" accent="purple" sparklineData={sparklines.executions} />
        <MetricCard icon={TrendingUp} label={labels.successRate} value={`${(metrics?.successRate ?? 0).toFixed(1)}%`} trend={metrics?.successTrend} trendLabel="vs last period" accent="emerald" sparklineData={sparklines.success} />
        <MetricCard icon={Users} label={labels.activePersonas} value={String(metrics?.activePersonas ?? 0)} accent="amber" sparklineData={sparklines.agents} />
      </div>
    </>
  );
}
