"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Mail,
  MessageSquare,
  Github,
  CreditCard,
  Calendar,
  HardDrive,
  Cpu,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, revealFromBelow } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ────────────────────────── Data ────────────────────────── */

interface AgentData {
  name: string;
  icon: LucideIcon;
  status: string;
  executions: number;
  rate: number;
  color: string;
}

const initialAgents: AgentData[] = [
  { name: "Email Triage", icon: Mail, status: "running", executions: 12_847, rate: 94, color: "#06b6d4" },
  { name: "Slack Digest", icon: MessageSquare, status: "running", executions: 8_320, rate: 87, color: "#a855f7" },
  { name: "PR Reviewer", icon: Github, status: "running", executions: 5_614, rate: 99, color: "#34d399" },
  { name: "Deploy Monitor", icon: CreditCard, status: "healing", executions: 3_271, rate: 72, color: "#f43f5e" },
  { name: "Meeting Notes", icon: Calendar, status: "idle", executions: 2_908, rate: 100, color: "#fbbf24" },
  { name: "Doc Indexer", icon: HardDrive, status: "running", executions: 1_456, rate: 91, color: "#60a5fa" },
];

const statusStyles: Record<string, { dot: string; label: string; text: string; border: string; glow: string }> = {
  running: {
    dot: "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    label: "Running",
    text: "text-brand-emerald",
    border: "rgba(52,211,153,0.45)",
    glow: "rgba(52,211,153,0.12)",
  },
  healing: {
    dot: "bg-brand-amber shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-glow-border",
    label: "Healing",
    text: "text-brand-amber",
    border: "rgba(251,191,36,0.45)",
    glow: "rgba(251,191,36,0.12)",
  },
  idle: {
    dot: "bg-white/20",
    label: "Idle",
    text: "text-muted-dark",
    border: "rgba(255,255,255,0.08)",
    glow: "rgba(255,255,255,0.02)",
  },
};

/* ── Hex grid positions ──
   Layout: top row (2 hexes), middle row (3 hexes with center orchestrator), bottom row (2 hexes)
   We use a flat-top hex layout. */

const HEX_W = 140; // hex width

/** Positions for 6 agents + 1 central orchestrator in a honeycomb
 *  Center at (0,0). Neighbors are at 60-degree intervals. */
function getHexPositions() {
  const cx = 0;
  const cy = 0;
  const dist = HEX_W * 0.88;
  const positions: { x: number; y: number }[] = [];
  // 6 surrounding positions at 60-degree intervals, starting from top
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 90) * (Math.PI / 180);
    positions.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
    });
  }
  return positions;
}

/** SVG path for a flat-top hexagon centered at origin */
function hexPath(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i) * (Math.PI / 180);
    points.push(`${Math.cos(angle) * size},${Math.sin(angle) * size}`);
  }
  return `M ${points.join(" L ")} Z`;
}

/* ── Connection pairs (adjacent hex indices) ── */
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
];

/* ────────────────────────── Animated counter ────────────────────────── */

function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(value - 30);
  const display = useTransform(motionVal, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}

/* ────────────────────────── Hex Cell ────────────────────────── */

interface HexCellProps {
  agent: AgentData;
  x: number;
  y: number;
  index: number;
  isFlashing: boolean;
  isHovered: boolean;
  onHover: (i: number | null) => void;
}

function HexCell({ agent, x, y, index, isFlashing, isHovered, onHover }: HexCellProps) {
  const st = statusStyles[agent.status];
  const hexSize = 56;
  const path = hexPath(hexSize);
  const borderPath = hexPath(hexSize + 2);

  const activityLevel = Math.min(agent.executions / 13000, 1);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: "easeOut" }}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <g transform={`translate(${x}, ${y})`}>
        {/* Outer glow when flashing */}
        {isFlashing && (
          <motion.path
            d={hexPath(hexSize + 10)}
            fill="none"
            stroke={agent.color}
            strokeWidth={1.5}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.7 }}
          />
        )}

        {/* Border hex */}
        <path
          d={borderPath}
          fill="none"
          stroke={st.border}
          strokeWidth={1.2}
          style={{
            filter: isFlashing ? `drop-shadow(0 0 8px ${agent.color})` : undefined,
            transition: "filter 0.3s, stroke 0.3s",
          }}
        />

        {/* Fill hex with gradient */}
        <defs>
          <linearGradient id={`hex-fill-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={agent.color} stopOpacity={isFlashing ? 0.18 : 0.06 + activityLevel * 0.06} />
            <stop offset="100%" stopColor={agent.color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill={`url(#hex-fill-${index})`}
          style={{
            transition: "fill 0.4s",
          }}
        />

        {/* Background fill for solid dark */}
        <path
          d={path}
          fill="rgba(0,0,0,0.35)"
        />

        {/* Colored fill overlay */}
        <path
          d={path}
          fill={`url(#hex-fill-${index})`}
        />

        {/* Agent icon */}
        <foreignObject x={-12} y={-24} width={24} height={24}>
          <div className="flex items-center justify-center w-full h-full">
            <agent.icon className="h-4 w-4" style={{ color: agent.color }} />
          </div>
        </foreignObject>

        {/* Agent name */}
        <text
          y={2}
          textAnchor="middle"
          className="fill-white/80 text-[9px] font-medium"
          style={{ fontFamily: "inherit" }}
        >
          {agent.name}
        </text>

        {/* Execution count */}
        <text
          y={15}
          textAnchor="middle"
          className="fill-white/40 text-[8px] font-mono"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          {agent.executions.toLocaleString()} runs
        </text>

        {/* Mini status bar */}
        <rect
          x={-22}
          y={23}
          width={44}
          height={3}
          rx={1.5}
          fill="rgba(255,255,255,0.04)"
        />
        <rect
          x={-22}
          y={23}
          width={44 * (agent.rate / 100)}
          height={3}
          rx={1.5}
          fill={agent.rate >= 90 ? "#34d399" : agent.rate >= 80 ? "#fbbf24" : "#f43f5e"}
          style={{ transition: "width 0.5s ease" }}
        />

        {/* Status dot */}
        <circle
          cx={32}
          cy={-32}
          r={3}
          fill={agent.status === "running" ? "#34d399" : agent.status === "healing" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
        >
          {agent.status === "healing" && (
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Hover elevation & details */}
        {isHovered && (
          <>
            <motion.path
              d={hexPath(hexSize + 5)}
              fill="none"
              stroke={agent.color}
              strokeWidth={1}
              strokeOpacity={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
          </>
        )}
      </g>
    </motion.g>
  );
}

/* ────────────────────────── Component ────────────────────────── */

export default function VisionHoneycomb() {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalExec = agents.reduce((s, a) => s + a.executions, 0);
  const hexPositions = useMemo(getHexPositions, []);

  /* ── Activity tick ── */
  const tick = useCallback(() => {
    const idx = Math.floor(Math.random() * initialAgents.length);
    const bump = 1 + Math.floor(Math.random() * 3);
    setAgents((prev) => {
      const next = [...prev];
      const agent = { ...next[idx] };
      agent.executions += bump;
      if (agent.status !== "healing" && Math.random() < 0.2) {
        agent.status = agent.status === "running" ? "idle" : "running";
      }
      next[idx] = agent;
      return next;
    });
    if (!prefersReducedMotion) {
      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), 800);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 2500 + Math.random() * 2000;
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, prefersReducedMotion]);

  const statusCounts = agents.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    {} as Record<string, number>,
  );

  /* ── SVG canvas dimensions ── */
  const SVG_W = 500;
  const SVG_H = 420;
  const CENTER_X = SVG_W / 2;
  const CENTER_Y = SVG_H / 2;

  return (
    <SectionWrapper id="vision-honeycomb" className="relative overflow-hidden">
      {/* Subtle honeycomb background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="honeycomb-bg" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
              <path d="M28 2 L50 16 L50 44 L28 58 L6 44 L6 16 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M28 52 L50 66 L50 94 L28 108 L6 94 L6 66 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 27 L22 41 L22 69 L0 83 L-22 69 L-22 41 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M56 27 L78 41 L78 69 L56 83 L34 69 L34 41 Z" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb-bg)" />
        </svg>
      </div>

      {/* ── Heading ── */}
      <div className="mx-auto max-w-3xl text-center relative z-10 mb-14">
        <motion.div variants={revealFromBelow}>
          <SectionHeading className="leading-[1.1]">
            Your personal army of{" "}
            <GradientText className="drop-shadow-lg">AI specialists</GradientText>
          </SectionHeading>
        </motion.div>
      </div>

      {/* ── Honeycomb visualization ── */}
      <motion.div variants={fadeUp} className="relative z-10 mx-auto max-w-2xl">
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="hive-monitor"
            status="synced"
            info={<><AnimatedCounter value={totalExec} /> total exec</>}
            className="px-4 py-3 sm:px-5"
          />

          {/* SVG Honeycomb */}
          <div className="flex items-center justify-center px-4 py-6 overflow-hidden">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full max-w-[500px]"
              style={{ overflow: "visible" }}
            >
              {/* ── Connection lines between adjacent hexes ── */}
              {CONNECTIONS.map(([a, b]) => {
                const pa = hexPositions[a];
                const pb = hexPositions[b];
                return (
                  <line
                    key={`conn-${a}-${b}`}
                    x1={CENTER_X + pa.x}
                    y1={CENTER_Y + pa.y}
                    x2={CENTER_X + pb.x}
                    y2={CENTER_Y + pb.y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* ── Lines from each agent to center orchestrator ── */}
              {hexPositions.map((pos, i) => (
                <motion.line
                  key={`to-center-${i}`}
                  x1={CENTER_X + pos.x}
                  y1={CENTER_Y + pos.y}
                  x2={CENTER_X}
                  y2={CENTER_Y}
                  stroke={flashIdx === i ? agents[i].color : "rgba(255,255,255,0.04)"}
                  strokeWidth={flashIdx === i ? 1.5 : 0.8}
                  strokeDasharray="3 5"
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
              ))}

              {/* ── Central orchestrator hex ── */}
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              >
                <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
                  <defs>
                    <radialGradient id="orch-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.12} />
                      <stop offset="60%" stopColor="#a855f7" stopOpacity={0.06} />
                      <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </radialGradient>
                  </defs>
                  <path
                    d={hexPath(52)}
                    fill="none"
                    stroke="rgba(6,182,212,0.3)"
                    strokeWidth={1.5}
                  />
                  <path
                    d={hexPath(50)}
                    fill="url(#orch-grad)"
                  />
                  <path
                    d={hexPath(50)}
                    fill="rgba(0,0,0,0.4)"
                  />
                  <path
                    d={hexPath(50)}
                    fill="url(#orch-grad)"
                  />
                  <foreignObject x={-12} y={-20} width={24} height={24}>
                    <div className="flex items-center justify-center w-full h-full">
                      <Cpu className="h-4 w-4 text-brand-cyan" />
                    </div>
                  </foreignObject>
                  <text
                    y={4}
                    textAnchor="middle"
                    className="fill-white/70 text-[8px] font-semibold uppercase tracking-wider"
                    style={{ fontFamily: "inherit" }}
                  >
                    Orchestrator
                  </text>
                  <text
                    y={17}
                    textAnchor="middle"
                    className="fill-brand-cyan/50 text-[8px] font-mono"
                    style={{ fontFamily: "ui-monospace, monospace" }}
                  >
                    6 agents
                  </text>

                  {/* Pulsing ring around orchestrator */}
                  <motion.path
                    d={hexPath(58)}
                    fill="none"
                    stroke="rgba(6,182,212,0.15)"
                    strokeWidth={0.8}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 0.15, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </g>
              </motion.g>

              {/* ── Agent hex cells ── */}
              {agents.map((agent, i) => (
                <HexCell
                  key={agent.name}
                  agent={agent}
                  x={CENTER_X + hexPositions[i].x}
                  y={CENTER_Y + hexPositions[i].y}
                  index={i}
                  isFlashing={flashIdx === i}
                  isHovered={hoveredIdx === i}
                  onHover={setHoveredIdx}
                />
              ))}
            </svg>
          </div>

          {/* ── Hover detail overlay ── */}
          <AnimatePresence>
            {hoveredIdx !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="border-t border-white/6 px-4 py-3 sm:px-5 bg-white/[0.02]"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {(() => {
                    const agent = agents[hoveredIdx];
                    const Icon = agent.icon;
                    const st = statusStyles[agent.status];
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                          <span className="text-[12px] font-semibold text-white/90">{agent.name}</span>
                          <span className={`text-[9px] font-mono ${st.text}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-white/40 ml-auto">
                          <span>{agent.executions.toLocaleString()} executions</span>
                          <span>Rate: {agent.rate}%</span>
                          <span>Last: {Math.floor(Math.random() * 8 + 1)}s ago</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Fleet Status summary bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/4 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/30">
                Fleet Status
              </span>
            </div>
            <div className="flex items-center gap-4">
              {(["running", "healing", "idle"] as const).map((key) => {
                const st = statusStyles[key];
                const count = statusCounts[key] || 0;
                if (count === 0) return null;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    <span className={`text-[10px] font-mono ${st.text}`}>
                      {count} {st.label.toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-white/20 tabular-nums">
              <AnimatedCounter value={totalExec} /> total
            </span>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
