import { Mail, MessageSquare, CreditCard, Calendar, HardDrive } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import type { AgentData } from "./types";

export const initialAgents: AgentData[] = [
  { name: "Email Triage", icon: Mail, status: "running", executions: 12_847, rate: 94, color: "#06b6d4" },
  { name: "Slack Digest", icon: MessageSquare, status: "running", executions: 8_320, rate: 87, color: "#a855f7" },
  { name: "PR Reviewer", icon: Github, status: "running", executions: 5_614, rate: 99, color: "#34d399" },
  { name: "Deploy Monitor", icon: CreditCard, status: "healing", executions: 3_271, rate: 72, color: "#f43f5e" },
  { name: "Meeting Notes", icon: Calendar, status: "idle", executions: 2_908, rate: 100, color: "#fbbf24" },
  { name: "Doc Indexer", icon: HardDrive, status: "running", executions: 1_456, rate: 91, color: "#60a5fa" },
];

export const statusStyles: Record<string, { dot: string; label: string; text: string }> = {
  running: {
    dot: "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    label: "Running",
    text: "text-brand-emerald",
  },
  healing: {
    dot: "bg-brand-amber shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-glow-border",
    label: "Healing",
    text: "text-brand-amber",
  },
  idle: { dot: "bg-white/20", label: "Idle", text: "text-muted-dark" },
};

export const CARDINALS = [
  { label: "DESIGN", angle: -90 },
  { label: "EXECUTE", angle: 0 },
  { label: "DEPLOY", angle: 90 },
  { label: "MONITOR", angle: 180 },
] as const;

export function agentPosition(index: number, total: number, rate: number, radius: number) {
  const angleDeg = (360 / total) * index - 90;
  const distance = radius * (1 - rate / 100) * 0.7 + radius * 0.2;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * distance,
    y: Math.sin(angleRad) * distance,
    angleDeg,
  };
}
