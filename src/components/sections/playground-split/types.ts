import type { LucideIcon } from "lucide-react";

export interface ToolNode {
  label: string;
  icon: LucideIcon;
}

export interface ResultCapabilities {
  messages: string;
  humanReview: string;
  events: string;
  memories: string;
}

export interface ExamplePrompt {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  intentText: string;
  tools: ToolNode[];
  result: ResultCapabilities;
}

export type NodeStatus = "pending" | "active" | "done";

export interface FlowNode {
  id: string;
  label: string;
  icon: LucideIcon;
  status: NodeStatus;
  x: number;
  y: number;
  parentId?: string;
  color?: string;
}

export type PlaygroundPhase = "idle" | "running" | "done";

export interface ResultDimension {
  key: keyof ResultCapabilities;
  label: string;
  icon: LucideIcon;
  color: string;
}
