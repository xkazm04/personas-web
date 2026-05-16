import type { LucideIcon } from "lucide-react";

export interface HealingStage {
  icon: LucideIcon;
  label: string;
  desc: string;
  color: string;
  statusLabel: string;
}

export interface CircuitNode {
  id: string;
  label: string;
  icon: LucideIcon;
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  path: string;
  particles: number;
}

export type ConnectionStatus =
  | "healthy"
  | "broken"
  | "diagnosing"
  | "repairing";

export type NodeStatus = "healthy" | "error" | "warning" | "healing";
