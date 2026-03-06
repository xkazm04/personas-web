"use client";

import { useId, useRef, useState, useCallback, useEffect, useMemo } from "react";
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
import { useIsMobile } from "@/hooks/useIsMobile";
import { CORE_TOOLS } from "@/lib/tool-catalogue";

/* ── Catalogue of available tool integrations (augmented with icons & categories) ── */

interface ToolDef {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: "producer" | "consumer" | "both";
}

const ICON_MAP: Record<string, LucideIcon> = {
  gmail: Mail, slack: MessageSquare, github: Github, calendar: Calendar,
  stripe: CreditCard, jira: SquareKanban, drive: HardDrive, figma: Figma,
  webhook: Webhook, api: Globe, database: Database, notify: Bell,
  docs: FileText, s3: Cloud, rss: Rss, auth: Shield, cli: Terminal,
  agent: Bot, plugin: Plug, pubsub: Share2,
};

const CATEGORY_MAP: Record<string, "producer" | "consumer" | "both"> = {
  gmail: "both", slack: "both", github: "both", calendar: "producer",
  stripe: "both", jira: "both", drive: "consumer", figma: "consumer",
  webhook: "producer", api: "both", database: "consumer", notify: "consumer",
  docs: "consumer", s3: "both", rss: "producer", auth: "producer",
  cli: "both", agent: "both", plugin: "both", pubsub: "both",
};

const TOOL_CATALOGUE: ToolDef[] = CORE_TOOLS.map((t) => ({
  ...t,
  icon: ICON_MAP[t.id] ?? Globe,
  category: CATEGORY_MAP[t.id] ?? "both",
}));

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

// Mobile-friendly sizes (used when isMobile is true)
const MOBILE_NODE_R = 8;
const MOBILE_PRODUCER_Y = 22;
const MOBILE_CONSUMER_Y = 78;
const MOBILE_FONT_SIZE = 3.5;
const MOBILE_LABEL_FONT = 2;
const MOBILE_DELETE_R = 4;
const MOBILE_WIRE_HIT_R = 5;

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

/* ── Main composer ── */

export default function FlowComposer({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const nextIdRef = useRef(100);
  const nextId = () => `n${++nextIdRef.current}`;

  const uid = useId();
  const evGlow = `${uid}-cGlow`;
  const qGrad = `${uid}-cQGrad`;
  const qClip = `${uid}-cQClip`;

  // Responsive sizing
  const nr = isMobile ? MOBILE_NODE_R : NODE_R;
  const prodY = isMobile ? MOBILE_PRODUCER_Y : PRODUCER_Y;
  const consY = isMobile ? MOBILE_CONSUMER_Y : CONSUMER_Y;
  const labelFs = isMobile ? MOBILE_FONT_SIZE : 2.2;
  const subLabelFs = isMobile ? MOBILE_LABEL_FONT : 1.3;
  const delR = isMobile ? MOBILE_DELETE_R : 1.5;
  const wireHitR = isMobile ? MOBILE_WIRE_HIT_R : 2.5;

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
  const dragRef = useRef<{ id: string; origX: number; currentX: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync hash on state change — skip during active drag to avoid
  // expensive synchronous history.replaceState calls at 60fps
  useEffect(() => {
    if (dragRef.current) return;
    const encoded = encodeFlow({ nodes, wires });
    if (encoded) {
      window.history.replaceState(null, "", `#flow=${encoded}`);
    }
  }, [nodes, wires]);

  const shareUrl = useCallback(() => {
    const encoded = encodeFlow({ nodes, wires });
    const url = `${window.location.origin}${window.location.pathname}#flow=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }, [nodes, wires]);

  // Node position lookup — O(1) per wire instead of O(N) find()
  const nodePosMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of nodes) {
      map.set(n.id, { x: n.x, y: n.side === "producer" ? prodY : consY });
    }
    return map;
  }, [nodes, prodY, consY]);

  const defaultPos = { x: 50, y: QUEUE_Y };
  const nodePos = (id: string) => nodePosMap.get(id) ?? defaultPos;

  // Drag handling — convert mouse position to SVG viewBox coords
  const toSvgX = useCallback((clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return 50;
    const rect = svg.getBoundingClientRect();
    const ratio = VB_W / rect.width;
    return Math.max(8, Math.min(92, (clientX - rect.left) * ratio));
  }, []);

  /* ── Direct DOM update during drag (bypasses React reconciliation) ── */
  const updateDragDOM = useCallback((nodeId: string, newX: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Find the node in state to get its original x for computing delta
    const drag = dragRef.current;
    if (!drag) return;
    const deltaX = newX - drag.origX;

    // Translate the dragged node group
    const nodeGroup = svg.querySelector(`[data-node-id="${nodeId}"]`) as SVGGElement | null;
    if (nodeGroup) {
      nodeGroup.setAttribute("transform", `translate(${deltaX}, 0)`);
    }

    // Update connector line for this node
    const conn = svg.querySelector(`[data-conn="${nodeId}"]`) as SVGLineElement | null;
    if (conn) {
      conn.setAttribute("x1", String(newX));
      conn.setAttribute("x2", String(newX));
    }

    // Update wire paths that reference this node
    svg.querySelectorAll(`[data-wire-from="${nodeId}"], [data-wire-to="${nodeId}"]`).forEach((el) => {
      const wireG = el as SVGGElement;
      const fromId = wireG.getAttribute("data-wire-from")!;
      const toId = wireG.getAttribute("data-wire-to")!;

      // Resolve effective x for each endpoint
      const fromX = fromId === nodeId ? newX : (nodePosMap.get(fromId)?.x ?? 50);
      const toX = toId === nodeId ? newX : (nodePosMap.get(toId)?.x ?? 50);
      const fromY = nodePosMap.get(fromId)?.y ?? QUEUE_Y;
      const toY = nodePosMap.get(toId)?.y ?? QUEUE_Y;

      // Wire path
      const path = wireG.querySelector("path");
      if (path) {
        path.setAttribute("d", `M ${fromX} ${fromY + nr} L ${fromX} ${QUEUE_Y} L ${toX} ${QUEUE_Y} L ${toX} ${toY - nr}`);
      }

      // Wire label position
      const midX = (fromX + toX) / 2;
      const label = wireG.querySelector<SVGTextElement>("text");
      if (label) label.setAttribute("x", String(midX));

      // Wire hit circle
      const hitCircle = wireG.querySelector<SVGCircleElement>("circle");
      if (hitCircle) hitCircle.setAttribute("cx", String(midX));

      // Animated dot (motion.circle) — update initial position but Framer handles animation
    });
  }, [nodePosMap, nr]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const x = toSvgX(e.clientX);
      drag.currentX = x;
      updateDragDOM(drag.id, x);
    },
    [toSvgX, updateDragDOM],
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    const finalX = drag.currentX;
    const nodeId = drag.id;
    dragRef.current = null;

    // Commit final position to React state (single re-render)
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, x: finalX } : n)));

    // Clean up transform — React will re-render with correct position
    const svg = svgRef.current;
    if (svg) {
      const nodeGroup = svg.querySelector(`[data-node-id="${nodeId}"]`) as SVGGElement | null;
      if (nodeGroup) nodeGroup.removeAttribute("transform");
    }
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
      if (dragRef.current) return; // ignore clicks during drag
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
    [wiringFrom, nodes, wires],
  );

  // Remove a wire
  const removeWire = useCallback((from: string, to: string) => {
    setWires((prev) => prev.filter((w) => !(w.from === from && w.to === to)));
  }, []);

  const hasContent = nodes.length > 0;

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white/90 sm:text-xl">
            <GradientText>Flow Composer</GradientText>
          </h3>
          <p className="text-xs text-white/40 mt-1 font-mono">
            Drag nodes, click producer then consumer to wire, share your flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1.5 text-[11px] font-mono text-brand-cyan/80 hover:bg-brand-cyan/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Node
          </button>
          <button
            onClick={shareUrl}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-white/60 hover:bg-white/10 transition-colors"
          >
            <Link2 className="w-3 h-3" />
            Share
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-white/60 hover:bg-white/10 transition-colors"
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

      {/* Sidebar / Bottom Sheet */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop on mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <motion.div
              initial={isMobile ? { opacity: 1, y: "100%" } : { opacity: 0, x: 20 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 1, y: "100%" } : { opacity: 0, x: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={
                isMobile
                  ? "fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-black/95 backdrop-blur-xl p-4 pb-8 shadow-2xl"
                  : "absolute right-0 top-14 z-20 w-56 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-3 shadow-2xl"
              }
            >
              {/* Drag handle on mobile */}
              {isMobile && (
                <div className="flex justify-center mb-3">
                  <div className="h-1 w-10 rounded-full bg-white/20" />
                </div>
              )}
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2">
                Available Integrations
              </p>
              <div className={isMobile ? "grid grid-cols-2 gap-1" : "space-y-1"}>
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
                        className={`flex-1 flex items-center gap-2 rounded-lg text-left transition-colors hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed ${
                          isMobile ? "px-3 py-2.5 text-sm" : "px-2.5 py-1.5 text-xs"
                        }`}
                      >
                        <tool.icon className={`flex-shrink-0 ${isMobile ? "w-4.5 h-4.5" : "w-3.5 h-3.5"}`} style={{ color: tool.color }} />
                        <span className="text-white/70">{tool.name}</span>
                        <span className={`ml-auto text-white/25 font-mono uppercase ${isMobile ? "text-[10px]" : "text-[9px]"}`}>
                          {tool.category === "both" ? "any" : tool.category === "producer" ? "prod" : "cons"}
                        </span>
                      </button>
                      {tool.category === "both" && !nodes.some((n) => n.toolId === tool.id && n.side === "consumer") && (
                        <button
                          onClick={() => addNode(tool.id, "consumer")}
                          className={`text-white/30 hover:text-white/60 font-mono ${isMobile ? "text-xs px-2 py-1" : "text-[9px] px-1"}`}
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
          </>
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
          className="w-full select-none touch-none"
          style={{ minHeight: isMobile ? 340 : 260 }}
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
              <g key={`${wire.from}-${wire.to}`} data-wire-from={wire.from} data-wire-to={wire.to}>
                <path
                  d={`M ${from.x} ${from.y + nr} L ${from.x} ${QUEUE_Y} L ${to.x} ${QUEUE_Y} L ${to.x} ${to.y - nr}`}
                  fill="none"
                  stroke="rgba(6,182,212,0.3)"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
                {/* Animated event dot */}
                <motion.circle
                  r={isMobile ? 1.5 : 0.9}
                  fill="rgba(6,182,212,0.95)"
                  filter={`url(#${evGlow})`}
                  initial={{ cx: from.x, cy: from.y + nr, opacity: 0 }}
                  animate={{
                    cx: [from.x, from.x, to.x, to.x],
                    cy: [from.y + nr, QUEUE_Y, QUEUE_Y, to.y - nr],
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
                  fontSize={isMobile ? 2.4 : 1.6}
                  fontFamily="var(--font-geist-mono)"
                >
                  {wire.label}
                </text>
                {/* Delete wire hit area */}
                <circle
                  cx={midX}
                  cy={QUEUE_Y - 6}
                  r={wireHitR}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => removeWire(wire.from, wire.to)}
                >
                  <title>Remove wire</title>
                </circle>
              </g>
            );
          })}

          {/* Connector lines (no wire yet) */}
          {nodes.map((node) => {
            const y = node.side === "producer" ? prodY : consY;
            const connStart = node.side === "producer" ? y + nr : QUEUE_Y + 4;
            const connEnd = node.side === "producer" ? QUEUE_Y - 4 : y - nr;
            return (
              <line
                key={`conn-${node.id}`}
                data-conn={node.id}
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
            const y = node.side === "producer" ? prodY : consY;
            const isWiringSource = wiringFrom === node.id;

            return (
              <g
                key={node.id}
                data-node-id={node.id}
                className="cursor-grab"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragRef.current = { id: node.id, origX: node.x, currentX: node.x };
                  (e.target as SVGElement).setPointerCapture?.(e.pointerId);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
              >
                {/* Outer glow on wiring source */}
                {isWiringSource && (
                  <circle cx={node.x} cy={y} r={nr + 2} fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.3" strokeDasharray="1 1">
                    <animate attributeName="r" values={`${nr + 1.5};${nr + 2.5};${nr + 1.5}`} dur="1s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node circle */}
                <circle cx={node.x} cy={y} r={nr} fill={`${tool.color}15`} stroke={tool.color} strokeWidth={isMobile ? 0.5 : 0.35} opacity="0.8" />
                <circle cx={node.x} cy={y} r={isMobile ? 3 : 1.8} fill={tool.color} opacity="0.8" />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.side === "producer" ? y - nr - 2 : y + nr + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize={labelFs}
                  fontFamily="var(--font-geist-mono)"
                  letterSpacing="0.04em"
                >
                  {tool.name}
                </text>
                <text
                  x={node.x}
                  y={node.side === "producer" ? y + nr + 3.5 : y - nr - 1}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.18)"
                  fontSize={subLabelFs}
                  fontFamily="var(--font-geist-mono)"
                  letterSpacing="0.08em"
                >
                  {node.side === "producer" ? "PRODUCER" : "CONSUMER"}
                </text>

                {/* Delete button — always visible on mobile for tap access */}
                <g
                  className={isMobile ? "cursor-pointer" : "cursor-pointer opacity-0 hover:opacity-100 transition-opacity"}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(node.id);
                  }}
                >
                  <circle
                    cx={node.x + nr}
                    cy={y - nr}
                    r={delR}
                    fill="rgba(239,68,68,0.3)"
                    stroke="rgba(239,68,68,0.5)"
                    strokeWidth={isMobile ? 0.3 : 0.2}
                  />
                  <text
                    x={node.x + nr}
                    y={y - nr + (isMobile ? 0.8 : 0.5)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(239,68,68,0.8)"
                    fontSize={isMobile ? 3 : 1.5}
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
          <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple animate-border-flow shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <a
              href="#download"
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-black/80 backdrop-blur-md px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/60"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Download className="relative h-5 w-5 text-brand-cyan transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="relative">Build this flow in Personas</span>
            </a>
          </div>
          <p className="text-[11px] text-white/30 font-mono">
            {nodes.length} nodes, {wires.length} connection{wires.length !== 1 ? "s" : ""} — ready to import
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-white/40">
        <div className="flex items-center gap-2">
          <Trash2 className="w-3 h-3 text-white/25" />
          <span>{isMobile ? "Tap × to delete" : "Hover node to delete"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
          <span>{isMobile ? "Tap producer → consumer to wire" : "Click producer → consumer to wire"}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="8" className="text-white/25">
            <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
          <span>Drag nodes to reposition</span>
        </div>
      </div>

      {/* Glow behind */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-brand-cyan/4 via-transparent to-brand-purple/4 blur-2xl" />
    </div>
  );
}
