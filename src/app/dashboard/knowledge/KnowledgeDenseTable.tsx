"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  AlertCircle,
  DollarSign,
  Cpu,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
  Clock,
  X,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  type KnowledgePattern,
} from "@/lib/mock-dashboard-data";

// ── Types ────────────────────────────────────────────────────────────

type KnowledgeType = KnowledgePattern["knowledgeType"];

type SortField =
  | "knowledgeType"
  | "patternKey"
  | "personaName"
  | "successCount"
  | "failureCount"
  | "successRate"
  | "avgCostUsd"
  | "avgDurationMs"
  | "confidence"
  | "lastSeen";

type SortDir = "asc" | "desc";

// ── Config ───────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  KnowledgeType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    textColor: string;
    bgClass: string;
  }
> = {
  tool_sequence: {
    icon: Workflow,
    label: "Tool Seq",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
  },
  failure_pattern: {
    icon: AlertCircle,
    label: "Failure",
    color: "#f43f5e",
    textColor: "text-rose-400",
    bgClass: "bg-rose-500/10",
  },
  cost_quality: {
    icon: DollarSign,
    label: "Cost/Qual",
    color: "#f59e0b",
    textColor: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  model_performance: {
    icon: Cpu,
    label: "Model",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  data_flow: {
    icon: ArrowRightLeft,
    label: "Data Flow",
    color: "#10b981",
    textColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(3)}`;
}

function successRate(p: KnowledgePattern): number {
  const total = p.successCount + p.failureCount;
  return total > 0 ? p.successCount / total : 0;
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return "#10b981";
  if (c >= 0.4) return "#f59e0b";
  return "#f43f5e";
}

// ── Column Definitions ───────────────────────────────────────────────

interface ColumnDef {
  key: SortField;
  label: string;
  width: string;
  mono?: boolean;
  align?: "left" | "center" | "right";
}

const COLUMNS: ColumnDef[] = [
  { key: "knowledgeType", label: "Type", width: "w-16", align: "center" },
  { key: "patternKey", label: "Pattern Key", width: "flex-1 min-w-[140px]" },
  { key: "personaName", label: "Agent", width: "w-28" },
  {
    key: "successCount",
    label: "Success",
    width: "w-18",
    mono: true,
    align: "right",
  },
  {
    key: "failureCount",
    label: "Fails",
    width: "w-16",
    mono: true,
    align: "right",
  },
  {
    key: "successRate",
    label: "Rate",
    width: "w-16",
    mono: true,
    align: "right",
  },
  {
    key: "avgCostUsd",
    label: "Cost",
    width: "w-18",
    mono: true,
    align: "right",
  },
  {
    key: "avgDurationMs",
    label: "Duration",
    width: "w-20",
    mono: true,
    align: "right",
  },
  { key: "confidence", label: "Confidence", width: "w-28" },
  {
    key: "lastSeen",
    label: "Last Seen",
    width: "w-20",
    mono: true,
    align: "right",
  },
];

// ── Sort Header ──────────────────────────────────────────────────────

function SortHeader({
  column,
  sortField,
  sortDir,
  onSort,
}: {
  column: ColumnDef;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === column.key;
  const align =
    column.align === "right"
      ? "justify-end"
      : column.align === "center"
        ? "justify-center"
        : "justify-start";

  return (
    <button
      onClick={() => onSort(column.key)}
      className={`flex items-center gap-1 ${align} ${column.width} px-2 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
        isActive
          ? "text-foreground"
          : "text-muted-dark hover:text-foreground/70"
      }`}
    >
      {column.label}
      <span className="flex flex-col -space-y-0.5">
        <ChevronUp
          className={`h-2.5 w-2.5 ${
            isActive && sortDir === "asc"
              ? "text-cyan-400"
              : "text-white/[0.15]"
          }`}
        />
        <ChevronDown
          className={`h-2.5 w-2.5 ${
            isActive && sortDir === "desc"
              ? "text-cyan-400"
              : "text-white/[0.15]"
          }`}
        />
      </span>
    </button>
  );
}

// ── Table Row ────────────────────────────────────────────────────────

function TableRow({
  pattern,
  index,
  isSelected,
  onSelect,
}: {
  pattern: KnowledgePattern;
  index: number;
  isSelected: boolean;
  onSelect: (p: KnowledgePattern) => void;
}) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = successRate(pattern);
  const confPercent = Math.round(pattern.confidence * 100);
  const confColor = confidenceColor(pattern.confidence);

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onSelect(pattern)}
      className={`
        group flex items-center w-full text-left transition-all duration-150
        ${index % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"}
        ${isSelected ? "bg-white/[0.05] ring-1 ring-cyan-500/20" : "hover:bg-white/[0.04]"}
        border-b border-glass
      `}
    >
      {/* Type Icon */}
      <div className="w-16 flex justify-center px-2 py-2.5">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bgClass}`}
        >
          <Icon className={`h-3 w-3 ${config.textColor}`} />
        </div>
      </div>

      {/* Pattern Key */}
      <div className="flex-1 min-w-[140px] px-2 py-2.5">
        <p className="text-sm font-medium text-foreground truncate">
          {pattern.patternKey}
        </p>
      </div>

      {/* Agent */}
      <div className="w-28 px-2 py-2.5">
        <p className="text-sm text-foreground/70 truncate">
          {pattern.personaName}
        </p>
      </div>

      {/* Success */}
      <div className="w-18 px-2 py-2.5 text-right">
        <span className="text-sm font-mono font-medium tabular-nums text-emerald-400">
          {pattern.successCount}
        </span>
      </div>

      {/* Failures */}
      <div className="w-16 px-2 py-2.5 text-right">
        <span className="text-sm font-mono font-medium tabular-nums text-rose-400">
          {pattern.failureCount}
        </span>
      </div>

      {/* Success Rate */}
      <div className="w-16 px-2 py-2.5 text-right">
        <span className="text-sm font-mono font-medium tabular-nums text-foreground">
          {(rate * 100).toFixed(0)}%
        </span>
      </div>

      {/* Cost */}
      <div className="w-18 px-2 py-2.5 text-right">
        <span className="text-sm font-mono font-medium tabular-nums text-foreground/70">
          {formatCost(pattern.avgCostUsd)}
        </span>
      </div>

      {/* Duration */}
      <div className="w-20 px-2 py-2.5 text-right">
        <span className="text-sm font-mono font-medium tabular-nums text-foreground/70">
          {formatDuration(pattern.avgDurationMs)}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="w-28 px-2 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confPercent}%`,
                backgroundColor: confColor,
              }}
            />
          </div>
          <span className="text-sm font-mono font-medium tabular-nums text-foreground/60 w-7 text-right">
            {confPercent}%
          </span>
        </div>
      </div>

      {/* Last Seen */}
      <div className="w-20 px-2 py-2.5 text-right">
        <span className="text-sm font-mono tabular-nums text-muted-dark">
          {relativeTime(pattern.lastSeen)}
        </span>
      </div>
    </motion.button>
  );
}

// ── Bottom Detail Panel ──────────────────────────────────────────────

function BottomDetailPanel({
  pattern,
  onClose,
}: {
  pattern: KnowledgePattern;
  onClose: () => void;
}) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = successRate(pattern);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-t border-glass bg-white/[0.02] shrink-0"
    >
      <div className="p-3 flex items-start gap-4">
        {/* Left: Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass}`}
          >
            <Icon className={`h-4 w-4 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {pattern.patternKey}
            </p>
            <p className="text-sm text-muted-dark">
              {pattern.personaName} / {config.label}
            </p>
          </div>
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-5 text-sm flex-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="font-mono tabular-nums text-foreground">
              {pattern.successCount}
            </span>
            <span className="text-muted-dark">success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3 w-3 text-rose-400" />
            <span className="font-mono tabular-nums text-foreground">
              {pattern.failureCount}
            </span>
            <span className="text-muted-dark">failures</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-cyan-400" />
            <span className="font-mono tabular-nums text-foreground">
              {(rate * 100).toFixed(1)}%
            </span>
            <span className="text-muted-dark">rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-amber-400" />
            <span className="font-mono tabular-nums text-foreground">
              {formatCost(pattern.avgCostUsd)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-purple-400" />
            <span className="font-mono tabular-nums text-foreground">
              {formatDuration(pattern.avgDurationMs)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-dark" />
            <span className="font-mono tabular-nums text-muted-dark">
              {relativeTime(pattern.lastSeen)}
            </span>
          </div>
        </div>

        {/* Right: Description + Close */}
        <div className="flex items-start gap-3 max-w-sm shrink-0">
          <p className="text-sm leading-relaxed text-foreground/60 line-clamp-2">
            {pattern.description}
          </p>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5 text-muted-dark" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function KnowledgeDenseTable() {
  const [sortField, setSortField] = useState<SortField>("confidence");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilters, setTypeFilters] = useState<Set<KnowledgeType>>(
    new Set()
  );
  const [selectedPattern, setSelectedPattern] =
    useState<KnowledgePattern | null>(null);

  // Toggle type filter
  const toggleTypeFilter = useCallback((type: KnowledgeType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Handle sort toggle
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = MOCK_KNOWLEDGE_PATTERNS.length;
    const avgConfidence =
      MOCK_KNOWLEDGE_PATTERNS.reduce((s, p) => s + p.confidence, 0) / total;
    const totalSuccess = MOCK_KNOWLEDGE_PATTERNS.reduce(
      (s, p) => s + p.successCount,
      0
    );
    const totalFailure = MOCK_KNOWLEDGE_PATTERNS.reduce(
      (s, p) => s + p.failureCount,
      0
    );
    const avgCost =
      MOCK_KNOWLEDGE_PATTERNS.reduce((s, p) => s + p.avgCostUsd, 0) / total;
    return { total, avgConfidence, totalSuccess, totalFailure, avgCost };
  }, []);

  // Filtered + sorted
  const sortedPatterns = useMemo(() => {
    let patterns = [...MOCK_KNOWLEDGE_PATTERNS];

    // Filter
    if (typeFilters.size > 0) {
      patterns = patterns.filter((p) => typeFilters.has(p.knowledgeType));
    }

    // Sort
    const dir = sortDir === "asc" ? 1 : -1;
    patterns.sort((a, b) => {
      switch (sortField) {
        case "knowledgeType":
          return dir * a.knowledgeType.localeCompare(b.knowledgeType);
        case "patternKey":
          return dir * a.patternKey.localeCompare(b.patternKey);
        case "personaName":
          return dir * a.personaName.localeCompare(b.personaName);
        case "successCount":
          return dir * (a.successCount - b.successCount);
        case "failureCount":
          return dir * (a.failureCount - b.failureCount);
        case "successRate":
          return dir * (successRate(a) - successRate(b));
        case "avgCostUsd":
          return dir * (a.avgCostUsd - b.avgCostUsd);
        case "avgDurationMs":
          return dir * (a.avgDurationMs - b.avgDurationMs);
        case "confidence":
          return dir * (a.confidence - b.confidence);
        case "lastSeen":
          return (
            dir *
            (new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime())
          );
        default:
          return 0;
      }
    });

    return patterns;
  }, [sortField, sortDir, typeFilters]);

  const handleSelect = (p: KnowledgePattern) => {
    setSelectedPattern((prev) => (prev?.id === p.id ? null : p));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col h-[calc(100vh-10rem)] relative"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--brand-cyan) 4%, transparent), transparent 70%)",
        }}
      />

      {/* Top Bar: Inline Stats + Type Filters */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-4 flex-wrap mb-2 shrink-0"
      >
        {/* Inline stats */}
        <div className="flex items-center gap-4 text-sm mr-auto">
          <span className="text-muted-dark">
            Patterns{" "}
            <span className="text-foreground font-bold tabular-nums">
              {stats.total}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Avg Conf{" "}
            <span className="text-cyan-400 font-bold tabular-nums">
              {Math.round(stats.avgConfidence * 100)}%
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Success{" "}
            <span className="text-emerald-400 font-bold tabular-nums">
              {stats.totalSuccess.toLocaleString()}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Fails{" "}
            <span className="text-rose-400 font-bold tabular-nums">
              {stats.totalFailure.toLocaleString()}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Avg Cost{" "}
            <span className="text-foreground font-bold tabular-nums">
              ${stats.avgCost.toFixed(3)}
            </span>
          </span>
        </div>

        {/* Type filter toggles */}
        <div className="flex items-center gap-1.5">
          {(Object.keys(TYPE_CONFIG) as KnowledgeType[]).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const active = typeFilters.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                title={cfg.label}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 ${
                  active
                    ? `${cfg.bgClass} ${cfg.textColor} ring-1 ring-white/[0.1]`
                    : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
              </button>
            );
          })}
          {typeFilters.size > 0 && (
            <button
              onClick={() => setTypeFilters(new Set())}
              className="text-sm text-muted-dark hover:text-foreground/70 px-2 py-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Table Container */}
      <motion.div
        variants={fadeUp}
        className="flex-1 min-h-0 flex flex-col rounded-xl border border-glass overflow-hidden bg-white/[0.01] dot-grid"
      >
        {/* Table Header */}
        <div className="flex items-center border-b border-glass bg-white/[0.02] shrink-0">
          {COLUMNS.map((col) => (
            <SortHeader
              key={col.key}
              column={col}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          ))}
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <AnimatePresence mode="popLayout">
            {sortedPatterns.map((pattern, i) => (
              <TableRow
                key={pattern.id}
                pattern={pattern}
                index={i}
                isSelected={selectedPattern?.id === pattern.id}
                onSelect={handleSelect}
              />
            ))}
          </AnimatePresence>

          {sortedPatterns.length === 0 && (
            <div className="flex items-center justify-center py-12 text-base text-muted-dark">
              No patterns match current filters
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Detail Panel */}
      <AnimatePresence>
        {selectedPattern && (
          <BottomDetailPanel
            key={selectedPattern.id}
            pattern={selectedPattern}
            onClose={() => setSelectedPattern(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
