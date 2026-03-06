"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Wrench,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import EmptyState from "@/components/dashboard/EmptyState";
import useSWR from "swr";
import { api } from "@/lib/api";
import { CHART_COLORS } from "@/lib/constants";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const _toolNameCache = new Map<string, string>();
function formatToolName(name: string): string {
  const cached = _toolNameCache.get(name);
  if (cached) return cached;
  const formatted = name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  _toolNameCache.set(name, formatted);
  return formatted;
}

function useDeferredMount(rootMargin = "220px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return { ref, mounted };
}

function ChartCardSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse rounded-xl bg-white/[0.03]" style={{ height }} />;
}

function InsightBadge({ text }: { text: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-2 text-[11px] text-purple-300">
      <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-400" />
      <span>{text}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsagePage() {
  const { data, isLoading: loading } = useSWR("usage", api.getUsageAnalytics, {
    dedupingInterval: 8_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const toolUsage = data?.toolUsage ?? [];
  const toolUsageOverTime = data?.toolUsageOverTime ?? [];
  const toolUsageByPersona = data?.toolUsageByPersona ?? [];

  // Bar chart data: sorted by invocations desc, capped at top 15 + "Other"
  const MAX_BAR_TOOLS = 15;
  const barData = useMemo(() => {
    const sorted = [...toolUsage].sort((a, b) => b.invocations - a.invocations);
    const top = sorted.slice(0, MAX_BAR_TOOLS).map((t, i) => ({
      name: formatToolName(t.toolName),
      invocations: t.invocations,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
    if (sorted.length > MAX_BAR_TOOLS) {
      const otherTotal = sorted
        .slice(MAX_BAR_TOOLS)
        .reduce((sum, t) => sum + t.invocations, 0);
      top.push({
        name: "Other",
        invocations: otherTotal,
        fill: "#64748b",
      });
    }
    return top;
  }, [toolUsage]);

  // Pie chart data
  const pieData = useMemo(
    () =>
      toolUsage.map((t, i) => ({
        name: formatToolName(t.toolName),
        value: t.invocations,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [toolUsage],
  );

  const totalInvocations = useMemo(
    () => toolUsage.reduce((acc, t) => acc + t.invocations, 0),
    [toolUsage],
  );

  const topTools = useMemo(
    () =>
      [...toolUsage]
        .sort((a, b) => b.invocations - a.invocations)
        .slice(0, 5)
        .map((t) => t.toolName),
    [toolUsage],
  );

  // Stacked area data — references topTools to avoid duplicate sort+slice
  const areaData = useMemo(() => {
    return toolUsageOverTime.map((d) => {
      const row: Record<string, string | number> = { date: d.date.slice(5) };
      topTools.forEach((tool) => {
        row[tool] = d.tools[tool] ?? 0;
      });
      return row;
    });
  }, [toolUsageOverTime, topTools]);

  // Per-persona bar data
  const personaBarData = useMemo(
    () =>
      toolUsageByPersona.map((p) => {
        const row: Record<string, string | number> = { name: p.personaName };
        Object.entries(p.tools).forEach(([tool, count]) => {
          row[formatToolName(tool)] = count;
        });
        return row;
      }),
    [toolUsageByPersona],
  );

  const allToolNames = useMemo(() => {
    const names = new Set<string>();
    toolUsageByPersona.forEach((p) =>
      Object.keys(p.tools).forEach((t) => names.add(formatToolName(t))),
    );
    return Array.from(names);
  }, [toolUsageByPersona]);

  // Insight text
  const insight = useMemo(() => {
    if (toolUsage.length < 2) return null;
    const top = toolUsage[0];
    const second = toolUsage[1];
    if (!top || !second) return null;
    const ratio = (top.invocations / second.invocations).toFixed(1);
    return `${formatToolName(top.toolName)} is used ${ratio}x more than ${formatToolName(second.toolName)}, making it your most utilized tool integration.`;
  }, [toolUsage]);

  const overTimeDeferred = useDeferredMount("260px");
  const byPersonaDeferred = useDeferredMount("260px");

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  if (toolUsage.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText>Usage Analytics</GradientText>
          </h1>
        </motion.div>
        <EmptyState
          icon={BarChart3}
          title="No usage data"
          description="Tool usage analytics will appear here once agents start running executions"
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Usage Analytics</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Tool utilization patterns across your agent fleet
        </p>
      </motion.div>

      {/* Top row: invocations bar + distribution pie */}
      <div className="grid gap-6 lg:grid-cols-5 mb-8">
        {/* Tool invocations ranking */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-brand-cyan" />
            Tool Invocations
          </h3>
          <UsageInvocationsBarChart barData={barData} formatToolName={formatToolName} />
          {insight && <InsightBadge text={insight} />}
        </GlowCard>

        {/* Distribution pie */}
        <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-purple" />
            Distribution
          </h3>
          <UsageDistributionPieChart
            pieData={pieData}
            totalInvocations={totalInvocations}
            formatToolName={formatToolName}
          />
        </GlowCard>
      </div>

      {/* Middle: Usage over time */}
      <div ref={overTimeDeferred.ref}>
        <GlowCard accent="emerald" variants={fadeUp} className="p-5 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            Usage Over Time
            <span className="text-[11px] text-muted-dark font-normal ml-auto">Last 14 days</span>
          </h3>
          {overTimeDeferred.mounted ? (
            <UsageOverTimeAreaChart
              areaData={areaData}
              topTools={topTools}
              formatToolName={formatToolName}
            />
          ) : (
            <ChartCardSkeleton height={280} />
          )}
        </GlowCard>
      </div>

      {/* Bottom: Per-persona usage */}
      <div ref={byPersonaDeferred.ref}>
        <GlowCard accent="amber" variants={fadeUp} className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            Tool Usage by Agent
          </h3>
          {byPersonaDeferred.mounted ? (
            <UsageByPersonaBarChart
              personaBarData={personaBarData}
              allToolNames={allToolNames}
              formatToolName={formatToolName}
            />
          ) : (
            <ChartCardSkeleton height={240} />
          )}
        </GlowCard>
      </div>
    </motion.div>
  );
}
