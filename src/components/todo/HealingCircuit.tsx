"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  RefreshCw,
  CheckCircle,
  Cpu,
  Database,
  HardDrive,
  Radio,
  MessageSquare,
  Wifi,
  Wrench,
  Shield,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ── Healing stage data ─────────────────────────────────────── */
const healingStages = [
  {
    icon: AlertTriangle,
    label: "Detect",
    desc: "Transient failure detected — API timeout on Slack connector",
    color: "#f43f5e",
    statusLabel: "error",
  },
  {
    icon: Activity,
    label: "Diagnose",
    desc: "Root cause: rate limit exceeded (429). Circuit breaker engaged.",
    color: "#fbbf24",
    statusLabel: "analyzing",
  },
  {
    icon: RefreshCw,
    label: "Recover",
    desc: "Exponential backoff initiated. Retry in 30s with fallback provider.",
    color: "#06b6d4",
    statusLabel: "healing",
  },
  {
    icon: CheckCircle,
    label: "Resolve",
    desc: "Slack connector recovered. 47ms response time. Circuit breaker reset.",
    color: "#34d399",
    statusLabel: "healthy",
  },
];

/* ── Circuit board node definitions ─────────────────────────── */
interface CircuitNode {
  id: string;
  label: string;
  icon: typeof Cpu;
  x: number;
  y: number;
}

const nodes: CircuitNode[] = [
  { id: "api", label: "API Gateway", icon: Radio, x: 100, y: 80 },
  { id: "db", label: "Database", icon: Database, x: 100, y: 280 },
  { id: "cache", label: "Cache", icon: HardDrive, x: 340, y: 80 },
  { id: "queue", label: "Queue", icon: Cpu, x: 340, y: 280 },
  { id: "slack", label: "Slack", icon: MessageSquare, x: 560, y: 180 },
];

/* ── Connection paths (right-angle traces between nodes) ──── */
interface Connection {
  id: string;
  from: string;
  to: string;
  path: string;
  particles: number;
}

const connections: Connection[] = [
  {
    id: "api-cache",
    from: "api",
    to: "cache",
    path: "M 130 105 L 130 55 L 310 55 L 310 105",
    particles: 3,
  },
  {
    id: "api-db",
    from: "api",
    to: "db",
    path: "M 100 130 L 100 255",
    particles: 2,
  },
  {
    id: "cache-queue",
    from: "cache",
    to: "queue",
    path: "M 340 130 L 340 255",
    particles: 2,
  },
  {
    id: "db-queue",
    from: "db",
    to: "queue",
    path: "M 130 305 L 130 340 L 310 340 L 310 305",
    particles: 3,
  },
  {
    id: "cache-slack",
    from: "cache",
    to: "slack",
    path: "M 370 105 L 450 105 L 450 180 L 530 180",
    particles: 2,
  },
  {
    id: "queue-slack",
    from: "queue",
    to: "slack",
    path: "M 370 280 L 450 280 L 450 205 L 530 205",
    particles: 2,
  },
];

/* Cycle through which connection breaks each loop */
const breakableConnections = ["cache-slack", "queue-slack", "api-cache", "db-queue"];

/* ── Particle that flows along a path ───────────────────────── */
function DataParticle({
  pathId,
  color,
  delay,
  duration,
}: {
  pathId: string;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.circle
      r={2.5}
      fill={color}
      filter="url(#particleGlow)"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: 0.5 }}
    >
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        fill="freeze"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </motion.circle>
  );
}

/* ── Spark effect at the break point ────────────────────────── */
/* Deterministic pseudo-random offsets for spark particles */
const sparkSeeds = [
  { angleOff: 0.12, distOff: 4, sizeOff: 0.8 },
  { angleOff: 0.38, distOff: 9, sizeOff: 1.5 },
  { angleOff: 0.05, distOff: 2, sizeOff: 0.3 },
  { angleOff: 0.45, distOff: 11, sizeOff: 1.9 },
  { angleOff: 0.22, distOff: 6, sizeOff: 0.6 },
  { angleOff: 0.31, distOff: 8, sizeOff: 1.2 },
];

function SparkEffect({ x, y }: { x: number; y: number }) {
  const sparks = useMemo(
    () =>
      sparkSeeds.map((seed, i) => ({
        angle: (Math.PI * 2 * i) / 6 + seed.angleOff,
        dist: 8 + seed.distOff,
        size: 1 + seed.sizeOff,
      })),
    [],
  );

  return (
    <g>
      {sparks.map((spark, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={spark.size}
          fill="#f43f5e"
          initial={{
            cx: x,
            cy: y,
            opacity: 1,
          }}
          animate={{
            cx: x + Math.cos(spark.angle) * spark.dist,
            cy: y + Math.sin(spark.angle) * spark.dist,
            opacity: [1, 1, 0],
            r: [spark.size, spark.size * 0.5, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 0.3,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.circle
        cx={x}
        cy={y}
        r={4}
        fill="#f43f5e"
        animate={{ r: [4, 8, 4], opacity: [0.8, 0.2, 0.8] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </g>
  );
}

/* ── Welding / repair flash effect ──────────────────────────── */
function WeldFlash({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={3}
        fill="white"
        animate={{
          r: [3, 16, 3],
          opacity: [1, 0.6, 1],
        }}
        transition={{ duration: 0.4, repeat: Infinity }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={6}
        fill="none"
        stroke="#06b6d4"
        strokeWidth={2}
        animate={{
          r: [6, 24, 6],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={3}
        fill="#06b6d4"
        filter="url(#weldGlow)"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
    </g>
  );
}

/* ── Repair bot traveling along a path ──────────────────────── */
function RepairBot({
  pathId,
  duration,
  onComplete,
}: {
  pathId: string;
  duration: number;
  onComplete?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <g>
      <circle r={5} fill="#fbbf24" filter="url(#repairGlow)">
        <animateMotion
          dur={`${duration}s`}
          fill="freeze"
          repeatCount="1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <circle r={3} fill="white">
        <animateMotion
          dur={`${duration}s`}
          fill="freeze"
          repeatCount="1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      {/* Trail */}
      <motion.circle
        r={8}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1}
        animate={{ r: [5, 12], opacity: [0.6, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <animateMotion
          dur={`${duration}s`}
          fill="freeze"
          repeatCount="1"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </motion.circle>
    </g>
  );
}

/* ── Get the midpoint of a path for effects ─────────────────── */
function getPathMidpoint(pathD: string): { x: number; y: number } {
  // Parse coordinates from the path data to find a midpoint
  const coords = pathD.match(/[\d.]+/g)?.map(Number) || [];
  if (coords.length >= 4) {
    const midIdx = Math.floor(coords.length / 2);
    // Align to pairs
    const alignedIdx = midIdx % 2 === 0 ? midIdx : midIdx - 1;
    return {
      x: coords[alignedIdx] ?? coords[0],
      y: coords[alignedIdx + 1] ?? coords[1],
    };
  }
  return { x: 0, y: 0 };
}

/* ── Main component ─────────────────────────────────────────── */
export default function HealingCircuit() {
  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(-1);
  const [brokenConnectionId, setBrokenConnectionId] = useState(breakableConnections[0]);
  const [cycleIndex, setCycleIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ── Auto-cycling stages ──────────────────────────────────── */
  useEffect(() => {
    if (prefersReducedMotion) return;
    let currentCycle = 0;

    const cycle = () => {
      const nextConnection =
        breakableConnections[currentCycle % breakableConnections.length];
      setBrokenConnectionId(nextConnection);
      setCycleIndex(currentCycle);
      setActiveStage(-1);

      let step = 0;
      const run = () => {
        timerRef.current = setTimeout(
          () => {
            setActiveStage(step);
            step++;
            if (step < healingStages.length) {
              run();
            } else {
              currentCycle++;
              timerRef.current = setTimeout(cycle, 3500);
            }
          },
          step === 0 ? 1200 : 2200,
        );
      };
      run();
    };
    cycle();
    return () => clearTimeout(timerRef.current);
  }, [prefersReducedMotion]);

  const brokenConn = connections.find((c) => c.id === brokenConnectionId);
  const breakPoint = brokenConn
    ? getPathMidpoint(brokenConn.path)
    : { x: 0, y: 0 };

  /* ── Connection status per connection ─────────────────────── */
  const getConnectionStatus = useCallback(
    (connId: string) => {
      if (connId !== brokenConnectionId) return "healthy";
      if (activeStage === -1) return "healthy";
      if (activeStage === 0) return "broken";
      if (activeStage === 1) return "diagnosing";
      if (activeStage === 2) return "repairing";
      return "healthy";
    },
    [activeStage, brokenConnectionId],
  );

  /* ── Node status ──────────────────────────────────────────── */
  const getNodeStatus = useCallback(
    (nodeId: string) => {
      if (activeStage < 0) return "healthy";
      const conn = connections.find((c) => c.id === brokenConnectionId);
      if (!conn) return "healthy";
      if (nodeId === conn.from || nodeId === conn.to) {
        if (activeStage === 0) return "error";
        if (activeStage === 1) return "warning";
        if (activeStage === 2) return "healing";
        return "healthy";
      }
      return "healthy";
    },
    [activeStage, brokenConnectionId],
  );

  const nodeStatusColor = {
    healthy: "#34d399",
    error: "#f43f5e",
    warning: "#fbbf24",
    healing: "#06b6d4",
  };

  return (
    <SectionWrapper id="healing-circuit" className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center relative z-10"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Fixes itself when things{" "}
            <GradientText className="drop-shadow-lg">break</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-muted-dark font-light"
        >
          When something goes wrong, your agents don&apos;t just stop — they figure out what happened, fix it, and keep going.{" "}
          <span className="text-foreground/80 font-medium">
            No 3 AM alerts, no manual restarts.
          </span>
        </motion.p>
      </motion.div>

      {/* Circuit Board */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 mx-auto max-w-4xl relative z-10"
      >
        <div className="rounded-2xl border border-white/8 bg-black/70 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 bg-black/40">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-cyan" />
              <span className="text-sm font-mono text-muted tracking-wider uppercase">
                Circuit Board — Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {activeStage >= 0 && activeStage < 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
                    style={{
                      borderColor: `${healingStages[activeStage].color}40`,
                      backgroundColor: `${healingStages[activeStage].color}10`,
                    }}
                  >
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: healingStages[activeStage].color,
                      }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <span
                      className="text-sm font-mono uppercase tracking-wider"
                      style={{ color: healingStages[activeStage].color }}
                    >
                      {healingStages[activeStage].statusLabel}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-sm font-mono text-muted-dark">
                Cycle #{cycleIndex + 1}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* SVG Circuit Board */}
            <div className="flex-1 relative p-4">
              {/* PCB texture background */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
              />

              <svg
                viewBox="0 0 660 400"
                className="w-full h-auto"
                style={{ minHeight: 300 }}
              >
                <defs>
                  <filter id="particleGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="repairGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="weldGlow">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="nodeGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connection traces */}
                {connections.map((conn) => {
                  const status = getConnectionStatus(conn.id);
                  const traceColor =
                    status === "broken"
                      ? "#f43f5e"
                      : status === "diagnosing"
                      ? "#fbbf24"
                      : status === "repairing"
                      ? "#06b6d4"
                      : "#34d399";
                  const traceOpacity =
                    status === "broken" ? 0.3 : status === "healthy" ? 0.4 : 0.5;

                  return (
                    <g key={conn.id}>
                      {/* Define path for animateMotion */}
                      <path
                        id={conn.id}
                        d={conn.path}
                        fill="none"
                        stroke="none"
                      />

                      {/* Background trace (PCB trace look) */}
                      <path
                        d={conn.path}
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Active trace */}
                      <motion.path
                        d={conn.path}
                        fill="none"
                        stroke={traceColor}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ opacity: traceOpacity }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Glow trace */}
                      <motion.path
                        d={conn.path}
                        fill="none"
                        stroke={traceColor}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ opacity: traceOpacity * 0.3 }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Data particles (only when healthy or resolved) */}
                      {status === "healthy" &&
                        Array.from({ length: conn.particles }).map((_, pi) => (
                          <DataParticle
                            key={`${conn.id}-p-${pi}`}
                            pathId={conn.id}
                            color={traceColor}
                            delay={pi * (2 / conn.particles)}
                            duration={2}
                          />
                        ))}

                      {/* Broken: spark effects */}
                      {status === "broken" && conn.id === brokenConnectionId && (
                        <SparkEffect x={breakPoint.x} y={breakPoint.y} />
                      )}

                      {/* Diagnosing: repair bot traveling */}
                      {status === "diagnosing" &&
                        conn.id === brokenConnectionId && (
                          <RepairBot
                            pathId={conn.id}
                            duration={2}
                          />
                        )}

                      {/* Repairing: welding flash at the break point */}
                      {status === "repairing" &&
                        conn.id === brokenConnectionId && (
                          <WeldFlash x={breakPoint.x} y={breakPoint.y} />
                        )}
                    </g>
                  );
                })}

                {/* Component nodes */}
                {nodes.map((node) => {
                  const status = getNodeStatus(node.id);
                  const color =
                    nodeStatusColor[status as keyof typeof nodeStatusColor];
                  const isAffected = status !== "healthy";

                  return (
                    <g key={node.id}>
                      {/* Chip shadow */}
                      <rect
                        x={node.x - 32}
                        y={node.y - 25}
                        width={64}
                        height={50}
                        rx={6}
                        fill="rgba(0,0,0,0.5)"
                      />

                      {/* Chip body */}
                      <motion.rect
                        x={node.x - 30}
                        y={node.y - 25}
                        width={60}
                        height={50}
                        rx={5}
                        fill="rgba(15,15,25,0.9)"
                        stroke={color}
                        strokeWidth={1.5}
                        animate={{
                          strokeOpacity: isAffected ? [0.6, 1, 0.6] : 0.3,
                        }}
                        transition={
                          isAffected
                            ? { duration: 0.8, repeat: Infinity }
                            : { duration: 0.5 }
                        }
                      />

                      {/* Chip pins (left and right) */}
                      {[-20, -10, 0, 10, 20].map((offset) => (
                        <g key={`pins-${node.id}-${offset}`}>
                          <rect
                            x={node.x - 36}
                            y={node.y - 3 + offset * 0.5}
                            width={6}
                            height={2}
                            rx={0.5}
                            fill={color}
                            opacity={0.2}
                          />
                          <rect
                            x={node.x + 30}
                            y={node.y - 3 + offset * 0.5}
                            width={6}
                            height={2}
                            rx={0.5}
                            fill={color}
                            opacity={0.2}
                          />
                        </g>
                      ))}

                      {/* Glow around chip when affected */}
                      {isAffected && (
                        <motion.rect
                          x={node.x - 32}
                          y={node.y - 27}
                          width={64}
                          height={54}
                          rx={7}
                          fill="none"
                          stroke={color}
                          strokeWidth={1}
                          filter="url(#nodeGlow)"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}

                      {/* Status LED dot */}
                      <motion.circle
                        cx={node.x + 22}
                        cy={node.y - 18}
                        r={2.5}
                        fill={color}
                        animate={
                          isAffected
                            ? { opacity: [1, 0.3, 1] }
                            : { opacity: 0.7 }
                        }
                        transition={
                          isAffected
                            ? { duration: 0.5, repeat: Infinity }
                            : { duration: 0.3 }
                        }
                      />

                      {/* Label */}
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize={9}
                        fontFamily="monospace"
                        opacity={0.7}
                      >
                        {node.label}
                      </text>

                      {/* Tiny icon representation (dot) */}
                      <circle
                        cx={node.x}
                        cy={node.y - 12}
                        r={4}
                        fill={color}
                        opacity={0.5}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Status Panel */}
            <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-white/6 bg-black/30 p-4">
              <div className="flex items-center gap-1.5 mb-4">
                <Shield className="h-3.5 w-3.5 text-muted-dark" />
                <span className="text-sm font-mono text-muted uppercase tracking-wider">
                  Connection Status
                </span>
              </div>

              <div className="space-y-2">
                {connections.map((conn) => {
                  const status = getConnectionStatus(conn.id);
                  const statusColor =
                    status === "broken"
                      ? "#f43f5e"
                      : status === "diagnosing"
                      ? "#fbbf24"
                      : status === "repairing"
                      ? "#06b6d4"
                      : "#34d399";
                  const fromNode = nodes.find((n) => n.id === conn.from);
                  const toNode = nodes.find((n) => n.id === conn.to);

                  return (
                    <motion.div
                      key={conn.id}
                      animate={{
                        borderColor:
                          status !== "healthy"
                            ? `${statusColor}40`
                            : "rgba(255,255,255,0.04)",
                        backgroundColor:
                          status !== "healthy"
                            ? `${statusColor}08`
                            : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between rounded-lg border border-white/4 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: statusColor }}
                          animate={
                            status !== "healthy"
                              ? { opacity: [1, 0.3, 1] }
                              : { opacity: 0.6 }
                          }
                          transition={
                            status !== "healthy"
                              ? { duration: 0.6, repeat: Infinity }
                              : {}
                          }
                        />
                        <span className="text-sm font-mono text-muted">
                          {fromNode?.label.split(" ")[0]} →{" "}
                          {toNode?.label.split(" ")[0]}
                        </span>
                      </div>
                      <span
                        className="text-sm font-mono uppercase tracking-wider"
                        style={{ color: statusColor }}
                      >
                        {status === "healthy"
                          ? "OK"
                          : status === "broken"
                          ? "DOWN"
                          : status === "diagnosing"
                          ? "SCAN"
                          : "FIX"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Active break info */}
              <AnimatePresence mode="wait">
                {activeStage >= 0 && (
                  <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 rounded-lg border border-white/6 bg-black/40 p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wrench
                        className="h-3 w-3"
                        style={{ color: healingStages[activeStage].color }}
                      />
                      <span
                        className="text-sm font-mono font-semibold uppercase tracking-wider"
                        style={{ color: healingStages[activeStage].color }}
                      >
                        {healingStages[activeStage].label}
                      </span>
                    </div>
                    <p className="text-sm text-white/35 font-mono leading-relaxed">
                      {healingStages[activeStage].desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom stage timeline */}
          <div className="border-t border-white/6 bg-black/40 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto">
                {healingStages.map((stage, i) => {
                  const isActive = activeStage === i;
                  const isDone = activeStage > i;
                  const isReached = activeStage >= i;

                  return (
                    <div key={stage.label} className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          borderColor: isActive
                            ? `${stage.color}60`
                            : isDone
                            ? `${stage.color}30`
                            : "rgba(255,255,255,0.06)",
                          backgroundColor: isActive
                            ? `${stage.color}12`
                            : "transparent",
                        }}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1 shrink-0"
                      >
                        <stage.icon
                          className="h-3 w-3 transition-colors duration-300"
                          style={{
                            color: isReached
                              ? stage.color
                              : "rgba(255,255,255,0.15)",
                          }}
                        />
                        <span
                          className="text-sm font-mono transition-colors duration-300"
                          style={{
                            color: isReached
                              ? `${stage.color}cc`
                              : "rgba(255,255,255,0.2)",
                          }}
                        >
                          {stage.label}
                        </span>
                        {isActive && (
                          <motion.div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: stage.color }}
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                        {isDone && (
                          <CheckCircle
                            className="h-3 w-3"
                            style={{ color: `${stage.color}60` }}
                          />
                        )}
                      </motion.div>
                      {i < healingStages.length - 1 && (
                        <motion.div
                          className="h-px w-4 shrink-0"
                          animate={{
                            backgroundColor: isDone
                              ? `${stage.color}40`
                              : "rgba(255,255,255,0.06)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-mono text-muted-dark">
                <Wifi className="h-3 w-3" />
                <span>
                  {connections.filter(
                    (c) => getConnectionStatus(c.id) === "healthy",
                  ).length}
                  /{connections.length} healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
