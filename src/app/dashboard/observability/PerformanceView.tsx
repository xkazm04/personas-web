"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import useSWR from "swr";
import CompareToggle from "@/components/dashboard/CompareToggle";
import { fadeUp } from "@/lib/animations";
import { api } from "@/lib/api";
import { MOCK_COST_ANOMALIES, MOCK_HEALTH_ISSUES, type MockHealthIssue } from "@/lib/mock-dashboard-data";
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
  const [healingActive, setHealingActive] = useState(false);
  const { data, isLoading: loading } = useSWR("observability", api.getObservability, {
    refreshInterval: 30_000,
    dedupingInterval: 8_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

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
    return healthIssues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      status: issue.status,
      personaName: issue.personaName ?? "Unknown",
      detectedAt: issue.detectedAt,
      category: issue.category,
    }));
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
  const handleRunAnalysis = useCallback(() => {
    setHealingActive(true);
    setTimeout(() => setHealingActive(false), 3000);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image src="/gen/backgrounds/bg-observability.png" alt="" fill sizes="100vw" loading="lazy" className="object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>
      <div className="mb-6 flex justify-end">
        <CompareToggle enabled={compareEnabled} onToggle={() => setCompareEnabled((prev) => !prev)} />
      </div>
      {/* Cost-anomaly detection isn't synced — demo only. */}
      {isDemo && (
        <CostAnomalyBanner
          anomalies={MOCK_COST_ANOMALIES}
          label={t.observabilityPage.costAnomalyDetected}
          dismissLabel={t.common.close}
        />
      )}
      {overBudgetPersonas.length > 0 && (
        <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-base text-amber-300">
            {t.observabilityPage.budgetThresholdExceeded} {overBudgetPersonas.map((persona) => persona.personaName).join(", ")}
          </p>
        </motion.div>
      )}
      <PerformanceMetricsGrid metrics={metrics} labels={t.observabilityPage} />
      <PerformanceChartGrid costChartData={costChartData} execChartData={execChartData} compareEnabled={compareEnabled} labels={t.observabilityPage} />
      <PerformanceLatencyCard labels={t.observabilityPage} />
      <div className="grid gap-6 lg:grid-cols-5">
        <PerformanceSpendCard personaSpend={personaSpend} spendPieData={spendPieData} labels={t.observabilityPage} />
        <PerformanceHealthPanel
          openIssues={openIssues}
          filteredHealthIssues={filteredHealthIssues}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          severityCounts={severityCounts}
          healingActive={healingActive}
          onRunAnalysis={handleRunAnalysis}
          labels={t.observabilityPage}
        />
      </div>
    </div>
  );
}
