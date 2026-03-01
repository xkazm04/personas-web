"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CircleDot,
  Loader2,
  Activity,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { HealthIssue } from "@/lib/types";

// ---------------------------------------------------------------------------
// Chart tooltip
// ---------------------------------------------------------------------------

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0f0f1a]/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium">
            {entry.name.toLowerCase().includes("cost") ? `$${entry.value.toFixed(2)}` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
}) {
  const accentMap = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  };

  return (
    <GlowCard accent={accent} variants={fadeUp} className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className={`h-4 w-4 ${accentMap[accent]}`} />
        </div>
        <span className="text-xs font-medium text-muted-dark uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-[11px]">
          {trend >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400" />
          )}
          <span className={trend >= 0 ? "text-emerald-400" : "text-red-400"}>
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && <span className="text-muted-dark">{trendLabel}</span>}
        </div>
      )}
    </GlowCard>
  );
}

// ---------------------------------------------------------------------------
// Health issue row
// ---------------------------------------------------------------------------

const severityStyles: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/20", icon: ShieldAlert },
  medium: { color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", icon: CircleDot },
  low: { color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: CircleDot },
};

function HealthIssueRow({ issue }: { issue: HealthIssue }) {
  const sev = severityStyles[issue.severity] ?? severityStyles.low;
  const SevIcon = sev.icon;
  const diff = Date.now() - new Date(issue.detectedAt).getTime();
  const mins = Math.floor(diff / 60_000);
  const age = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${sev.bgColor}`}>
      <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {issue.title}
          </p>
          {issue.status === "auto_fixed" && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] text-emerald-400">
              <ShieldCheck className="h-2.5 w-2.5" />
              Auto-fixed
            </span>
          )}
          {issue.status === "resolved" && (
            <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-[10px] text-blue-400">
              Resolved
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-dark line-clamp-2">
          {issue.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-dark">
          {issue.personaName && <span>{issue.personaName}</span>}
          <span>{age}</span>
          <span className={`uppercase font-medium ${sev.color}`}>{issue.severity}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PIE_COLORS = ["#06b6d4", "#f43f5e", "#a855f7", "#fbbf24", "#34d399"];

export default function ObservabilityPage() {
  const metrics = useDashboardStore((s) => s.observabilityMetrics);
  const dailyMetrics = useDashboardStore((s) => s.dailyMetrics);
  const personaSpend = useDashboardStore((s) => s.personaSpend);
  const healthIssues = useDashboardStore((s) => s.healthIssues);
  const loading = useDashboardStore((s) => s.observabilityLoading);
  const fetchObservability = useDashboardStore((s) => s.fetchObservability);

  useEffect(() => {
    void fetchObservability();
  }, [fetchObservability]);

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
      {personaSpend.some(
        (p) => p.budgetUsd && p.totalCost / p.budgetUsd > 0.8,
      ) && (
        <motion.div
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            Budget threshold exceeded for{" "}
            {personaSpend
              .filter((p) => p.budgetUsd && p.totalCost / p.budgetUsd > 0.8)
              .map((p) => p.personaName)
              .join(", ")}
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
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={costChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="Cost" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        {/* Execution health */}
        <GlowCard accent="emerald" variants={fadeUp} className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Execution Health
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={execChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Successes" stackId="exec" fill="#34d399" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Failures" stackId="exec" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={spendPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {spendPieData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                      contentStyle={{
                        background: "rgba(15,15,26,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
                              backgroundColor: p.totalCost / p.budgetUsd > 0.8 ? "#fbbf24" : p.personaColor,
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
