"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

const CostChartWithCompare = dynamic(
  () => import("@/components/dashboard/CostChartWithCompare"),
  { ssr: false },
);
const ExecChartWithCompare = dynamic(
  () => import("@/components/dashboard/ExecChartWithCompare"),
  { ssr: false },
);
const LatencyChart = dynamic(
  () => import("@/components/dashboard/LatencyChart"),
  { ssr: false },
);
const SpendPieChart = dynamic(
  () => import("@/components/dashboard/ObservabilitySpendPieChart"),
  { ssr: false },
);

import {
  DollarSign,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Activity,
  X,
  Clock,
  ShieldCheck,
  CircleDot,
  Zap as ZapIcon,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import HealthyShieldIllustration from "@/components/illustrations/HealthyShieldIllustration";
import { fadeUp } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import MetricCard from "@/components/dashboard/MetricCard";
import CompareToggle from "@/components/dashboard/CompareToggle";
import useSWR from "swr";
import { api } from "@/lib/api";
import {
  SPARKLINE_COST,
  SPARKLINE_EXECUTIONS,
  SPARKLINE_SUCCESS,
  SPARKLINE_AGENTS,
  MOCK_LATENCY_DATA,
  MOCK_COST_ANOMALIES,
  MOCK_HEALTH_ISSUES,
} from "@/lib/mock-dashboard-data";
import type { MockHealthIssue, CostAnomaly } from "@/lib/mock-dashboard-data";

const BUDGET_THRESHOLD = 0.8;

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

const severityStyles: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType }
> = {
  critical: {
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: AlertTriangle,
  },
  high: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    icon: ShieldAlert,
  },
  medium: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: CircleDot,
  },
  low: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: CircleDot,
  },
};

function computeAge(detectedAt: string): string {
  const diff = Date.now() - new Date(detectedAt).getTime();
  const mins = Math.floor(diff / 60_000);
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
}

function MockHealthIssueRow({ issue }: { issue: MockHealthIssue }) {
  const [expanded, setExpanded] = useState(false);
  const [age] = useState(() => computeAge(issue.detectedAt));
  const sev = severityStyles[issue.severity] ?? severityStyles.low;
  const SevIcon = sev.icon;

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${sev.bgColor}`}
    >
      <div className="flex items-start gap-3">
        <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-medium text-foreground truncate">
              {issue.title}
            </p>
            {issue.isCircuitBreaker && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-sm font-medium text-red-400">
                <ZapIcon className="h-2.5 w-2.5" />
                Circuit Breaker
              </span>
            )}
            {issue.status === "auto_fixed" && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-sm text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" />
                Auto-fixed
              </span>
            )}
            {issue.status === "resolved" && (
              <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-sm text-blue-400">
                Resolved
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-dark line-clamp-2">
            {issue.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-dark">
            <span>{issue.personaName}</span>
            <span>{age}</span>
            <span className={`uppercase font-medium ${sev.color}`}>
              {issue.severity}
            </span>
          </div>

          {issue.autoFixApplied && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-emerald-400/70 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Auto-fix applied
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-300/80">
                      {issue.autoFixApplied}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostAnomalyBanner({ anomalies }: { anomalies: CostAnomaly[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = anomalies.filter((a) => !dismissed.has(a.date));

  const handleDismiss = useCallback((date: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(date);
      return next;
    });
  }, []);

  if (visible.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      <AnimatePresence mode="popLayout">
        {visible.map((anomaly) => (
          <motion.div
            key={anomaly.date}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-amber-500/8 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            </motion.div>
            <p className="flex-1 text-base text-amber-300">
              Cost anomaly detected on{" "}
              <span className="font-medium">{anomaly.date}</span>:{" "}
              <span className="font-semibold text-amber-200">
                ${anomaly.cost.toFixed(2)}
              </span>{" "}
              <span className="text-amber-400/90">
                ({"\u03C3"} {anomaly.deviation.toFixed(1)})
              </span>
            </p>
            <button
              onClick={() => handleDismiss(anomaly.date)}
              className="rounded-lg p-1 text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SeverityFilterChips({
  active,
  onSelect,
  counts,
}: {
  active: SeverityFilter;
  onSelect: (filter: SeverityFilter) => void;
  counts: Record<SeverityFilter, number>;
}) {
  const filters: SeverityFilter[] = ["all", "critical", "high", "medium", "low"];
  const filterColors: Record<SeverityFilter, string> = {
    all: "text-foreground border-glass-strong",
    critical: "text-red-400 border-red-500/20",
    high: "text-orange-400 border-orange-500/20",
    medium: "text-amber-400 border-amber-500/20",
    low: "text-blue-400 border-blue-500/20",
  };
  const filterActiveBg: Record<SeverityFilter, string> = {
    all: "bg-white/[0.08]",
    critical: "bg-red-500/15",
    high: "bg-orange-500/15",
    medium: "bg-amber-500/15",
    low: "bg-blue-500/15",
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`
            rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize transition-all cursor-pointer
            ${filterColors[f]}
            ${active === f ? filterActiveBg[f] : "bg-transparent hover:bg-white/[0.04]"}
          `}
        >
          {f}
          {counts[f] > 0 && <span className="ml-1 opacity-60">{counts[f]}</span>}
        </button>
      ))}
    </div>
  );
}

export default function PerformanceView() {
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [healingActive, setHealingActive] = useState(false);

  const { data, isLoading: loading } = useSWR(
    "observability",
    api.getObservability,
    {
      refreshInterval: 30_000,
      dedupingInterval: 8_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );
  const metrics = data?.metrics ?? null;
  const dailyMetrics = useMemo(() => data?.dailyMetrics ?? [], [data]);
  const personaSpend = useMemo(() => data?.personaSpend ?? [], [data]);
  const healthIssues = useMemo(() => data?.healthIssues ?? [], [data]);

  const costChartData = useMemo(
    () => dailyMetrics.map((d) => ({ date: d.date.slice(5), Cost: d.cost })),
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

  const displayHealthIssues: MockHealthIssue[] = useMemo(() => {
    if (healthIssues.length > 0) {
      return healthIssues.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        severity: i.severity,
        status: i.status,
        personaName: i.personaName ?? "Unknown",
        detectedAt: i.detectedAt,
        category: i.category,
      }));
    }
    return MOCK_HEALTH_ISSUES;
  }, [healthIssues]);

  const filteredHealthIssues = useMemo(() => {
    if (severityFilter === "all") return displayHealthIssues;
    return displayHealthIssues.filter((i) => i.severity === severityFilter);
  }, [displayHealthIssues, severityFilter]);

  const severityCounts = useMemo(() => {
    const counts: Record<SeverityFilter, number> = {
      all: displayHealthIssues.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const issue of displayHealthIssues) {
      counts[issue.severity]++;
    }
    return counts;
  }, [displayHealthIssues]);

  const openIssues = useMemo(
    () => displayHealthIssues.filter((i) => i.status === "open"),
    [displayHealthIssues],
  );

  const overBudgetPersonas = useMemo(
    () =>
      personaSpend.filter(
        (p) => p.budgetUsd && p.totalCost / p.budgetUsd > BUDGET_THRESHOLD,
      ),
    [personaSpend],
  );

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
        <Image
          src="/gen/backgrounds/bg-observability.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <div className="mb-6 flex justify-end">
        <CompareToggle
          enabled={compareEnabled}
          onToggle={() => setCompareEnabled((prev) => !prev)}
        />
      </div>

      <CostAnomalyBanner anomalies={MOCK_COST_ANOMALIES} />

      {overBudgetPersonas.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-base text-amber-300">
            Budget threshold exceeded for{" "}
            {overBudgetPersonas.map((p) => p.personaName).join(", ")}
          </p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${(metrics?.totalCost ?? 0).toFixed(2)}`}
          trend={metrics?.costTrend}
          trendLabel="vs last period"
          accent="cyan"
          sparklineData={SPARKLINE_COST}
        />
        <MetricCard
          icon={Zap}
          label="Executions"
          value={String(metrics?.totalExecutions ?? 0)}
          trend={metrics?.execTrend}
          trendLabel="vs last period"
          accent="purple"
          sparklineData={SPARKLINE_EXECUTIONS}
        />
        <MetricCard
          icon={TrendingUp}
          label="Success Rate"
          value={`${(metrics?.successRate ?? 0).toFixed(1)}%`}
          trend={metrics?.successTrend}
          trendLabel="vs last period"
          accent="emerald"
          sparklineData={SPARKLINE_SUCCESS}
        />
        <MetricCard
          icon={Users}
          label="Active Personas"
          value={String(metrics?.activePersonas ?? 0)}
          accent="amber"
          sparklineData={SPARKLINE_AGENTS}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <GlowCard accent="cyan" variants={fadeUp} className="p-5">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-cyan" />
            Cost Over Time
            {compareEnabled && (
              <span className="ml-auto text-sm text-purple-400/70 font-normal">
                vs previous period
              </span>
            )}
          </h3>
          <CostChartWithCompare data={costChartData} compare={compareEnabled} />
        </GlowCard>

        <GlowCard accent="emerald" variants={fadeUp} className="p-5">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Execution Health
            {compareEnabled && (
              <span className="ml-auto text-sm text-purple-400/70 font-normal">
                vs previous period
              </span>
            )}
          </h3>
          <ExecChartWithCompare data={execChartData} compare={compareEnabled} />
        </GlowCard>
      </div>

      <div className="mb-8">
        <GlowCard accent="amber" variants={fadeUp} className="p-5">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Latency Distribution
            <span className="ml-auto text-sm text-muted-dark font-normal">
              P50 / P95 / P99
            </span>
          </h3>
          <LatencyChart data={MOCK_LATENCY_DATA} />
        </GlowCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <GlowCard
          accent="purple"
          variants={fadeUp}
          className="p-5 lg:col-span-2"
        >
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
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
                  <div
                    key={p.personaId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.personaColor }}
                    />
                    <span className="flex-1 text-muted truncate">
                      {p.personaName}
                    </span>
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
                              backgroundColor:
                                p.totalCost / p.budgetUsd > BUDGET_THRESHOLD
                                  ? "#fbbf24"
                                  : p.personaColor,
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
            <p className="text-sm text-muted-dark py-8 text-center">
              No spend data
            </p>
          )}
        </GlowCard>

        <motion.div variants={fadeUp} className="lg:col-span-3">
          <GlowCard
            accent={openIssues.length > 0 ? "amber" : "emerald"}
            className="p-5 h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Health Issues
              </h3>
              <div className="flex items-center gap-2">
                {openIssues.length > 0 && (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-sm font-medium text-amber-400">
                    {openIssues.length} open
                  </span>
                )}
                <button
                  onClick={handleRunAnalysis}
                  disabled={healingActive}
                  className={`
                    flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all cursor-pointer
                    ${
                      healingActive
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-glass-hover bg-white/[0.03] text-muted-dark hover:border-glass-strong hover:text-muted"
                    }
                  `}
                >
                  {healingActive ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-3 w-3" />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <SeverityFilterChips
                active={severityFilter}
                onSelect={setSeverityFilter}
                counts={severityCounts}
              />
            </div>

            <AnimatePresence>
              {healingActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  </motion.div>
                  <p className="text-sm text-cyan-300/80">
                    Running health analysis across all monitored services...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredHealthIssues.length === 0 && severityFilter === "all" ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <HealthyShieldIllustration />
                <p className="mt-3 text-sm font-medium text-emerald-400/70">
                  All systems healthy
                </p>
                <p className="mt-0.5 text-sm text-muted-dark">
                  No issues detected across monitored services
                </p>
              </div>
            ) : filteredHealthIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-dark">
                  No {severityFilter} severity issues
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {filteredHealthIssues.map((issue) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <MockHealthIssueRow issue={issue} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
