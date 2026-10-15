"use client";

import { DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import DrillToRuns from "@/components/dashboard/drill/DrillToRuns";
import type { MetricDrill } from "@/lib/metricDrill";
import type { ObservabilityLabels } from "./performanceViewTypes";
import { useSparklines } from "./useSparklines";

export function PerformanceMetricsGrid({
  metrics,
  labels,
  drill = null,
  population = null,
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
  /** The window's runs (demo): the cost and executions tiles open them. */
  drill?: MetricDrill | null;
  /** Which agents the tiles cover (demo). */
  population?: string | null;
}) {
  const { data: sparklines, error, retry } = useSparklines();
  return (
    <>
      {error && <DashboardErrorBanner message={error} onRetry={retry} />}
      {population && <p className="mb-3 text-sm text-muted-dark">{population}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard icon={DollarSign} label={labels.totalCost} value={`${(metrics?.totalCost ?? 0).toFixed(2)}`} trend={metrics?.costTrend} trendLabel="vs last period" accent="cyan" sparklineData={sparklines.cost} goodDirection="down" footer={drill && <DrillToRuns drill={drill} />} />
        <MetricCard icon={Zap} label={labels.executions} value={String(metrics?.totalExecutions ?? 0)} trend={metrics?.execTrend} trendLabel="vs last period" accent="purple" sparklineData={sparklines.executions} footer={drill && <DrillToRuns drill={drill} />} />
        <MetricCard icon={TrendingUp} label={labels.successRate} value={`${(metrics?.successRate ?? 0).toFixed(1)}%`} trend={metrics?.successTrend} trendLabel="vs last period" accent="emerald" sparklineData={sparklines.success} />
        <MetricCard icon={Users} label={labels.activePersonas} value={String(metrics?.activePersonas ?? 0)} accent="amber" sparklineData={sparklines.agents} />
      </div>
    </>
  );
}
