"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  AlertCircle,
  DollarSign,
  Cpu,
  ArrowRightLeft,
  X,
  Clock,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  type KnowledgePattern,
} from "@/lib/mock-dashboard-data";

// -- Types --

type KnowledgeType = KnowledgePattern["knowledgeType"];

interface NodePosition {
  x: number;
  y: number;
}

// -- Config --

const TYPE_CONFIG: Record<
  KnowledgeType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    textColor: string;
    bgClass: string;
    clusterAngle: number; // radial position in degrees
  }
> = {
  tool_sequence: {
    icon: Workflow,
    label: "Tool Sequence",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    clusterAngle: 0,
  },
  failure_pattern: {
    icon: AlertCircle,
    label: "Failure Pattern",
    color: "#f43f5e",
    textColor: "text-rose-400",
    bgClass: "bg-rose-500/10",
    clusterAngle: 72,
  },
  cost_quality: {
    icon: DollarSign,
    label: "Cost / Quality",
    color: "#f59e0b",
    textColor: "text-amber-400",
    bgClass: "bg-amber-500/10",
    clusterAngle: 144,
  },
  model_performance: {
    icon: Cpu,
    label: "Model Performance",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
    clusterAngle: 216,
  },
  data_flow: {
    icon: ArrowRightLeft,
    label: "Data Flow",
    color: "#10b981",
    textColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    clusterAngle: 288,
  },
};

const PERSONA_COLORS: Record<string, string> = {
  ResearchAgent: "#06b6d4",
  CodeReviewer: "#34d399",
  DataProcessor: "#fbbf24",
  NotifyBot: "#a855f7",
  ReportGen: "#f43f5e",
};

// -- Helpers --

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

// -- Layout computation --

function computeNodePositions(
  patterns: KnowledgePattern[],
  width: number,
  height: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  // Group by type
  const groups = new Map<KnowledgeType, KnowledgePattern[]>();
  for (const p of patterns) {
    if (!groups.has(p.knowledgeType)) groups.set(p.knowledgeType, []);
    groups.get(p.knowledgeType)!.push(p);
  }

  for (const [type, members] of groups) {
    const config = TYPE_CONFIG[type];
    const angle = (config.clusterAngle * Math.PI) / 180;
    const clusterCx = cx + Math.cos(angle) * radius;
    const clusterCy = cy + Math.sin(angle) * radius;

    // Spread members within cluster
    const spreadRadius = 30 + members.length * 12;
    members.forEach((p, i) => {
      const memberAngle = (i / members.length) * Math.PI * 2;
      const dist = spreadRadius * (0.4 + p.confidence * 0.6);
      positions.set(p.id, {
        x: clusterCx + Math.cos(memberAngle) * dist,
        y: clusterCy + Math.sin(memberAngle) * dist,
      });
    });
  }

  return positions;
}

// Find edges: patterns sharing the same persona
function computeEdges(
  patterns: KnowledgePattern[]
): { from: string; to: string; persona: string }[] {
  const edges: { from: string; to: string; persona: string }[] = [];
  const byPersona = new Map<string, KnowledgePattern[]>();

  for (const p of patterns) {
    if (!byPersona.has(p.personaName)) byPersona.set(p.personaName, []);
    byPersona.get(p.personaName)!.push(p);
  }

  for (const [persona, members] of byPersona) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        edges.push({
          from: members[i].id,
          to: members[j].id,
          persona,
        });
      }
    }
  }

  return edges;
}

// -- Detail Panel --

function DetailPanel({
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-3 top-3 z-50 w-72 rounded-xl border border-glass-hover bg-background/95 backdrop-blur-xl p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgClass}`}
          >
            <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {pattern.patternKey}
            </p>
            <p className="text-sm text-muted-dark">{pattern.personaName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-dark" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Success
          </p>
          <p className="text-base font-bold tabular-nums text-emerald-400">
            {pattern.successCount}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Failures
          </p>
          <p className="text-base font-bold tabular-nums text-rose-400">
            {pattern.failureCount}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Rate
          </p>
          <p className="text-base font-bold tabular-nums text-foreground">
            {(rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Cost
          </p>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatCost(pattern.avgCostUsd)}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Duration
          </p>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {formatDuration(pattern.avgDurationMs)}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-sm text-muted-dark uppercase tracking-wider">
            Confidence
          </p>
          <p className={`text-sm font-semibold tabular-nums ${config.textColor}`}>
            {Math.round(pattern.confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pattern.confidence * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="text-sm leading-relaxed text-foreground/60">
        {pattern.description}
      </p>

      <div className="mt-2 flex items-center gap-1 text-sm text-muted-dark">
        <Clock className="h-2.5 w-2.5" />
        Last seen {relativeTime(pattern.lastSeen)}
      </div>
    </motion.div>
  );
}

// -- Graph Node --

function GraphNode({
  pattern,
  position,
  isSelected,
  isHighlighted,
  isDimmed,
  onSelect,
  onHover,
  onLeave,
}: {
  pattern: KnowledgePattern;
  position: NodePosition;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onSelect: (p: KnowledgePattern) => void;
  onHover: (p: KnowledgePattern) => void;
  onLeave: () => void;
}) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const size = 16 + pattern.confidence * 20; // 16-36px based on confidence

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isDimmed ? 0.25 : 1,
        scale: 1,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(pattern)}
      onMouseEnter={() => onHover(pattern)}
      onMouseLeave={onLeave}
    >
      {/* Glow ring on hover/select */}
      {(isSelected || isHighlighted) && (
        <circle
          cx={position.x}
          cy={position.y}
          r={size / 2 + 6}
          fill="none"
          stroke={config.color}
          strokeWidth={1.5}
          opacity={0.4}
        />
      )}

      {/* Node circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={size / 2}
        fill={`${config.color}20`}
        stroke={isSelected ? config.color : `${config.color}40`}
        strokeWidth={isSelected ? 2 : 1}
      />

      {/* Icon (foreignObject for Lucide) */}
      <foreignObject
        x={position.x - 6}
        y={position.y - 6}
        width={12}
        height={12}
        style={{ overflow: "visible" }}
      >
        <div className="flex items-center justify-center w-3 h-3">
          <Icon className={`w-3 h-3 ${config.textColor}`} />
        </div>
      </foreignObject>

      {/* Label below */}
      <text
        x={position.x}
        y={position.y + size / 2 + 12}
        textAnchor="middle"
        className="text-sm fill-current text-foreground/60"
        style={{ fontSize: "8px" }}
      >
        {pattern.patternKey.length > 18
          ? pattern.patternKey.slice(0, 16) + "..."
          : pattern.patternKey}
      </text>
    </motion.g>
  );
}

// -- Main Component --

export default function KnowledgeClusterGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedPattern, setSelectedPattern] =
    useState<KnowledgePattern | null>(null);
  const [hoveredPattern, setHoveredPattern] =
    useState<KnowledgePattern | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | KnowledgeType>(
    "all"
  );

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filteredPatterns = useMemo(() => {
    if (activeFilter === "all") return MOCK_KNOWLEDGE_PATTERNS;
    return MOCK_KNOWLEDGE_PATTERNS.filter(
      (p) => p.knowledgeType === activeFilter
    );
  }, [activeFilter]);

  const nodePositions = useMemo(
    () =>
      computeNodePositions(
        filteredPatterns,
        dimensions.width,
        dimensions.height
      ),
    [filteredPatterns, dimensions]
  );

  const edges = useMemo(() => computeEdges(filteredPatterns), [filteredPatterns]);

  // Determine which nodes to highlight (same persona as hovered)
  const highlightedIds = useMemo(() => {
    if (!hoveredPattern) return new Set<string>();
    const ids = new Set<string>();
    for (const p of filteredPatterns) {
      if (p.personaName === hoveredPattern.personaName) {
        ids.add(p.id);
      }
    }
    return ids;
  }, [hoveredPattern, filteredPatterns]);

  // Summary stats
  const stats = useMemo(() => {
    const total = MOCK_KNOWLEDGE_PATTERNS.length;
    const avgConfidence =
      MOCK_KNOWLEDGE_PATTERNS.reduce((s, p) => s + p.confidence, 0) / total;
    const personas = new Set(MOCK_KNOWLEDGE_PATTERNS.map((p) => p.personaName))
      .size;
    const types = new Set(MOCK_KNOWLEDGE_PATTERNS.map((p) => p.knowledgeType))
      .size;
    return { total, avgConfidence, personas, types };
  }, []);

  const handleSelect = useCallback(
    (p: KnowledgePattern) => {
      setSelectedPattern((prev) => (prev?.id === p.id ? null : p));
    },
    []
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col h-[calc(100vh-10rem)]"
    >
      {/* Top Bar */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-4 flex-wrap mb-3 shrink-0"
      >
        <div className="flex items-center gap-4 text-sm mr-auto">
          <span className="text-muted-dark">
            Nodes{" "}
            <span className="text-foreground font-bold tabular-nums">
              {stats.total}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Agents{" "}
            <span className="text-cyan-400 font-bold tabular-nums">
              {stats.personas}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Clusters{" "}
            <span className="text-purple-400 font-bold tabular-nums">
              {stats.types}
            </span>
          </span>
          <span className="text-white/[0.1]">|</span>
          <span className="text-muted-dark">
            Avg Conf{" "}
            <span className="text-emerald-400 font-bold tabular-nums">
              {Math.round(stats.avgConfidence * 100)}%
            </span>
          </span>
        </div>

        {/* Cluster filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveFilter("all");
              setSelectedPattern(null);
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
              activeFilter === "all"
                ? "bg-white/[0.1] text-foreground"
                : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
            }`}
          >
            All
          </button>
          {(Object.keys(TYPE_CONFIG) as KnowledgeType[]).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const TIcon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => {
                  setActiveFilter(type);
                  setSelectedPattern(null);
                }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 ${
                  activeFilter === type
                    ? `${cfg.bgClass} ${cfg.textColor} ring-1 ring-white/[0.1]`
                    : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <TIcon className="h-3 w-3" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Graph Area */}
      <motion.div
        variants={fadeUp}
        className="relative flex-1 min-h-0 rounded-xl border border-glass bg-white/[0.01] overflow-hidden grid-texture"
        ref={containerRef}
      >
        {/* Radial gradient backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--brand-purple) 5%, transparent), transparent 80%)",
          }}
        />

        {/* Cluster labels */}
        {activeFilter === "all" &&
          (Object.entries(TYPE_CONFIG) as [KnowledgeType, (typeof TYPE_CONFIG)[KnowledgeType]][]).map(
            ([type, config]) => {
              const angle = (config.clusterAngle * Math.PI) / 180;
              const labelRadius = Math.min(dimensions.width, dimensions.height) * 0.32 + 60;
              const lx = dimensions.width / 2 + Math.cos(angle) * labelRadius;
              const ly = dimensions.height / 2 + Math.sin(angle) * labelRadius;

              return (
                <div
                  key={type}
                  className="absolute pointer-events-none"
                  style={{
                    left: lx,
                    top: ly,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span
                    className={`text-sm font-semibold uppercase tracking-wider ${config.textColor} opacity-40`}
                  >
                    {config.label}
                  </span>
                </div>
              );
            }
          )}

        {/* SVG graph */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const from = nodePositions.get(edge.from);
            const to = nodePositions.get(edge.to);
            if (!from || !to) return null;
            const personaColor = PERSONA_COLORS[edge.persona] ?? "#64748b";
            const isHovered =
              hoveredPattern &&
              (hoveredPattern.id === edge.from ||
                hoveredPattern.id === edge.to);

            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={personaColor}
                strokeWidth={isHovered ? 1.5 : 0.5}
                opacity={
                  hoveredPattern
                    ? isHovered
                      ? 0.6
                      : 0.05
                    : 0.15
                }
                strokeDasharray={isHovered ? "none" : "4 4"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            );
          })}

          {/* Nodes */}
          {filteredPatterns.map((pattern) => {
            const pos = nodePositions.get(pattern.id);
            if (!pos) return null;

            const isDimmed =
              hoveredPattern !== null &&
              !highlightedIds.has(pattern.id);

            return (
              <GraphNode
                key={pattern.id}
                pattern={pattern}
                position={pos}
                isSelected={selectedPattern?.id === pattern.id}
                isHighlighted={highlightedIds.has(pattern.id)}
                isDimmed={isDimmed}
                onSelect={handleSelect}
                onHover={setHoveredPattern}
                onLeave={() => setHoveredPattern(null)}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute left-3 bottom-3 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg border border-glass px-3 py-2">
          <span className="text-sm text-muted-dark uppercase tracking-wider font-semibold">
            Agent Links
          </span>
          {Object.entries(PERSONA_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-foreground/50">{name}</span>
            </div>
          ))}
        </div>

        {/* Node size legend */}
        <div className="absolute left-3 top-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg border border-glass px-3 py-2">
          <span className="text-sm text-muted-dark uppercase tracking-wider font-semibold">
            Node Size
          </span>
          <span className="text-sm text-foreground/40">= confidence</span>
          <div className="flex items-center gap-1 ml-2">
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="3" fill="white" opacity={0.15} />
            </svg>
            <span className="text-sm text-foreground/30">low</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14">
              <circle cx="7" cy="7" r="6" fill="white" opacity={0.15} />
            </svg>
            <span className="text-sm text-foreground/30">high</span>
          </div>
        </div>

        {/* Floating Detail Panel */}
        <AnimatePresence>
          {selectedPattern && (
            <DetailPanel
              key={selectedPattern.id}
              pattern={selectedPattern}
              onClose={() => setSelectedPattern(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
