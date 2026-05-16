import {
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface Goal {
  id: string;
  title: string;
  effort: "S" | "M" | "L";
  risk: "low" | "med" | "high";
}

export interface LifecycleColumn {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  goals: Goal[];
}

export const COLUMNS: LifecycleColumn[] = [
  {
    key: "idea",
    label: "Idea",
    icon: Sparkles,
    color: "#a855f7",
    goals: [
      { id: "g1", title: "Voice-to-agent command mode", effort: "L", risk: "high" },
      { id: "g2", title: "Local vector cache for memories", effort: "M", risk: "med" },
      { id: "g3", title: "OTel spans for tool calls", effort: "S", risk: "low" },
    ],
  },
  {
    key: "scoped",
    label: "Scoped",
    icon: Target,
    color: "#06b6d4",
    goals: [
      { id: "g4", title: "Retry with exponential backoff", effort: "S", risk: "low" },
      { id: "g5", title: "Credential rotation dashboard", effort: "M", risk: "med" },
    ],
  },
  {
    key: "active",
    label: "Active",
    icon: Zap,
    color: "#fbbf24",
    goals: [
      { id: "g6", title: "3x3 persona matrix builder", effort: "L", risk: "med" },
      { id: "g7", title: "BYOM Ollama routing rules", effort: "M", risk: "low" },
      { id: "g8", title: "Self-healing circuit breaker", effort: "M", risk: "med" },
    ],
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Trophy,
    color: "#34d399",
    goals: [
      { id: "g9", title: "Event bus with DLQ replay", effort: "L", risk: "low" },
      { id: "g10", title: "Arena A/B prompt testing", effort: "M", risk: "low" },
    ],
  },
];

export const EFFORT_STYLE: Record<Goal["effort"], { label: string; color: string }> = {
  S: { label: "S - 1d", color: "#34d399" },
  M: { label: "M - 3d", color: "#06b6d4" },
  L: { label: "L - 1w", color: "#a855f7" },
};

export const RISK_STYLE: Record<Goal["risk"], { label: string; color: string }> = {
  low: { label: "low risk", color: "#34d399" },
  med: { label: "med risk", color: "#fbbf24" },
  high: { label: "high risk", color: "#f43f5e" },
};
