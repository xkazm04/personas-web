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
} from "lucide-react";
import type {
  HealingStage,
  CircuitNode,
  Connection,
  NodeStatus,
} from "./types";

export const healingStages: HealingStage[] = [
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

export const nodes: CircuitNode[] = [
  { id: "api", label: "API Gateway", icon: Radio, x: 100, y: 80 },
  { id: "db", label: "Database", icon: Database, x: 100, y: 280 },
  { id: "cache", label: "Cache", icon: HardDrive, x: 340, y: 80 },
  { id: "queue", label: "Queue", icon: Cpu, x: 340, y: 280 },
  { id: "slack", label: "Slack", icon: MessageSquare, x: 560, y: 180 },
];

export const connections: Connection[] = [
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
export const breakableConnections = [
  "cache-slack",
  "queue-slack",
  "api-cache",
  "db-queue",
];

export const nodeStatusColor: Record<NodeStatus, string> = {
  healthy: "#34d399",
  error: "#f43f5e",
  warning: "#fbbf24",
  healing: "#06b6d4",
};

/* Deterministic pseudo-random offsets for spark particles */
export const sparkSeeds = [
  { angleOff: 0.12, distOff: 4, sizeOff: 0.8 },
  { angleOff: 0.38, distOff: 9, sizeOff: 1.5 },
  { angleOff: 0.05, distOff: 2, sizeOff: 0.3 },
  { angleOff: 0.45, distOff: 11, sizeOff: 1.9 },
  { angleOff: 0.22, distOff: 6, sizeOff: 0.6 },
  { angleOff: 0.31, distOff: 8, sizeOff: 1.2 },
];

export function getPathMidpoint(pathD: string): { x: number; y: number } {
  const coords = pathD.match(/[\d.]+/g)?.map(Number) || [];
  if (coords.length >= 4) {
    const midIdx = Math.floor(coords.length / 2);
    const alignedIdx = midIdx % 2 === 0 ? midIdx : midIdx - 1;
    return {
      x: coords[alignedIdx] ?? coords[0],
      y: coords[alignedIdx + 1] ?? coords[1],
    };
  }
  return { x: 0, y: 0 };
}
