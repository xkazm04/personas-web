"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import MetricCard from "@/components/dashboard/MetricCard";
import CompareToggle from "@/components/dashboard/CompareToggle";
import { SkeletonChart } from "@/components/dashboard/SkeletonCard";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useIsVisible } from "@/hooks/useIsVisible";

const POLL_INTERVAL_MS = 30_000;
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
import type { PersonaSpend, HealthIssue } from "@/lib/types";

const BUDGET_THRESHOLD = 0.8;

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";
type Severity = Exclude<SeverityFilter, "all">;

const KNOWN_SEVERITIES: ReadonlySet<string> = new Set([
  "critical",
  "high",
  "medium",
  "low",
]);

const _warnedUnknownSeverities = new Set<string>();

// Trust-boundary guard: backend can evolve to add new severities ("info",
// translated strings, etc.). Without this, `counts[issue.severity]++` would
// hit `undefined++ = NaN` and the chip filter would silently drop the row.
function normalizeSeverity(severity: string | null | undefined): Severity {
  if (severity && KNOWN_SEVERITIES.has(severity)) {
    return severity as Severity;
  }
  const key = String(severity ?? "<missing>");
  if (!_warnedUnknownSeverities.has(key)) {
    _warnedUnknownSeverities.add(key);
    console.warn(
      `[observability] Unknown severity "${key}"; bucketing as "low"`,
    );
  }
  return "low";
}

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

// ---------------------------------------------------------------------------
// Mock Health Issue Row (extended version)
// ---------------------------------------------------------------------------

function MockHealthIssueRow({ issue }: { issue: MockHealthIssue }) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityStyles[issue.severity] ?? severityStyles.low;
  const SevIcon = sev.icon;
  const diff = Date.now() - new Date(issue.detectedAt).getTime();
  const mins = Math.floor(diff / 60_000);
  const age = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${sev.bgColor}`}
    >
      <div className="flex items-start gap-3">
        <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">
              {issue.title}
            </p>
            {issue.isCircuitBreaker && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                <ZapIcon className="h-2.5 w-2.5" />
                Circuit Breaker
              </span>
            )}
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
            <span>{issue.personaName}</span>
            <span>{age}</span>
            <span className={`uppercase font-medium ${sev.color}`}>
              {issue.severity}
            </span>
          </div>

          {/* Auto-fix expanding section */}
          {issue.autoFixApplied && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[10px] text-emerald-400/70 hover:text-emerald-400 transition-colors cursor-pointer"
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
                    <div className="mt-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-300/80">
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

// ---------------------------------------------------------------------------
// Cost Anomaly Banner
// ---------------------------------------------------------------------------

function CostAnomalyBanner({
  anomalies,
}: {
  anomalies: CostAnomaly[];
}) {
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
            <p className="flex-1 text-sm text-amber-300">
              Cost anomaly detected on{" "}
              <span className="font-medium">{anomaly.date}</span>:{" "}
              <span className="font-semibold text-amber-200">
                ${anomaly.cost.toFixed(2)}
              </span>{" "}
              <span className="text-amber-400/70">
                ({"\u03C3"} {anomaly.deviation.toFixed(1)})
              </span>
            </p>
            <button
              onClick={() => handleDismiss(anomaly.date)}
              className="rounded-lg p-1 text-amber-400/50 hover:bg-amber-500/10 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Severity Filter Chips
// ---------------------------------------------------------------------------

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
    all: "text-foreground border-white/[0.12]",
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
      {filters.map((f) => {
        const isActive = active === f;
        const isEmpty = counts[f] === 0;
        return (
          <button
            key={f}
            type="button"
            onClick={() => {
              if (!isEmpty) onSelect(f);
            }}
            disabled={isEmpty}
            aria-pressed={isActive}
            aria-disabled={isEmpty}
            className={`
              rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize transition-all
              ${filterColors[f]}
              ${isActive ? filterActiveBg[f] : "bg-transparent hover:bg-white/[0.04]"}
              ${isEmpty ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
            `}
          >
            {f}
            <span
              className={`ml-1 tabular-nums ${
                isEmpty ? "text-muted-dark/60 opacity-40" : "opacity-60"
              }`}
            >
              {counts[f]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Deferred bottom row — only fetches once it scrolls into view (intersection)
// ---------------------------------------------------------------------------

function PersonaSpendCard({ personaSpend }: { personaSpend: PersonaSpend[] | undefined }) {
  const spendPieData = useMemo(
    () =>
      (personaSpend ?? []).map((p) => ({
        name: p.personaName,
        value: p.totalCost,
        color: p.personaColor,
      })),
    [personaSpend],
  );

  return (
    <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-brand-purple" />
        Spend by Agent
      </h3>
      {personaSpend === undefined ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-32 w-32 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="mt-4 space-y-2 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      ) : spendPieData.length > 0 ? (
        <>
          <div className="flex items-center justify-center">
            <SpendPieChart data={spendPieData} />
          </div>
          <div className="mt-2 space-y-2">
            {personaSpend.map((p) => (
              <div
                key={p.personaId}
                className="flex items-center gap-2 text-xs"
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
        <p className="text-xs text-muted-dark py-8 text-center">
          No spend data
        </p>
      )}
    </GlowCard>
  );
}

function HealthIssuesCard({
  healthIssues,
  isLoading,
}: {
  healthIssues: HealthIssue[] | undefined;
  isLoading: boolean;
}) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const displayHealthIssues: MockHealthIssue[] = useMemo(() => {
    if (healthIssues && healthIssues.length > 0) {
      return healthIssues.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        severity: normalizeSeverity(i.severity),
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

  return (
    <motion.div variants={fadeUp} className="lg:col-span-3">
      <GlowCard
        accent={openIssues.length > 0 ? "amber" : "emerald"}
        className="p-5 h-full"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Health Issues
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-dark" />
            )}
          </h3>
          <div className="flex items-center gap-2">
            {openIssues.length > 0 && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                {openIssues.length} open
              </span>
            )}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Coming soon — on-demand health analysis"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-medium text-muted-dark/70 cursor-not-allowed"
            >
              <Search className="h-3 w-3" />
              Run Analysis
              <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-muted-dark/80">
                Soon
              </span>
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

        {filteredHealthIssues.length === 0 && severityFilter === "all" ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <HealthyShieldIllustration />
            <p className="mt-3 text-xs font-medium text-emerald-400/70">
              All systems healthy
            </p>
            <p className="mt-0.5 text-[10px] text-muted-dark">
              No issues detected across monitored services
            </p>
          </div>
        ) : filteredHealthIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-muted-dark">
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
  );
}

function DeferredBottomRow() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (shouldFetch) return;
    const node = sentinelRef.current;
    if (!node) return;

    // Fall back to immediate fetch in environments without IntersectionObserver
    if (typeof IntersectionObserver === "undefined") {
      setShouldFetch(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldFetch(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [shouldFetch]);

  // Once mounted, pause polling whenever the tab is hidden or the row has
  // scrolled out of the viewport again.
  const isVisible = useIsVisible(sentinelRef);
  const refreshInterval = shouldFetch && isVisible ? POLL_INTERVAL_MS : 0;

  const { data: personaSpend, isLoading: spendLoading } = useSWR(
    shouldFetch ? "observability:personaSpend" : null,
    api.getObservabilityPersonaSpend,
    {
      refreshInterval,
      dedupingInterval: 8_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const { data: healthIssues, isLoading: healthLoading } = useSWR(
    shouldFetch ? "observability:healthIssues" : null,
    api.getObservabilityHealthIssues,
    {
      refreshInterval,
      dedupingInterval: 8_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const overBudgetPersonas = useMemo(
    () =>
      (personaSpend ?? []).filter(
        (p) => p.budgetUsd && p.totalCost / p.budgetUsd > BUDGET_THRESHOLD,
      ),
    [personaSpend],
  );

  return (
    <div ref={sentinelRef}>
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
      <div className="grid gap-6 lg:grid-cols-5">
        <PersonaSpendCard personaSpend={shouldFetch ? personaSpend : undefined} />
        <HealthIssuesCard
          healthIssues={healthIssues}
          isLoading={shouldFetch && healthLoading && !healthIssues}
        />
      </div>
      {shouldFetch && spendLoading && !personaSpend && (
        <span className="sr-only">Loading persona spend</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ObservabilityPage() {
  const [compareEnabled, setCompareEnabled] = useState(false);

  // Pause polling when the tab is backgrounded or the page is scrolled
  // out of view. rootMargin keeps polling alive while the page is just
  // barely off-screen so a quick scroll up doesn't see stale data.
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useIsVisible(pageRef, { rootMargin: "200px" });
  const refreshInterval = isVisible ? POLL_INTERVAL_MS : 0;

  // Tier 1 — fastest: top metric cards. Sparklines render immediately from
  // mock data; the numeric values appear as soon as this 100ms request returns.
  const { data: metrics } = useSWR(
    "observability:metrics",
    api.getObservabilityMetrics,
    {
      refreshInterval,
      dedupingInterval: 8_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  // Tier 2 — daily metrics drive cost + execution charts.
  const { data: dailyMetrics } = useSWR(
    "observability:daily",
    api.getObservabilityDaily,
    {
      refreshInterval,
      dedupingInterval: 8_000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  // Single O(n) pass over dailyMetrics derives both chart projections.
  const { costChartData, execChartData } = useMemo(() => {
    const cost: { date: string; Cost: number }[] = [];
    const exec: { date: string; Successes: number; Failures: number }[] = [];
    for (const d of dailyMetrics ?? []) {
      const date = d.date.slice(5);
      cost.push({ date, Cost: d.cost });
      exec.push({ date, Successes: d.successes, Failures: d.failures });
    }
    return { costChartData: cost, execChartData: exec };
  }, [dailyMetrics]);

  return (
    <motion.div
      ref={pageRef}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative"
    >
      {/* Background illustration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image
          src="/gen/backgrounds/bg-observability.avif"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      {/* Header with compare toggle */}
      <motion.div variants={fadeUp} className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">Observability</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-dark">
            Performance metrics, cost tracking, and system health
          </p>
        </div>
        <CompareToggle
          enabled={compareEnabled}
          onToggle={() => setCompareEnabled((prev) => !prev)}
        />
      </motion.div>

      {/* Cost anomaly banner */}
      <CostAnomalyBanner anomalies={MOCK_COST_ANOMALIES} />

      {/* Metric summary cards with sparklines — render the moment the page mounts.
          Numbers default to placeholders and fill in once the metrics request resolves. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard
          icon={DollarSign}
          label="Total Cost"
          value={metrics ? `$${metrics.totalCost.toFixed(2)}` : "—"}
          trend={metrics?.costTrend}
          trendLabel="vs last period"
          accent="cyan"
          sparklineData={SPARKLINE_COST}
          trendDirection="down-good"
        />
        <MetricCard
          icon={Zap}
          label="Executions"
          value={metrics ? String(metrics.totalExecutions) : "—"}
          trend={metrics?.execTrend}
          trendLabel="vs last period"
          accent="purple"
          sparklineData={SPARKLINE_EXECUTIONS}
        />
        <MetricCard
          icon={TrendingUp}
          label="Success Rate"
          value={metrics ? `${metrics.successRate.toFixed(1)}%` : "—"}
          trend={metrics?.successTrend}
          trendLabel="vs last period"
          accent="emerald"
          sparklineData={SPARKLINE_SUCCESS}
        />
        <MetricCard
          icon={Users}
          label="Active Personas"
          value={metrics ? String(metrics.activePersonas) : "—"}
          accent="amber"
          sparklineData={SPARKLINE_AGENTS}
        />
      </div>

      {/* Charts row — wait on the daily-metrics tier; show skeletons in the meantime */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {dailyMetrics ? (
          <GlowCard accent="cyan" variants={fadeUp} className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-cyan" />
              Cost Over Time
              {compareEnabled && (
                <span className="ml-auto text-[10px] text-purple-400/70 font-normal">
                  vs previous period
                </span>
              )}
            </h3>
            <CostChartWithCompare data={costChartData} compare={compareEnabled} />
          </GlowCard>
        ) : (
          <SkeletonChart />
        )}

        {dailyMetrics ? (
          <GlowCard accent="emerald" variants={fadeUp} className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Execution Health
              {compareEnabled && (
                <span className="ml-auto text-[10px] text-purple-400/70 font-normal">
                  vs previous period
                </span>
              )}
            </h3>
            <ExecChartWithCompare data={execChartData} compare={compareEnabled} />
          </GlowCard>
        ) : (
          <SkeletonChart />
        )}
      </div>

      {/* Latency chart — uses local mock data, renders immediately */}
      <div className="mb-8">
        <GlowCard accent="amber" variants={fadeUp} className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Latency Distribution
            <span className="ml-auto text-[10px] text-muted-dark font-normal">
              P50 / P95 / P99
            </span>
          </h3>
          <LatencyChart data={MOCK_LATENCY_DATA} />
        </GlowCard>
      </div>

      {/* Tier 3 — bottom row defers its network call until it scrolls into view */}
      <DeferredBottomRow />
    </motion.div>
  );
}
