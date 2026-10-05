import dynamic from "next/dynamic";
import { BarChart3, Lightbulb, Wrench } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { fadeUp } from "@/lib/animations";

import { formatToolName } from "./usageViewData";

const UsageInvocationsBarChart = dynamic(
  () =>
    import("@/components/dashboard/UsageCharts").then(
      (mod) => mod.UsageInvocationsBarChart,
    ),
  { ssr: false },
);

const UsageDistributionPieChart = dynamic(
  () =>
    import("@/components/dashboard/UsageCharts").then(
      (mod) => mod.UsageDistributionPieChart,
    ),
  { ssr: false },
);

const UsageOverTimeAreaChart = dynamic(
  () =>
    import("@/components/dashboard/UsageCharts").then(
      (mod) => mod.UsageOverTimeAreaChart,
    ),
  { ssr: false },
);

const UsageByPersonaBarChart = dynamic(
  () =>
    import("@/components/dashboard/UsageCharts").then(
      (mod) => mod.UsageByPersonaBarChart,
    ),
  { ssr: false },
);

function ChartCardSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse rounded-xl bg-white/[0.03]" style={{ height }} />;
}

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
    <div className="grid gap-6 lg:grid-cols-5 mb-8">
      <GlowCard accent="cyan" variants={fadeUp} className="p-5 lg:col-span-3">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-brand-cyan" />
          {labels.toolInvocations}
        </h3>
        <UsageInvocationsBarChart barData={barData} formatToolName={formatToolName} />
        {insight && <InsightBadge text={insight} />}
      </GlowCard>

      <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand-purple" />
          {labels.distribution}
        </h3>
        <UsageDistributionPieChart
          pieData={pieData}
          totalInvocations={totalInvocations}
          formatToolName={formatToolName}
        />
      </GlowCard>
    </div>
  );
}

export function UsageOverTimeCard({
  mounted,
  areaData,
  topTools,
  labels,
}: {
  mounted: boolean;
  areaData: Record<string, string | number>[];
  topTools: string[];
  labels: { usageOverTime: string; last14Days: string };
}) {
  return (
    <GlowCard accent="emerald" variants={fadeUp} className="p-5 mb-8">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-emerald-400" />
        {labels.usageOverTime}
        <span className="text-sm text-muted-dark font-normal ml-auto">{labels.last14Days}</span>
      </h3>
      {mounted ? (
        <UsageOverTimeAreaChart
          areaData={areaData}
          topTools={topTools}
          formatToolName={formatToolName}
        />
      ) : (
        <ChartCardSkeleton height={280} />
      )}
    </GlowCard>
  );
}

export function UsageByPersonaCard({
  mounted,
  personaBarData,
  allToolNames,
  title,
}: {
  mounted: boolean;
  personaBarData: Record<string, string | number>[];
  allToolNames: string[];
  title: string;
}) {
  return (
    <GlowCard accent="amber" variants={fadeUp} className="p-5">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-amber-400" />
        {title}
      </h3>
      {mounted ? (
        <UsageByPersonaBarChart
          personaBarData={personaBarData}
          allToolNames={allToolNames}
          formatToolName={formatToolName}
        />
      ) : (
        <ChartCardSkeleton height={240} />
      )}
    </GlowCard>
  );
}
