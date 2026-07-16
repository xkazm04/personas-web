import dynamic from "next/dynamic";
import { Activity, DollarSign } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { fadeUp } from "@/lib/animations";
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";
import type { ComparePoint } from "@/components/dashboard/CostChartWithCompare";
import type { ObservabilityLabels } from "./performanceViewTypes";

const CostChartWithCompare = dynamic(() => import("@/components/dashboard/CostChartWithCompare"), { ssr: false });
const ExecChartWithCompare = dynamic(() => import("@/components/dashboard/ExecChartWithCompare"), { ssr: false });

export function PerformanceChartGrid({
  costChartData,
  execChartData,
  compareEnabled,
  costPrevious = [],
  execPrevious = [],
  annotations = [],
  labels,
}: {
  costChartData: { date: string; Cost: number }[];
  execChartData: { date: string; Successes: number; Failures: number }[];
  compareEnabled: boolean;
  /** Previous-period + annotation fixtures, supplied only in demo mode so
   *  real users never see fabricated comparisons/incidents on genuine data. */
  costPrevious?: ComparePoint[];
  execPrevious?: ComparePoint[];
  annotations?: ChartAnnotation[];
  labels: ObservabilityLabels;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 mb-8">
      <GlowCard accent="cyan" variants={fadeUp} className="p-5">
        <ChartTitle icon={<DollarSign className="h-4 w-4 text-brand-cyan" />} title={labels.costOverTime} compareEnabled={compareEnabled} compareLabel={labels.previousPeriod} />
        <CostChartWithCompare data={costChartData} compare={compareEnabled} previousSeries={costPrevious} annotations={annotations} />
      </GlowCard>
      <GlowCard accent="emerald" variants={fadeUp} className="p-5">
        <ChartTitle icon={<Activity className="h-4 w-4 text-emerald-400" />} title={labels.executionHealth} compareEnabled={compareEnabled} compareLabel={labels.previousPeriod} />
        <ExecChartWithCompare data={execChartData} compare={compareEnabled} previousSeries={execPrevious} annotations={annotations} />
      </GlowCard>
    </div>
  );
}

function ChartTitle({ icon, title, compareEnabled, compareLabel }: { icon: React.ReactNode; title: string; compareEnabled: boolean; compareLabel: string }) {
  return (
    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
      {icon}
      {title}
      {compareEnabled && <span className="ml-auto text-sm text-purple-400/70 font-normal">{compareLabel}</span>}
    </h3>
  );
}
