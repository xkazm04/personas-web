import { Mail, MessageSquare, CreditCard, Calendar, HardDrive } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import type { AgentData, StatusStyle } from "./types";

export const initialAgents: AgentData[] = [
  { name: "Email Triage", icon: Mail, status: "running", executions: 12_847, rate: 94, color: "#06b6d4" },
  { name: "Slack Digest", icon: MessageSquare, status: "running", executions: 8_320, rate: 87, color: "#a855f7" },
  { name: "PR Reviewer", icon: Github, status: "running", executions: 5_614, rate: 99, color: "#34d399" },
  { name: "Deploy Monitor", icon: CreditCard, status: "healing", executions: 3_271, rate: 72, color: "#f43f5e" },
  { name: "Meeting Notes", icon: Calendar, status: "idle", executions: 2_908, rate: 100, color: "#fbbf24" },
  { name: "Doc Indexer", icon: HardDrive, status: "running", executions: 1_456, rate: 91, color: "#60a5fa" },
];

export const statusStyles: Record<string, StatusStyle> = {
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

export const HEX_W = 140;

export function getHexPositions() {
  const cx = 0;
  const cy = 0;
  const dist = HEX_W * 0.88;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 90) * (Math.PI / 180);
    positions.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
    });
  }
  return positions;
}

export function hexPath(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i) * (Math.PI / 180);
    points.push(`${Math.cos(angle) * size},${Math.sin(angle) * size}`);
  }
  return `M ${points.join(" L ")} Z`;
}

export const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
];
