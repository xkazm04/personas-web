import dynamic from "next/dynamic";
import { BarChart3, Lightbulb, Wrench } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { fadeUp } from "@/lib/animations";

import { formatToolName } from "./usageViewData";

// All four charts live in one module (`UsageCharts`, recharts): one shared
// chunk behind one named loader. Every T3 slot passes it as `preload`, so the
// chunk downloads with the frame and only the mounts wait for the view's
// arrival queue (which also holds below-the-fold slots until they near the
// viewport). The slots own the wait, so each chunk's `loading` is a held,
// empty block of the chart's height - no pulse, no spinner.
const loadUsageCharts = () => import("@/components/dashboard/UsageCharts");

/** Real body heights (each chart's ResponsiveContainer height). */
const BAR_HEIGHT = 280;
const AREA_HEIGHT = 280;
const PERSONA_BAR_HEIGHT = 240;
const PIE_HEIGHT = 220;

/** The donut plus its legend: up to 5 text-sm rows (20px) spaced 6px, after mt-2. */
function pieBodyHeight(rows: number): number {
  const shown = Math.min(5, rows);
  return PIE_HEIGHT + 8 + (shown > 0 ? shown * 20 + (shown - 1) * 6 : 0);
}

function ChartHold({ height }: { height: number }) {
  return <div aria-hidden style={{ height }} />;
}

const UsageInvocationsBarChart = dynamic(
  () => loadUsageCharts().then((mod) => mod.UsageInvocationsBarChart),
  { ssr: false, loading: () => <ChartHold height={BAR_HEIGHT} /> },
);

const UsageDistributionPieChart = dynamic(
  () => loadUsageCharts().then((mod) => mod.UsageDistributionPieChart),
  { ssr: false, loading: () => <ChartHold height={PIE_HEIGHT} /> },
);

const UsageOverTimeAreaChart = dynamic(
  () => loadUsageCharts().then((mod) => mod.UsageOverTimeAreaChart),
  { ssr: false, loading: () => <ChartHold height={AREA_HEIGHT} /> },
);

const UsageByPersonaBarChart = dynamic(
  () => loadUsageCharts().then((mod) => mod.UsageByPersonaBarChart),
  { ssr: false, loading: () => <ChartHold height={PERSONA_BAR_HEIGHT} /> },
);

function InsightBadge({ text }: { text: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-2 text-sm text-purple-300">
      <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-400" />
      <span>{text}</span>
    </div>
  );
}

export function UsageTopCharts({
  labels,
  barData,
  pieData,
  totalInvocations,
  insight,
}: {
  labels: { toolInvocations: string; distribution: string };
  barData: { name: string; invocations: number; fill: string }[];
  pieData: { name: string; value: number; color: string }[];
  totalInvocations: number;
  insight: string | null;
}) {
  return (
    <div className={`${ARRIVE} grid gap-6 lg:grid-cols-5 mb-8`} style={arriveAt(1)}>
      <GlowCard accent="cyan" variants={fadeUp} className="p-5 lg:col-span-3">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-brand-cyan" />
          {labels.toolInvocations}
        </h3>
        <Deferred minHeight={BAR_HEIGHT} order={0} preload={loadUsageCharts}>
          <UsageInvocationsBarChart barData={barData} formatToolName={formatToolName} />
        </Deferred>
        {insight && <InsightBadge text={insight} />}
      </GlowCard>

      <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand-purple" />
          {labels.distribution}
        </h3>
        <Deferred minHeight={pieBodyHeight(pieData.length)} order={1} preload={loadUsageCharts}>
          <UsageDistributionPieChart
            pieData={pieData}
            totalInvocations={totalInvocations}
            formatToolName={formatToolName}
          />
        </Deferred>
      </GlowCard>
    </div>
  );
}

export function UsageOverTimeCard({
  areaData,
  topTools,
  labels,
}: {
  areaData: Record<string, string | number>[];
  topTools: string[];
  labels: { usageOverTime: string; last14Days: string };
}) {
  return (
    <div className={`${ARRIVE} mb-8`} style={arriveAt(2)}>
      <GlowCard accent="emerald" variants={fadeUp} className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          {labels.usageOverTime}
          <span className="text-sm text-muted-dark font-normal ml-auto">{labels.last14Days}</span>
        </h3>
        <Deferred minHeight={AREA_HEIGHT} order={2} preload={loadUsageCharts}>
          <UsageOverTimeAreaChart
            areaData={areaData}
            topTools={topTools}
            formatToolName={formatToolName}
          />
        </Deferred>
      </GlowCard>
    </div>
  );
}

export function UsageByPersonaCard({
  personaBarData,
  allToolNames,
  title,
}: {
  personaBarData: Record<string, string | number>[];
  allToolNames: string[];
  title: string;
}) {
  return (
    <div className={ARRIVE} style={arriveAt(3)}>
      <GlowCard accent="amber" variants={fadeUp} className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-400" />
          {title}
        </h3>
        <Deferred minHeight={PERSONA_BAR_HEIGHT} order={3} preload={loadUsageCharts}>
          <UsageByPersonaBarChart
            personaBarData={personaBarData}
            allToolNames={allToolNames}
            formatToolName={formatToolName}
          />
        </Deferred>
      </GlowCard>
    </div>
  );
}
