"use client";

import { useId, useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, MessageSquare, Github, Calendar, CreditCard, HardDrive,
  SquareKanban, Figma, Globe, Database, Bell, Webhook,
  FileText, Cloud, Rss, Shield, Terminal, Bot,
  Plug, Share2, Link2, Download, X, Plus, Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import TerminalChrome from "@/components/TerminalChrome";
import GradientText from "@/components/GradientText";

/* ── Catalogue of available tool integrations ── */

interface ToolDef {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: "producer" | "consumer" | "both";
}

const TOOL_CATALOGUE: ToolDef[] = [
  { id: "gmail", name: "Gmail", icon: Mail, color: "#ea4335", category: "both" },
  { id: "slack", name: "Slack", icon: MessageSquare, color: "#4a154b", category: "both" },
  { id: "github", name: "GitHub", icon: Github, color: "#8b5cf6", category: "both" },
  { id: "calendar", name: "Calendar", icon: Calendar, color: "#06b6d4", category: "producer" },
  { id: "stripe", name: "Stripe", icon: CreditCard, color: "#635bff", category: "both" },
  { id: "jira", name: "Jira", icon: SquareKanban, color: "#0052cc", category: "both" },
  { id: "drive", name: "Drive", icon: HardDrive, color: "#34a853", category: "consumer" },
  { id: "figma", name: "Figma", icon: Figma, color: "#f24e1e", category: "consumer" },
  { id: "webhook", name: "Webhook", icon: Webhook, color: "#f59e0b", category: "producer" },
  { id: "api", name: "REST API", icon: Globe, color: "#3b82f6", category: "both" },
  { id: "database", name: "Database", icon: Database, color: "#14b8a6", category: "consumer" },
  { id: "notify", name: "Notify", icon: Bell, color: "#ec4899", category: "consumer" },
  { id: "docs", name: "Docs", icon: FileText, color: "#6366f1", category: "consumer" },
  { id: "s3", name: "S3 Bucket", icon: Cloud, color: "#f97316", category: "both" },
  { id: "rss", name: "RSS Feed", icon: Rss, color: "#fb923c", category: "producer" },
  { id: "auth", name: "Auth", icon: Shield, color: "#10b981", category: "producer" },
  { id: "cli", name: "CLI", icon: Terminal, color: "#a3a3a3", category: "both" },
  { id: "agent", name: "AI Agent", icon: Bot, color: "#8b5cf6", category: "both" },
  { id: "plugin", name: "Plugin", icon: Plug, color: "#d946ef", category: "both" },
  { id: "pubsub", name: "Pub/Sub", icon: Share2, color: "#0ea5e9", category: "both" },
];

const TOOL_MAP = new Map(TOOL_CATALOGUE.map((t) => [t.id, t]));

/* ── Canvas node & wire types ── */

interface CanvasNode {
  id: string;
  toolId: string;
  side: "producer" | "consumer";
  x: number; // percentage 0-100 within canvas
}

interface Wire {
  from: string; // node id
  to: string; // node id
  label: string;
}

/* ── Shareable URL encoding ── */

interface FlowState {
  nodes: CanvasNode[];
  wires: Wire[];
}

function encodeFlow(state: FlowState): string {
  const json = JSON.stringify(state);
  if (typeof window !== "undefined" && typeof btoa === "function") {
    return btoa(encodeURIComponent(json));
  }
  return "";
}

function decodeFlow(hash: string): FlowState | null {
  try {
    const json = decodeURIComponent(atob(hash));
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed.nodes) && Array.isArray(parsed.wires)) {
      return parsed as FlowState;
    }
  } catch { /* invalid hash */ }
  return null;
}

/* ── SVG constants ── */
const VB_W = 100;
const VB_H = 100;
const QUEUE_Y = 50;
const PRODUCER_Y = 16;
const CONSUMER_Y = 84;
const NODE_R = 5;

/* ── Default starter flow ── */
const DEFAULT_NODES: CanvasNode[] = [
  { id: "n1", toolId: "gmail", side: "producer", x: 20 },
  { id: "n2", toolId: "github", side: "producer", x: 50 },
  { id: "n3", toolId: "webhook", side: "producer", x: 80 },
  { id: "n4", toolId: "jira", side: "consumer", x: 25 },
  { id: "n5", toolId: "slack", side: "consumer", x: 55 },
  { id: "n6", toolId: "database", side: "consumer", x: 80 },
];

const DEFAULT_WIRES: Wire[] = [
  { from: "n1", to: "n4", label: "email.received" },
  { from: "n2", to: "n5", label: "pr.opened" },
  { from: "n3", to: "n6", label: "hook.payload" },
];

let _nextId = 100;
function nextId() {
  return `n${++_nextId}`;
}

/* ── Main composer ── */

export default function FlowComposer({ onClose }: { onClose: () => void }) {
  const uid = useId();
  const evGlow = `${uid}-cGlow`;
  const qGrad = `${uid}-cQGrad`;
  const qClip = `${uid}-cQClip`;

  // Load from hash or use defaults
  const [nodes, setNodes] = useState<CanvasNode[]>(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#flow=")) {
      const decoded = decodeFlow(window.location.hash.slice(6));
      if (decoded) return decoded.nodes;
    }
    return DEFAULT_NODES;
  });

  const [wires, setWires] = useState<Wire[]>(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#flow=")) {
      const decoded = decodeFlow(window.location.hash.slice(6));
      if (decoded) return decoded.wires;
    }
    return DEFAULT_WIRES;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wiringFrom, setWiringFrom] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafPending = useRef(false);
  const hashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync hash on state change — debounced 500ms
  useEffect(() => {
    if (hashTimerRef.current) clearTimeout(hashTimerRef.current);
    hashTimerRef.current = setTimeout(() => {
      const encoded = encodeFlow({ nodes, wires });
      if (encoded) {
        window.history.replaceState(null, "", `#flow=${encoded}`);
      }
      hashTimerRef.current = null;
    }, 500);
    return () => {
      if (hashTimerRef.current) clearTimeout(hashTimerRef.current);
    };
  }, [nodes, wires]);

  const shareUrl = useCallback(() => {
    const encoded = encodeFlow({ nodes, wires });
    const url = `${window.location.origin}${window.location.pathname}#flow=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }, [nodes, wires]);

  // Drag handling — convert mouse position to SVG viewBox coords
  const toSvgX = useCallback((clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return 50;
    const rect = svg.getBoundingClientRect();
    const ratio = VB_W / rect.width;
    return Math.max(8, Math.min(92, (clientX - rect.left) * ratio));
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragNode || rafPending.current) return;
      const clientX = e.clientX;
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        const x = toSvgX(clientX);
        setNodes((prev) => prev.map((n) => (n.id === dragNode ? { ...n, x } : n)));
      });
    },
    [dragNode, toSvgX],
  );

  const handlePointerUp = useCallback(() => {
    setDragNode(null);
  }, []);

  // Add a node from the sidebar
  const addNode = useCallback((toolId: string, side: "producer" | "consumer") => {
    const existing = nodes.filter((n) => n.side === side);
    const x = existing.length === 0 ? 50 : Math.min(92, (existing[existing.length - 1]?.x ?? 50) + 18);
    const id = nextId();
    setNodes((prev) => [...prev, { id, toolId, side, x }]);
    setSidebarOpen(false);
  }, [nodes]);

  // Remove a node and its wires
  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setWires((prev) => prev.filter((w) => w.from !== nodeId && w.to !== nodeId));
    if (wiringFrom === nodeId) setWiringFrom(null);
  }, [wiringFrom]);

  // Click on a node: start/finish wiring
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (dragNode) return; // ignore clicks during drag
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (!wiringFrom) {
        // Only producers can be wire sources
        if (node.side === "producer") setWiringFrom(nodeId);
        return;
      }

      // Complete wire: target must be a consumer and different from source
      if (node.side === "consumer" && wiringFrom !== nodeId) {
        // Don't duplicate
        const exists = wires.some((w) => w.from === wiringFrom && w.to === nodeId);
        if (!exists) {
          const fromTool = TOOL_MAP.get(nodes.find((n) => n.id === wiringFrom)?.toolId ?? "");
          setWires((prev) => [
            ...prev,
            { from: wiringFrom, to: nodeId, label: `${fromTool?.name ?? "event"}.trigger` },
          ]);
        }
      }
      setWiringFrom(null);
    },
    [wiringFrom, nodes, wires, dragNode],
  );

  // Remove a wire
  const removeWire = useCallback((from: string, to: string) => {
    setWires((prev) => prev.filter((w) => !(w.from === from && w.to === to)));
  }, []);

  // Node position helpers
  const nodePos = useCallback(
    (id: string): { x: number; y: number } => {
      const n = nodes.find((nd) => nd.id === id);
      if (!n) return { x: 50, y: QUEUE_Y };
      return { x: n.x, y: n.side === "producer" ? PRODUCER_Y : CONSUMER_Y };
    },
    [nodes],
  );

  const hasContent = nodes.length > 0;

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white/90 sm:text-xl">
            <GradientText>Flow Composer</GradientText>
          </h3>
          <p className="text-xs text-white/70 mt-1 font-mono">
            Drag nodes, click producer then consumer to wire, share your flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1.5 text-[11px] font-mono text-brand-cyan/80 hover:bg-brand-cyan/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
          >
            <Plus className="w-3 h-3" />
            Add Node
          </button>
          <button
            onClick={shareUrl}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-white/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
          >
            <Link2 className="w-3 h-3" />
            Share
          </button>
          <button
            onClick={onClose}
            aria-label="Close Flow Composer"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-white/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 z-30 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 px-4 py-1.5 text-xs font-mono text-brand-cyan"
          >
            URL copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 top-14 z-20 w-56 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-3 shadow-2xl"
          >
            <p className="text-[10px] font-mono text-white/70 uppercase tracking-wider mb-2">
              Available Integrations
            </p>
            <div className="space-y-1">
              {TOOL_CATALOGUE.map((tool) => {
                const alreadyOnCanvas = nodes.some((n) => n.toolId === tool.id);
                return (
                  <div key={tool.id} className="flex items-center gap-2">
                    <button
                      disabled={alreadyOnCanvas && tool.category !== "both"}
                      onClick={() =>
                        addNode(
                          tool.id,
                          tool.category === "consumer" ? "consumer" : "producer",
                        )
                      }
                      className="flex-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <tool.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tool.color }} />
                      <span className="text-white/70">{tool.name}</span>
                      <span className="ml-auto text-[9px] text-white/70 font-mono uppercase">
                        {tool.category === "both" ? "any" : tool.category === "producer" ? "prod" : "cons"}
                      </span>
                    </button>
                    {tool.category === "both" && !nodes.some((n) => n.toolId === tool.id && n.side === "consumer") && (
                      <button
                        onClick={() => addNode(tool.id, "consumer")}
                        className="text-[9px] text-white/70 hover:text-white/80 font-mono px-1"
                        title="Add as consumer"
                      >
                        +C
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_80px_rgba(0,0,0,0.4)]">
        <TerminalChrome
          title="flow-composer — interactive"
          status={wiringFrom ? "wiring..." : "ready"}
          className="mb-4 pb-3"
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          style={{ minHeight: 340 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <filter id={evGlow}>
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={qGrad} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6,182,212,0.0)" />
              <stop offset="15%" stopColor="rgba(6,182,212,0.1)" />
              <stop offset="50%" stopColor="rgba(168,85,247,0.08)" />
              <stop offset="85%" stopColor="rgba(6,182,212,0.1)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
            </linearGradient>
            <clipPath id={qClip}>
              <rect x="5" y={QUEUE_Y - 4} width="90" height="8" rx="4" />
            </clipPath>
          </defs>

          {/* Event queue bar */}
          <rect x="5" y={QUEUE_Y - 4} width="90" height="8" rx="4" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
          <rect x="5" y={QUEUE_Y - 4} width="90" height="8" rx="4" fill={`url(#${qGrad})`} />
          <text x="50" y={QUEUE_Y + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(6,182,212,0.25)" fontSize="2.2" fontFamily="var(--font-geist-mono)" letterSpacing="0.15em">
            EVENT QUEUE
          </text>
          <line x1="8" y1={QUEUE_Y} x2="92" y2={QUEUE_Y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" strokeDasharray="2 3" />
          <polygon points={`93,${QUEUE_Y - 1} 95.5,${QUEUE_Y} 93,${QUEUE_Y + 1}`} fill="rgba(6,182,212,0.2)" />

          {/* Wires with animated dots */}
          {wires.map((wire) => {
            const from = nodePos(wire.from);
            const to = nodePos(wire.to);
            const midX = (from.x + to.x) / 2;
            return (
              <g key={`${wire.from}-${wire.to}`}>
                <path
                  d={`M ${from.x} ${from.y + NODE_R} L ${from.x} ${QUEUE_Y} L ${to.x} ${QUEUE_Y} L ${to.x} ${to.y - NODE_R}`}
                  fill="none"
                  stroke="rgba(6,182,212,0.3)"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
                {/* Animated event dot */}
                <motion.circle
                  r="0.9"
                  fill="rgba(6,182,212,0.95)"
                  filter={`url(#${evGlow})`}
                  initial={{ cx: from.x, cy: from.y + NODE_R, opacity: 0 }}
                  animate={{
                    cx: [from.x, from.x, to.x, to.x],
                    cy: [from.y + NODE_R, QUEUE_Y, QUEUE_Y, to.y - NODE_R],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
                {/* Wire label */}
                <text
                  x={midX}
                  y={QUEUE_Y - 6}
                  textAnchor="middle"
                  fill="rgba(6,182,212,0.35)"
                  fontSize="1.6"
                  fontFamily="var(--font-geist-mono)"
                >
                  {wire.label}
                </text>
                {/* Delete wire hit area */}
                <circle
                  cx={midX}
                  cy={QUEUE_Y - 6}
                  r="2.5"
                  fill="transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove wire ${wire.label}`}
                  className="cursor-pointer focus-visible:outline-none focus-visible:stroke-brand-cyan focus-visible:stroke-[0.5]"
                  onClick={() => removeWire(wire.from, wire.to)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      removeWire(wire.from, wire.to);
                    }
                  }}
                >
                  <title>Remove wire</title>
                </circle>
              </g>
            );
          })}

          {/* Connector lines (no wire yet) */}
          {nodes.map((node) => {
            const y = node.side === "producer" ? PRODUCER_Y : CONSUMER_Y;
            const connStart = node.side === "producer" ? y + NODE_R : QUEUE_Y + 4;
            const connEnd = node.side === "producer" ? QUEUE_Y - 4 : y - NODE_R;
            return (
              <line
                key={`conn-${node.id}`}
                x1={node.x}
                y1={connStart}
                x2={node.x}
                y2={connEnd}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.3"
                strokeDasharray="1.5 2"
              />
            );
          })}

          {/* Wiring in progress indicator */}
          {wiringFrom && (
            <text x="50" y="4" textAnchor="middle" fill="rgba(6,182,212,0.5)" fontSize="2" fontFamily="var(--font-geist-mono)">
              Click a consumer node to complete the wire
            </text>
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const tool = TOOL_MAP.get(node.toolId);
            if (!tool) return null;
            const y = node.side === "producer" ? PRODUCER_Y : CONSUMER_Y;
            const isWiringSource = wiringFrom === node.id;

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${tool.name} ${node.side} node`}
                className="cursor-grab focus-visible:outline-none [&:focus-visible>circle:nth-of-type(1)]:stroke-[1] [&:focus-visible>circle:nth-of-type(1)]:stroke-brand-cyan"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDragNode(node.id);
                  (e.target as SVGElement).setPointerCapture?.(e.pointerId);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }
                }}
              >
                {/* Outer glow on wiring source */}
                {isWiringSource && (
                  <circle cx={node.x} cy={y} r={NODE_R + 2} fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.3" strokeDasharray="1 1">
                    <animate attributeName="r" values={`${NODE_R + 1.5};${NODE_R + 2.5};${NODE_R + 1.5}`} dur="1s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node circle */}
                <circle cx={node.x} cy={y} r={NODE_R} fill={`${tool.color}15`} stroke={tool.color} strokeWidth="0.35" opacity="0.8" />
                <circle cx={node.x} cy={y} r="1.8" fill={tool.color} opacity="0.8" />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.side === "producer" ? y - NODE_R - 2 : y + NODE_R + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="2.2"
                  fontFamily="var(--font-geist-mono)"
                  letterSpacing="0.04em"
                >
                  {tool.name}
                </text>
                <text
                  x={node.x}
                  y={node.side === "producer" ? y + NODE_R + 3.5 : y - NODE_R - 1}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="1.3"
                  fontFamily="var(--font-geist-mono)"
                  letterSpacing="0.08em"
                >
                  {node.side === "producer" ? "PRODUCER" : "CONSUMER"}
                </text>

                {/* Delete button */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${tool.name} node`}
                  className="cursor-pointer opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none [&:focus-visible>circle]:stroke-[0.5] [&:focus-visible>circle]:stroke-brand-cyan"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(node.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      removeNode(node.id);
                    }
                  }}
                >
                  <circle
                    cx={node.x + NODE_R}
                    cy={y - NODE_R}
                    r="1.5"
                    fill="rgba(239,68,68,0.3)"
                    stroke="rgba(239,68,68,0.5)"
                    strokeWidth="0.2"
                  />
                  <text
                    x={node.x + NODE_R}
                    y={y - NODE_R + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(239,68,68,0.8)"
                    fontSize="1.5"
                    fontFamily="var(--font-geist-mono)"
                  >
                    x
                  </text>
                </g>
              </g>
            );
          })}

          {/* Empty state */}
          {!hasContent && (
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.2)" fontSize="3" fontFamily="var(--font-geist-mono)">
              Click &quot;Add Node&quot; to start building
            </text>
          )}
        </svg>
      </div>

      {/* CTA */}
      {wires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple motion-safe:animate-border-flow shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <a
              href="#download"
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/60"
            >
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                motion-safe:-translate-x-full motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:translate-x-full
                motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:transition-opacity motion-reduce:duration-300" 
              />
              <Download className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="relative">Build this flow in Personas</span>
            </a>
          </div>
          <p className="text-[11px] text-white/70 font-mono">
            {nodes.length} nodes, {wires.length} connection{wires.length !== 1 ? "s" : ""} — ready to import
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-white/70">
        <div className="flex items-center gap-2">
          <Trash2 className="w-3 h-3 text-white/70" />
          <span>Hover node to delete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
          <span>Click producer → consumer to wire</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="8" className="text-white/70" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
          <span>Drag nodes to reposition</span>
        </div>
      </div>

      {/* Glow behind */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-brand-cyan/4 via-transparent to-brand-purple/4 blur-2xl" />
    </div>
  );
}
