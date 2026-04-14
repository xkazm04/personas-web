import type { LucideIcon } from "lucide-react";

export interface AgentData {
  name: string;
  icon: LucideIcon;
  status: string;
  executions: number;
  rate: number;
  color: string;
}

export interface StatusStyle {
  dot: string;
  label: string;
  text: string;
  border: string;
  glow: string;
}
