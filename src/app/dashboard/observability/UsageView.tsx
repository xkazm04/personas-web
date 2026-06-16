"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Loader2 } from "lucide-react";
import useSWR from "swr";

import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { fadeUp } from "@/lib/animations";
import { CHART_COLORS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";

import {
  MOCK_TOOL_USAGE,
  MOCK_TOOL_USAGE_BY_PERSONA,
  MOCK_TOOL_USAGE_OVER_TIME,
  formatToolName,
} from "./usage-view/usageViewData";
import { useDeferredMount } from "./usage-view/useDeferredMount";
import {
  UsageByPersonaCard,
  UsageOverTimeCard,
  UsageTopCharts,
} from "./usage-view/UsageChartCards";

const MAX_BAR_TOOLS = 15;

export default function UsageView() {
  const { t } = useTranslation();
  const isDemo = useAuthStore((s) => s.isDemo);
  const { data, isLoading: loading, error, mutate } = useSWR("usage", api.getUsageAnalytics, {
    dedupingInterval: 8_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const errorMsg = error instanceof Error ? error.message : error ? String(error) : null;
  // Demo mode renders the illustrative MOCK_* fixtures (and the example-data
  // notice). Real mode uses the genuine — possibly empty — analytics, never the
  // mock; an empty real dataset renders the empty charts honestly.
  const hasRealData = (data?.toolUsage ?? []).length > 0;
  const useMock = isDemo && !hasRealData;
  const toolUsage = useMemo(
    () => (useMock ? MOCK_TOOL_USAGE : (data?.toolUsage ?? [])),
    [useMock, data],
  );
  const toolUsageOverTime = useMemo(
    () => (useMock ? MOCK_TOOL_USAGE_OVER_TIME : (data?.toolUsageOverTime ?? [])),
    [useMock, data],
  );
  const toolUsageByPersona = useMemo(
    () => (useMock ? MOCK_TOOL_USAGE_BY_PERSONA : (data?.toolUsageByPersona ?? [])),
    [useMock, data],
  );

  const barData = useMemo(() => {
    const sorted = [...toolUsage].sort((a, b) => b.invocations - a.invocations);
    const top = sorted.slice(0, MAX_BAR_TOOLS).map((tool, index) => ({
      name: formatToolName(tool.toolName),
      invocations: tool.invocations,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
    if (sorted.length > MAX_BAR_TOOLS) {
      const otherTotal = sorted
        .slice(MAX_BAR_TOOLS)
        .reduce((sum, tool) => sum + tool.invocations, 0);
      top.push({ name: t.observabilityPage.other, invocations: otherTotal, fill: "#64748b" });
    }
    return top;
  }, [toolUsage, t.observabilityPage.other]);

  const pieData = useMemo(
    () =>
      toolUsage.map((tool, index) => ({
        name: formatToolName(tool.toolName),
        value: tool.invocations,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [toolUsage],
  );

  const totalInvocations = useMemo(
    () => toolUsage.reduce((acc, tool) => acc + tool.invocations, 0),
    [toolUsage],
  );

  const topTools = useMemo(
    () =>
      [...toolUsage]
        .sort((a, b) => b.invocations - a.invocations)
        .slice(0, 5)
        .map((tool) => tool.toolName),
    [toolUsage],
  );

  const areaData = useMemo(() => {
    return toolUsageOverTime.map((day) => {
      const row: Record<string, string | number> = { date: day.date.slice(5) };
      topTools.forEach((tool) => {
        row[tool] = day.tools[tool] ?? 0;
      });
      return row;
    });
  }, [toolUsageOverTime, topTools]);

  const personaBarData = useMemo(
    () =>
      toolUsageByPersona.map((persona) => {
        const row: Record<string, string | number> = { name: persona.personaName };
        Object.entries(persona.tools).forEach(([tool, count]) => {
          row[formatToolName(tool)] = count;
        });
        return row;
      }),
    [toolUsageByPersona],
  );

  const allToolNames = useMemo(() => {
    const names = new Set<string>();
    toolUsageByPersona.forEach((persona) =>
      Object.keys(persona.tools).forEach((tool) => names.add(formatToolName(tool))),
    );
    return Array.from(names);
  }, [toolUsageByPersona]);

  const insight = useMemo(() => {
    if (toolUsage.length < 2) return null;
    const top = toolUsage[0];
    const second = toolUsage[1];
    if (!top || !second) return null;
    const ratio = (top.invocations / second.invocations).toFixed(1);
    return t.observabilityPage.usageInsight
      .replace("{top}", formatToolName(top.toolName))
      .replace("{ratio}", ratio)
      .replace("{second}", formatToolName(second.toolName));
  }, [toolUsage, t.observabilityPage.usageInsight]);

  const [overTimeRef, overTimeMounted] = useDeferredMount("260px");
  const [byPersonaRef, byPersonaMounted] = useDeferredMount("260px");

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  return (
    <div>
      {errorMsg && (
        <DashboardErrorBanner message={errorMsg} onRetry={() => void mutate()} />
      )}

      {useMock && (
        <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-sm text-amber-400">
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
          {t.observabilityPage.exampleDataNotice}
        </motion.div>
      )}

      <UsageTopCharts
        labels={{
          toolInvocations: t.observabilityPage.toolInvocations,
          distribution: t.observabilityPage.distribution,
        }}
        barData={barData}
        pieData={pieData}
        totalInvocations={totalInvocations}
        insight={insight}
      />

      <div ref={overTimeRef}>
        <UsageOverTimeCard
          mounted={overTimeMounted}
          areaData={areaData}
          topTools={topTools}
          labels={{
            usageOverTime: t.observabilityPage.usageOverTime,
            last14Days: t.observabilityPage.last14Days,
          }}
        />
      </div>

      <div ref={byPersonaRef}>
        <UsageByPersonaCard
          mounted={byPersonaMounted}
          personaBarData={personaBarData}
          allToolNames={allToolNames}
          title={t.observabilityPage.toolUsageByAgent}
        />
      </div>
    </div>
  );
}
