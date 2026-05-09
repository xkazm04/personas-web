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
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { type KnowledgePattern } from "@/lib/mock-dashboard-data";
import {
  DERIVED_KNOWLEDGE_PATTERNS,
  relativeFromNow,
  type DerivedKnowledgePattern,
} from "./derived";

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

// Inline SVG path data for Lucide icons (24x24 viewbox).
// Rendered as native SVG instead of foreignObject + Lucide React component
// to avoid per-node compositor reflows.
const ICON_PATHS: Record<KnowledgeType, React.ReactNode> = {
  tool_sequence: (
    <>
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </>
  ),
  failure_pattern: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </>
  ),
  cost_quality: (
    <>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  model_performance: (
    <>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </>
  ),
  data_flow: (
    <>
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </>
  ),
};

// -- Layout computation --

function computeNodePositions(
  patterns: DerivedKnowledgePattern[],
  width: number,
  height: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  // Group by type
  const groups = new Map<KnowledgeType, DerivedKnowledgePattern[]>();
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
  patterns: DerivedKnowledgePattern[]
): { from: string; to: string; persona: string }[] {
  const edges: { from: string; to: string; persona: string }[] = [];
  const byPersona = new Map<string, DerivedKnowledgePattern[]>();

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
  nowMs,
  onClose,
}: {
  pattern: DerivedKnowledgePattern;
  nowMs: number;
  onClose: () => void;
}) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = pattern.__successRate;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-3 top-3 z-50 w-72 rounded-xl border border-white/[0.08] bg-background/95 backdrop-blur-xl p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgClass}`}
          >
            <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">
              {pattern.patternKey}
            </p>
            <p className="text-[10px] text-muted-dark">{pattern.personaName}</p>
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
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Success
          </p>
          <p className="text-sm font-bold tabular-nums text-emerald-400">
            {pattern.successCount}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Failures
          </p>
          <p className="text-sm font-bold tabular-nums text-rose-400">
            {pattern.failureCount}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Rate
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {(rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Cost
          </p>
          <p className="text-xs font-semibold tabular-nums text-foreground">
            {pattern.__costFormatted}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Duration
          </p>
          <p className="text-xs font-semibold tabular-nums text-foreground">
            {pattern.__durationFormatted}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-dark uppercase tracking-wider">
            Confidence
          </p>
          <p className={`text-xs font-semibold tabular-nums ${config.textColor}`}>
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

      <p className="text-[11px] leading-relaxed text-foreground/60">
        {pattern.description}
      </p>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-dark">
        <Clock className="h-2.5 w-2.5" />
        Last seen {relativeFromNow(nowMs, pattern.__lastSeenMs)}
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
  showLabel,
  onSelect,
  onHover,
  onLeave,
}: {
  pattern: DerivedKnowledgePattern;
  position: NodePosition;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  showLabel: boolean;
  onSelect: (p: DerivedKnowledgePattern) => void;
  onHover: (p: DerivedKnowledgePattern) => void;
  onLeave: () => void;
}) {
  const config = TYPE_CONFIG[pattern.knowledgeType];
  // Min diameter 28px ensures 24px tap-target floor; scales up with confidence.
  const size = 28 + pattern.confidence * 20; // 28-48px based on confidence
  const iconScale = size / 36;
  const iconOffset = 6 * iconScale;

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

      {/* Inline SVG icon scaled to node size */}
      <g
        transform={`translate(${position.x - iconOffset}, ${position.y - iconOffset}) scale(${iconScale * 0.5})`}
        fill="none"
        stroke={config.color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      >
        {ICON_PATHS[pattern.knowledgeType]}
      </g>

      {/* Label below — only shown for hovered cluster or selected node */}
      {showLabel && (
        <text
          x={position.x}
          y={position.y + size / 2 + 14}
          textAnchor="middle"
          className="fill-current text-foreground/80"
          style={{ fontSize: "10px", pointerEvents: "none" }}
        >
          {pattern.patternKey.length > 18
            ? pattern.patternKey.slice(0, 16) + "..."
            : pattern.patternKey}
        </text>
      )}
    </motion.g>
  );
}

// -- Main Component --

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

export default function KnowledgeClusterGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedPattern, setSelectedPattern] =
    useState<DerivedKnowledgePattern | null>(null);
  const [hoveredPattern, setHoveredPattern] =
    useState<DerivedKnowledgePattern | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | KnowledgeType>(
    "all"
  );

  // Freeze "now" once per mount so the DetailPanel's relative-time label
  // doesn't shift across re-renders triggered by hover/zoom/pan state.
  const nowMs = useMemo(() => Date.now(), []);

  // Zoom/pan state for exploratory navigation.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<
    { x: number; y: number; panX: number; panY: number } | null
  >(null);

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

  // Wheel zoom anchored on cursor — registered via addEventListener with
  // passive:false because React's onWheel is passive and cannot preventDefault.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      setZoom((prev) => {
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
        const actual = next / prev;
        if (actual !== 1) {
          setPan((p) => ({
            x: mx - (mx - p.x) * actual,
            y: my - (my - p.y) * actual,
          }));
        }
        return next;
      });
    };
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  // Drag-to-pan: track movement on window so cursor leaving the SVG mid-drag
  // doesn't strand the gesture.
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      setPan({
        x: start.panX + (e.clientX - start.x),
        y: start.panY + (e.clientY - start.y),
      });
    };
    const handleUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y]
  );

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomStep = useCallback((direction: 1 | -1) => {
    const factor = direction === 1 ? 1.2 : 1 / 1.2;
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
      const actual = next / prev;
      if (actual !== 1) {
        // Anchor on viewport center so keyboard-driven zoom stays predictable.
        const svg = svgRef.current;
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          setPan((p) => ({
            x: cx - (cx - p.x) * actual,
            y: cy - (cy - p.y) * actual,
          }));
        }
      }
      return next;
    });
  }, []);

  const filteredPatterns = useMemo(() => {
    if (activeFilter === "all") return DERIVED_KNOWLEDGE_PATTERNS;
    return DERIVED_KNOWLEDGE_PATTERNS.filter(
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

  // Batch edges into a single SVG path per persona, split into a "highlighted"
  // segment (touching the hovered node) and a "normal" segment so each persona
  // collapses from N motion.line elements to at most 2 static <path> elements.
  const batchedEdgePaths = useMemo(() => {
    const result = new Map<string, { normalD: string; highlightedD: string }>();
    const hoveredId = hoveredPattern?.id;

    for (const edge of edges) {
      const from = nodePositions.get(edge.from);
      const to = nodePositions.get(edge.to);
      if (!from || !to) continue;

      const segment = `M${from.x.toFixed(1)} ${from.y.toFixed(1)}L${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
      const isHighlighted =
        hoveredId !== undefined &&
        (edge.from === hoveredId || edge.to === hoveredId);

      let entry = result.get(edge.persona);
      if (!entry) {
        entry = { normalD: "", highlightedD: "" };
        result.set(edge.persona, entry);
      }
      if (isHighlighted) {
        entry.highlightedD += segment;
      } else {
        entry.normalD += segment;
      }
    }

    return result;
  }, [edges, nodePositions, hoveredPattern]);

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

  // Summary stats — single pass over the source data.
  const stats = useMemo(() => {
    const total = DERIVED_KNOWLEDGE_PATTERNS.length;
    let confSum = 0;
    const personaSet = new Set<string>();
    const typeSet = new Set<string>();
    for (const p of DERIVED_KNOWLEDGE_PATTERNS) {
      confSum += p.confidence;
      personaSet.add(p.personaName);
      typeSet.add(p.knowledgeType);
    }
    return {
      total,
      avgConfidence: total > 0 ? confSum / total : 0,
      personas: personaSet.size,
      types: typeSet.size,
    };
  }, []);

  const handleSelect = useCallback(
    (p: DerivedKnowledgePattern) => {
      setSelectedPattern((prev) => (prev?.id === p.id ? null : p));
    },
    []
  );

  // Suppress hover updates while panning so dragging across nodes
  // doesn't flicker the focus state.
  const handleNodeHover = useCallback(
    (p: DerivedKnowledgePattern) => {
      if (isDragging) return;
      setHoveredPattern(p);
    },
    [isDragging]
  );

  const handleNodeLeave = useCallback(() => {
    if (isDragging) return;
    setHoveredPattern(null);
  }, [isDragging]);

  const isViewTransformed = zoom !== 1 || pan.x !== 0 || pan.y !== 0;

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
        <div className="flex items-center gap-4 text-xs mr-auto">
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
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
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
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-200 ${
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
        className="relative flex-1 min-h-0 rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden grid-texture"
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

        {/* SVG graph */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {/* Background rect captures mousedown for pan; nodes paint on top
              and capture their own events first. */}
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill="transparent"
            onMouseDown={handlePanStart}
          />

          {/* Zoomable / pannable group */}
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {/* Cluster labels (now inside SVG so they zoom with content) */}
            {activeFilter === "all" &&
              (Object.entries(TYPE_CONFIG) as [
                KnowledgeType,
                (typeof TYPE_CONFIG)[KnowledgeType]
              ][]).map(([type, config]) => {
                const angle = (config.clusterAngle * Math.PI) / 180;
                const labelRadius =
                  Math.min(dimensions.width, dimensions.height) * 0.32 + 60;
                const lx =
                  dimensions.width / 2 + Math.cos(angle) * labelRadius;
                const ly =
                  dimensions.height / 2 + Math.sin(angle) * labelRadius;

                return (
                  <text
                    key={type}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={config.color}
                    opacity={0.55}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      pointerEvents: "none",
                    }}
                  >
                    {config.label}
                  </text>
                );
              })}

            {/* Edges (batched per-persona into one path each) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              pointerEvents="none"
            >
              {Array.from(batchedEdgePaths).map(
                ([persona, { normalD, highlightedD }]) => {
                  const personaColor = PERSONA_COLORS[persona] ?? "#64748b";
                  return (
                    <g key={persona}>
                      {normalD && (
                        <path
                          d={normalD}
                          stroke={personaColor}
                          strokeWidth={0.5}
                          fill="none"
                          opacity={hoveredPattern ? 0.08 : 0.18}
                          strokeDasharray="4 4"
                          style={{ transition: "opacity 0.2s ease" }}
                        />
                      )}
                      {highlightedD && (
                        <path
                          d={highlightedD}
                          stroke={personaColor}
                          strokeWidth={1.5}
                          fill="none"
                          opacity={0.7}
                        />
                      )}
                    </g>
                  );
                }
              )}
            </motion.g>

            {/* Nodes */}
            {filteredPatterns.map((pattern) => {
              const pos = nodePositions.get(pattern.id);
              if (!pos) return null;

              const isDimmed =
                hoveredPattern !== null &&
                !highlightedIds.has(pattern.id);

              const isSelected = selectedPattern?.id === pattern.id;
              const showLabel =
                isSelected ||
                (hoveredPattern !== null &&
                  pattern.knowledgeType === hoveredPattern.knowledgeType);

              return (
                <GraphNode
                  key={pattern.id}
                  pattern={pattern}
                  position={pos}
                  isSelected={isSelected}
                  isHighlighted={highlightedIds.has(pattern.id)}
                  isDimmed={isDimmed}
                  showLabel={showLabel}
                  onSelect={handleSelect}
                  onHover={handleNodeHover}
                  onLeave={handleNodeLeave}
                />
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute left-3 bottom-3 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg border border-white/[0.06] px-3 py-2">
          <span className="text-[9px] text-muted-dark uppercase tracking-wider font-semibold">
            Agent Links
          </span>
          {Object.entries(PERSONA_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-foreground/50">{name}</span>
            </div>
          ))}
        </div>

        {/* Node size legend */}
        <div className="absolute left-3 top-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg border border-white/[0.06] px-3 py-2">
          <span className="text-[9px] text-muted-dark uppercase tracking-wider font-semibold">
            Node Size
          </span>
          <span className="text-[9px] text-foreground/40">= confidence</span>
          <div className="flex items-center gap-1 ml-2">
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="3" fill="white" opacity={0.15} />
            </svg>
            <span className="text-[8px] text-foreground/30">low</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14">
              <circle cx="7" cy="7" r="6" fill="white" opacity={0.15} />
            </svg>
            <span className="text-[8px] text-foreground/30">high</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 bottom-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-white/[0.06] p-1">
          <button
            type="button"
            onClick={() => handleZoomStep(-1)}
            disabled={zoom <= MIN_ZOOM + 1e-3}
            className="p-1.5 rounded-md hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5 text-foreground/70" />
          </button>
          <span className="text-[10px] tabular-nums text-muted-dark min-w-[2.5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoomStep(1)}
            disabled={zoom >= MAX_ZOOM - 1e-3}
            className="p-1.5 rounded-md hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5 text-foreground/70" />
          </button>
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
          <button
            type="button"
            onClick={handleResetView}
            disabled={!isViewTransformed}
            className="p-1.5 rounded-md hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Reset view"
            title="Reset view"
          >
            <RotateCcw className="h-3.5 w-3.5 text-foreground/70" />
          </button>
        </div>

        {/* Floating Detail Panel */}
        <AnimatePresence>
          {selectedPattern && (
            <DetailPanel
              key={selectedPattern.id}
              pattern={selectedPattern}
              nowMs={nowMs}
              onClose={() => setSelectedPattern(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
