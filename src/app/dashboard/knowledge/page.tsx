"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  GitBranch,
  AlertCircle,
  Cpu,
  ChevronDown,
  Clock,
  Workflow,
  TrendingDown,
  DollarSign,
  ArrowRightLeft,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import MetricCard from "@/components/dashboard/MetricCard";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  type KnowledgePattern,
} from "@/lib/mock-dashboard-data";

// ── Types ────────────────────────────────────────────────────────────

type KnowledgeType = KnowledgePattern["knowledgeType"];

type FilterTab = "all" | KnowledgeType;

// ── Constants ────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tool_sequence", label: "Tool Sequences" },
  { key: "failure_pattern", label: "Failure Patterns" },
  { key: "cost_quality", label: "Cost / Quality" },
  { key: "model_performance", label: "Model Performance" },
  { key: "data_flow", label: "Data Flow" },
];

const TYPE_CONFIG: Record<
  KnowledgeType,
  {
    accent: "cyan" | "purple" | "emerald" | "amber";
    label: string;
    badgeClass: string;
    icon: React.ElementType;
  }
> = {
  tool_sequence: {
    accent: "cyan",
    label: "Tool Sequence",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    icon: Workflow,
  },
  failure_pattern: {
    accent: "amber",
    label: "Failure Pattern",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    icon: AlertCircle,
  },
  cost_quality: {
    accent: "amber",
    label: "Cost / Quality",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    icon: DollarSign,
  },
  model_performance: {
    accent: "purple",
    label: "Model Performance",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    icon: Cpu,
  },
  data_flow: {
    accent: "emerald",
    label: "Data Flow",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    icon: ArrowRightLeft,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(3)}`;
}

// ── Confidence Meter ─────────────────────────────────────────────────

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  let colorClass: string;
  if (confidence >= 0.7) {
    colorClass = "bg-emerald-500";
  } else if (confidence >= 0.4) {
    colorClass = "bg-amber-500";
  } else {
    colorClass = "bg-red-500";
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-dark uppercase tracking-wider">
          Confidence
        </span>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ── Pattern Card ─────────────────────────────────────────────────────

function PatternCard({ pattern }: { pattern: KnowledgePattern }) {
  const [expanded, setExpanded] = useState(false);
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;

  return (
    <GlowCard accent={config.accent} variants={fadeUp} className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Icon className="h-4 w-4 shrink-0 text-foreground/60" />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {pattern.patternKey}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-foreground/70">
              {pattern.personaName}
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${config.badgeClass}`}
            >
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-dark shrink-0">
          <Clock className="h-3 w-3" />
          {relativeTime(pattern.lastSeen)}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-1">
        <div className="rounded-lg bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-muted-dark uppercase tracking-wider mb-0.5">
            Success
          </p>
          <p className="text-sm font-bold tabular-nums text-emerald-400">
            {pattern.successCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-muted-dark uppercase tracking-wider mb-0.5">
            Failures
          </p>
          <p className="text-sm font-bold tabular-nums text-rose-400">
            {pattern.failureCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-muted-dark uppercase tracking-wider mb-0.5">
            Avg Cost
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {formatCost(pattern.avgCostUsd)}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] text-muted-dark uppercase tracking-wider mb-0.5">
            Avg Duration
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {formatDuration(pattern.avgDurationMs)}
          </p>
        </div>
      </div>

      {/* Confidence Meter */}
      <ConfidenceMeter confidence={pattern.confidence} />

      {/* Expandable Description */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 flex w-full items-center gap-1.5 text-[11px] font-medium text-muted-dark hover:text-foreground/80 transition-colors"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
        {expanded ? "Hide details" : "Show details"}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="description"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/70">
              {pattern.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlowCard>
  );
}

// ── Recent Learning Card ─────────────────────────────────────────────

function RecentLearningCard({ pattern }: { pattern: KnowledgePattern }) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;

  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]`}
      >
        <Icon className="h-4 w-4 text-foreground/60" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">
          {pattern.patternKey}
        </p>
        <p className="text-[11px] text-muted-dark">
          {pattern.personaName}
        </p>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-muted-dark shrink-0">
        <Clock className="h-3 w-3" />
        {relativeTime(pattern.lastSeen)}
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function KnowledgeGraphPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  // Summary counts by type
  const summaryCounts = useMemo(() => {
    const counts = {
      total: MOCK_KNOWLEDGE_PATTERNS.length,
      tool_sequence: 0,
      failure_pattern: 0,
      model_performance: 0,
    };
    for (const p of MOCK_KNOWLEDGE_PATTERNS) {
      if (p.knowledgeType === "tool_sequence") counts.tool_sequence++;
      if (p.knowledgeType === "failure_pattern") counts.failure_pattern++;
      if (p.knowledgeType === "model_performance") counts.model_performance++;
    }
    return counts;
  }, []);

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    if (activeFilter === "all") return MOCK_KNOWLEDGE_PATTERNS;
    return MOCK_KNOWLEDGE_PATTERNS.filter(
      (p) => p.knowledgeType === activeFilter,
    );
  }, [activeFilter]);

  // Recent learnings (last 3 by lastSeen)
  const recentLearnings = useMemo(() => {
    return [...MOCK_KNOWLEDGE_PATTERNS]
      .sort(
        (a, b) =>
          new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
      )
      .slice(0, 3);
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">Knowledge Graph</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Patterns learned from agent executions
        </p>
      </motion.div>

      {/* Summary Metric Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8"
      >
        <MetricCard
          icon={Brain}
          label="Total Patterns"
          value={String(summaryCounts.total)}
          accent="cyan"
          sparklineData={[3, 4, 4, 5, 5, 6, 7, 8]}
          trend={14.3}
          trendLabel="vs last week"
        />
        <MetricCard
          icon={GitBranch}
          label="Tool Sequences"
          value={String(summaryCounts.tool_sequence)}
          accent="purple"
          sparklineData={[1, 1, 1, 2, 2, 2, 2, 3]}
          trend={50.0}
          trendLabel="vs last week"
        />
        <MetricCard
          icon={AlertCircle}
          label="Failure Patterns"
          value={String(summaryCounts.failure_pattern)}
          accent="amber"
          sparklineData={[4, 3, 3, 3, 2, 2, 2, 2]}
          trend={-33.3}
          trendLabel="vs last week"
        />
        <MetricCard
          icon={Cpu}
          label="Model Insights"
          value={String(summaryCounts.model_performance)}
          accent="emerald"
          sparklineData={[0, 0, 0, 1, 1, 1, 1, 1]}
          trend={0}
          trendLabel="stable"
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeFilter === tab.key
                  ? "bg-white/[0.08] text-foreground shadow-sm"
                  : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pattern Cards */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-4 md:grid-cols-2 mb-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State for filtered results */}
      {filteredPatterns.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center py-16 text-center mb-10"
        >
          <Brain className="h-10 w-10 text-muted-dark/40 mb-3" />
          <p className="text-sm font-medium text-muted-dark">
            No patterns found for this category
          </p>
          <p className="text-xs text-muted-dark/70 mt-1">
            Patterns will appear here as your agents learn from executions
          </p>
        </motion.div>
      )}

      {/* Recent Learnings Section */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.04]">
            <TrendingDown className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Recent Learnings
          </h2>
        </div>
        <motion.div variants={staggerContainer} className="grid gap-3">
          {recentLearnings.map((pattern) => (
            <RecentLearningCard key={pattern.id} pattern={pattern} />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
