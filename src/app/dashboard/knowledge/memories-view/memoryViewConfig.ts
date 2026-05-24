import {
  Bell,
  Calendar,
  Clock,
  GitBranch,
  Settings,
} from "lucide-react";

import type { MemoryAction, MemoryItem } from "@/lib/mock-dashboard-data";

export type FilterKey = "all" | MemoryAction["type"];

export const TYPES: MemoryAction["type"][] = [
  "throttle",
  "schedule",
  "alert",
  "config",
  "routing",
];

export const typeConfig: Record<
  MemoryAction["type"],
  { Icon: React.ElementType; tone: string; dot: string }
> = {
  throttle: {
    Icon: Clock,
    tone: "border-amber-500/20 bg-amber-500/8 text-amber-400",
    dot: "bg-amber-400",
  },
  alert: {
    Icon: Bell,
    tone: "border-rose-500/20 bg-rose-500/8 text-rose-400",
    dot: "bg-rose-400",
  },
  routing: {
    Icon: GitBranch,
    tone: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
    dot: "bg-cyan-400",
  },
  schedule: {
    Icon: Calendar,
    tone: "border-purple-500/20 bg-purple-500/8 text-purple-400",
    dot: "bg-purple-400",
  },
  config: {
    Icon: Settings,
    tone: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
    dot: "bg-emerald-400",
  },
};

export const statusConfig: Record<
  MemoryItem["status"],
  { label: "active" | "pending" | "archived"; pill: string }
> = {
  active: {
    label: "active",
    pill: "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
  },
  pending: {
    label: "pending",
    pill: "border-amber-500/25 bg-amber-500/8 text-amber-400",
  },
  archived: {
    label: "archived",
    pill: "border-glass bg-white/[0.03] text-muted-dark",
  },
};
