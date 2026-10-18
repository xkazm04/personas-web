import dynamic from "next/dynamic";
import { Activity, DollarSign } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { fadeUp } from "@/lib/animations";
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";
import type { ComparePoint } from "@/components/dashboard/CostChartWithCompare";
import type { ObservabilityLabels } from "./performanceViewTypes";
import { ChartEmptyNote } from "../ChartEmptyNote";

/** Both charts render a 240px ResponsiveContainer. */
const CHART_HEIGHT = 240;

// T3 bodies. Each named loader is shared by dynamic() and its <Deferred>
// slot's `preload`: the chunk downloads with the frame, the mount waits for
// the view's arrival queue. The slot owns the wait, so the chunk's `loading`
// is just a held block of the chart's height.
const loadCostChart = () => import("@/components/dashboard/CostChartWithCompare");
const loadExecChart = () => import("@/components/dashboard/ExecChartWithCompare");
const CostChartWithCompare = dynamic(loadCostChart, { ssr: false, loading: ChartHold });
const ExecChartWithCompare = dynamic(loadExecChart, { ssr: false, loading: ChartHold });

function ChartHold() {
  return <div aria-hidden style={{ height: CHART_HEIGHT }} />;
}

export function PerformanceChartGrid({
  costChartData,
  execChartData,
  compareEnabled,
  costPrevious = [],
  execPrevious = [],
  annotations = [],
  failed = false,
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
  /** The read failed with nothing held: the slots say so instead of "nothing in this window". */
  failed?: boolean;
  labels: ObservabilityLabels;
}) {
  // No run in the window: both charts would draw axes around a flat zero. Cost
  // without a run is not a measured zero either, so it shares the predicate.
  const noRuns = execChartData.every((d) => d.Successes + d.Failures === 0);
  const costEmpty = noRuns && costChartData.every((d) => d.Cost === 0);
  const emptyText = failed ? labels.chartLoadFailed : labels.nothingInWindow;
  return (
    <div className={`${ARRIVE} grid gap-6 lg:grid-cols-2 mb-8`} style={arriveAt(3)}>
      <GlowCard accent="cyan" variants={fadeUp} className="p-5">
        <ChartTitle icon={<DollarSign className="h-4 w-4 text-brand-cyan" />} title={labels.costOverTime} compareEnabled={compareEnabled} compareLabel={labels.previousPeriod} />
        {costEmpty ? (
          <ChartEmptyNote height={CHART_HEIGHT} text={emptyText} />
        ) : (
          <Deferred minHeight={CHART_HEIGHT} order={0} preload={loadCostChart}>
            <CostChartWithCompare data={costChartData} compare={compareEnabled} previousSeries={costPrevious} annotations={annotations} />
          </Deferred>
        )}
      </GlowCard>
      <GlowCard accent="emerald" variants={fadeUp} className="p-5">
        <ChartTitle icon={<Activity className="h-4 w-4 text-emerald-400" />} title={labels.executionHealth} compareEnabled={compareEnabled} compareLabel={labels.previousPeriod} />
        {noRuns ? (
          <ChartEmptyNote height={CHART_HEIGHT} text={emptyText} />
        ) : (
          <Deferred minHeight={CHART_HEIGHT} order={1} preload={loadExecChart}>
            <ExecChartWithCompare data={execChartData} compare={compareEnabled} previousSeries={execPrevious} annotations={annotations} />
          </Deferred>
        )}
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
