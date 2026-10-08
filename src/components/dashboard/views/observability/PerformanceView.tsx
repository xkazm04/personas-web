"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import useSWR from "swr";
import CompareToggle from "@/components/dashboard/CompareToggle";
import DesktopUnsupportedNote from "@/components/dashboard/views/personas/phone/DesktopUnsupportedNote";
import { isNotServed } from "@/components/dashboard/views/home/mission/readings";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import ViewGap from "@/components/dashboard/arrival/ViewGap";
import { useFocusParam } from "@/hooks/useFocusParam";
import { api } from "@/lib/api";
import { MOCK_COST_ANOMALIES, MOCK_HEALTH_ISSUES, MOCK_COST_COMPARE, MOCK_EXEC_COMPARE, MOCK_ANNOTATIONS, type MockHealthIssue } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { CostAnomalyBanner } from "./performance-view/CostAnomalyBanner";
import { PerformanceChartGrid } from "./performance-view/PerformanceChartGrid";
import { PerformanceHealthPanel } from "./performance-view/PerformanceHealthPanel";
import { PerformanceLatencyCard } from "./performance-view/PerformanceLatencyCard";
import { PerformanceMetricsGrid } from "./performance-view/PerformanceMetricsGrid";
import { PerformanceSpendCard } from "./performance-view/PerformanceSpendCard";
import { BUDGET_THRESHOLD, type SeverityFilter } from "./performance-view/performanceViewTypes";

export default function PerformanceView() {
  const { t } = useTranslation();
  const isDemo = useAuthStore((s) => s.isDemo);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  // A ?focus= deep link (e.g. back/forward onto a filtered list) must never
  // land on a row the severity filter hides: clear the filter when it changes.
  const focusId = useFocusParam();
  const [seenFocus, setSeenFocus] = useState(focusId);
  if (focusId !== seenFocus) {
    setSeenFocus(focusId);
    if (focusId) setSeverityFilter("all");
  }
  const { data, isLoading: loading, isValidating, error, mutate } = useSWR("observability", api.getObservability, {
    refreshInterval: 30_000,
    dedupingInterval: 8_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const errorMsg = error instanceof Error ? error.message : error ? String(error) : null;

  const metrics = data?.metrics ?? null;
  const dailyMetrics = useMemo(() => data?.dailyMetrics ?? [], [data]);
  const personaSpend = useMemo(() => data?.personaSpend ?? [], [data]);
  const healthIssues = useMemo(() => data?.healthIssues ?? [], [data]);
  const costChartData = useMemo(() => dailyMetrics.map((day) => ({ date: day.date.slice(5), Cost: day.cost })), [dailyMetrics]);
  const execChartData = useMemo(() => dailyMetrics.map((day) => ({ date: day.date.slice(5), Successes: day.successes, Failures: day.failures })), [dailyMetrics]);
  const spendPieData = useMemo(() => personaSpend.map((persona) => ({ name: persona.personaName, value: persona.totalCost, color: persona.personaColor })), [personaSpend]);

  const displayHealthIssues: MockHealthIssue[] = useMemo(() => {
    // Demo falls back to the illustrative fixture; real mode shows the genuine
    // (possibly empty) synced health issues — never the mock.
    if (healthIssues.length === 0) return isDemo ? MOCK_HEALTH_ISSUES : [];
    // MockHealthIssue extends the API's HealthIssue, so synced issues need no
    // reshaping — they simply arrive without the auto-healing extras.
    return healthIssues;
  }, [healthIssues, isDemo]);

  const filteredHealthIssues = useMemo(() => {
    if (severityFilter === "all") return displayHealthIssues;
    return displayHealthIssues.filter((issue) => issue.severity === severityFilter);
  }, [displayHealthIssues, severityFilter]);
  const severityCounts = useMemo(() => {
    const counts: Record<SeverityFilter, number> = { all: displayHealthIssues.length, critical: 0, high: 0, medium: 0, low: 0 };
    for (const issue of displayHealthIssues) counts[issue.severity]++;
    return counts;
  }, [displayHealthIssues]);
  const openIssues = useMemo(() => displayHealthIssues.filter((issue) => issue.status === "open"), [displayHealthIssues]);
  const overBudgetPersonas = useMemo(() => personaSpend.filter((persona) => persona.budgetUsd && persona.totalCost / persona.budgetUsd > BUDGET_THRESHOLD), [personaSpend]);
  // Genuinely re-fetch observability data instead of a fake spinner; the
  // "analyzing" state is SWR's real in-flight validation.
  const handleRunAnalysis = useCallback(() => {
    void mutate();
  }, [mutate]);

  // First load with nothing held: a held, shapeless reservation (sr-only
  // status, a faint line only after the ghost delay) - never a spinner. A
  // refetch keeps the held data on screen (keepPreviousData).
  if (loading && !metrics) return <ViewGap />;

  // The desktop plane does not serve this read: say so instead of an error over empty charts.
  if (isNotServed(error) && !metrics) return <DesktopUnsupportedNote />;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image src="/gen/backgrounds/bg-observability.avif" alt="" fill sizes="100vw" loading="lazy" className="object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>
      {errorMsg && (
        <DashboardErrorBanner message={errorMsg} onRetry={() => void mutate()} />
      )}
      {/* Compare overlays a previous period, which only the demo fixtures
          provide — real mode has no synced prior period, so hide the toggle
          rather than show an empty/fabricated comparison. */}
      {isDemo && (
        <div className={`${ARRIVE} mb-6 flex justify-end`} style={arriveAt(1)}>
          <CompareToggle enabled={compareEnabled} onToggle={() => setCompareEnabled((prev) => !prev)} />
        </div>
      )}
      {/* Cost-anomaly detection isn't synced — demo only. */}
      {isDemo && (
        <CostAnomalyBanner
          anomalies={MOCK_COST_ANOMALIES}
          label={t.observabilityPage.costAnomalyDetected}
          dismissLabel={t.common.close}
        />
      )}
      {overBudgetPersonas.length > 0 && (
        <div className={`${ARRIVE} mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3`} style={arriveAt(1)}>
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-base text-amber-300">
            {t.observabilityPage.budgetThresholdExceeded} {overBudgetPersonas.map((persona) => persona.personaName).join(", ")}
          </p>
        </div>
      )}
      {/* T2: the KPI tiles answer the tab's question first. */}
      <div className={ARRIVE} style={arriveAt(2)}>
        <PerformanceMetricsGrid metrics={metrics} labels={t.observabilityPage} />
      </div>
      <PerformanceChartGrid
        costChartData={costChartData}
        execChartData={execChartData}
        compareEnabled={compareEnabled}
        costPrevious={isDemo ? MOCK_COST_COMPARE : []}
        execPrevious={isDemo ? MOCK_EXEC_COMPARE : []}
        annotations={isDemo ? MOCK_ANNOTATIONS : []}
        labels={t.observabilityPage}
      />
      <PerformanceLatencyCard labels={t.observabilityPage} />
      <div className={`${ARRIVE} grid gap-6 lg:grid-cols-5`} style={arriveAt(5)}>
        <PerformanceSpendCard personaSpend={personaSpend} spendPieData={spendPieData} labels={t.observabilityPage} />
        <PerformanceHealthPanel
          openIssues={openIssues}
          filteredHealthIssues={filteredHealthIssues}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          severityCounts={severityCounts}
          healingActive={isValidating}
          onRunAnalysis={handleRunAnalysis}
          labels={t.observabilityPage}
        />
      </div>
    </div>
  );
}
