"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const CostChart = dynamic(() => import("@/components/dashboard/ObservabilityCostChart"), { ssr: false });
const ExecChart = dynamic(() => import("@/components/dashboard/ObservabilityExecChart"), { ssr: false });
const SpendPieChart = dynamic(() => import("@/components/dashboard/ObservabilitySpendPieChart"), { ssr: false });
import {
  DollarSign,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Activity,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthIssueRow from "@/components/dashboard/HealthIssueRow";
import useSWR from "swr";
import { api } from "@/lib/api";

const BUDGET_THRESHOLD = 0.8;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ObservabilityPage() {
  const { data, isLoading: loading } = useSWR("observability", api.getObservability, {
    refreshInterval: 30_000,
    dedupingInterval: 8_000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const metrics = data?.metrics ?? null;
  const dailyMetrics = data?.dailyMetrics ?? [];
  const personaSpend = data?.personaSpend ?? [];
  const healthIssues = data?.healthIssues ?? [];

  const costChartData = useMemo(
    () =>
      dailyMetrics.map((d) => ({
        date: d.date.slice(5),
        Cost: d.cost,
      })),
    [dailyMetrics],
  );

  const execChartData = useMemo(
    () =>
      dailyMetrics.map((d) => ({
        date: d.date.slice(5),
        Successes: d.successes,
        Failures: d.failures,
      })),
    [dailyMetrics],
  );

  const spendPieData = useMemo(
    () =>
      personaSpend.map((p) => ({
        name: p.personaName,
        value: p.totalCost,
        color: p.personaColor,
      })),
    [personaSpend],
  );

  const openIssues = useMemo(
    () => healthIssues.filter((i) => i.status === "open"),
    [healthIssues],
  );

  const overBudgetPersonas = useMemo(
    () => personaSpend.filter((p) => p.budgetUsd && p.totalCost / p.budgetUsd > BUDGET_THRESHOLD),
    [personaSpend],
  );

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Observability</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Performance metrics, cost tracking, and system health
        </p>
      </motion.div>

      {/* Budget warning */}
      {overBudgetPersonas.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            Budget threshold exceeded for{" "}
            {overBudgetPersonas.map((p) => p.personaName).join(", ")}
          </p>
        </motion.div>
      )}

      {/* Metric summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${(metrics?.totalCost ?? 0).toFixed(2)}`}
          trend={metrics?.costTrend}
          trendLabel="vs last period"
          accent="cyan"
        />
        <MetricCard
          icon={Zap}
          label="Executions"
          value={String(metrics?.totalExecutions ?? 0)}
          trend={metrics?.execTrend}
          trendLabel="vs last period"
          accent="purple"
        />
        <MetricCard
          icon={TrendingUp}
          label="Success Rate"
          value={`${(metrics?.successRate ?? 0).toFixed(1)}%`}
          trend={metrics?.successTrend}
          trendLabel="vs last period"
          accent="emerald"
        />
        <MetricCard
          icon={Users}
          label="Active Personas"
          value={String(metrics?.activePersonas ?? 0)}
          accent="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Cost over time */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-cyan" />
            Cost Over Time
          </h3>
          <CostChart data={costChartData} />
        </GlowCard>

        {/* Execution health */}
        <GlowCard accent="emerald" variants={fadeUp} className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Execution Health
          </h3>
          <ExecChart data={execChartData} />
        </GlowCard>
      </div>

      {/* Bottom row: per-persona spend + health issues */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Persona spend breakdown */}
        <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-purple" />
            Spend by Agent
          </h3>
          {spendPieData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <SpendPieChart data={spendPieData} />
              </div>
              <div className="mt-2 space-y-2">
                {personaSpend.map((p) => (
                  <div key={p.personaId} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.personaColor }}
                    />
                    <span className="flex-1 text-muted truncate">{p.personaName}</span>
                    <span className="tabular-nums text-foreground font-medium">
                      ${p.totalCost.toFixed(2)}
                    </span>
                    {p.budgetUsd && (
                      <div className="w-16">
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (p.totalCost / p.budgetUsd) * 100)}%`,
                              backgroundColor: p.totalCost / p.budgetUsd > BUDGET_THRESHOLD ? "#fbbf24" : p.personaColor,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-dark py-8 text-center">No spend data</p>
          )}
        </GlowCard>

        {/* Health issues */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <GlowCard accent={openIssues.length > 0 ? "amber" : "emerald"} className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Health Issues
              </h3>
              {openIssues.length > 0 && (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  {openIssues.length} open
                </span>
              )}
            </div>

            {healthIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-400/40 mb-2" />
                <p className="text-xs text-muted-dark">All systems healthy</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {healthIssues.map((issue) => (
                  <HealthIssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
