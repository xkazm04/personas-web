import { DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { SPARKLINE_AGENTS, SPARKLINE_COST, SPARKLINE_EXECUTIONS, SPARKLINE_SUCCESS } from "@/lib/mock-dashboard-data";
import type { ObservabilityLabels } from "./performanceViewTypes";

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
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
      <MetricCard icon={DollarSign} label={labels.totalCost} value={`$${(metrics?.totalCost ?? 0).toFixed(2)}`} trend={metrics?.costTrend} trendLabel="vs last period" accent="cyan" sparklineData={SPARKLINE_COST} goodDirection="down" />
      <MetricCard icon={Zap} label={labels.executions} value={String(metrics?.totalExecutions ?? 0)} trend={metrics?.execTrend} trendLabel="vs last period" accent="purple" sparklineData={SPARKLINE_EXECUTIONS} />
      <MetricCard icon={TrendingUp} label={labels.successRate} value={`${(metrics?.successRate ?? 0).toFixed(1)}%`} trend={metrics?.successTrend} trendLabel="vs last period" accent="emerald" sparklineData={SPARKLINE_SUCCESS} />
      <MetricCard icon={Users} label={labels.activePersonas} value={String(metrics?.activePersonas ?? 0)} accent="amber" sparklineData={SPARKLINE_AGENTS} />
    </div>
  );
}
