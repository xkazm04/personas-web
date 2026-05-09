import type { LucideIcon } from "lucide-react";

export interface ToolDef {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: "producer" | "consumer" | "both";
}

export interface CanvasNode {
  id: string;
  toolId: string;
  side: "producer" | "consumer";
  x: number; // percentage 0-100 within canvas
}

export interface Wire {
  from: string; // node id
  to: string; // node id
  label: string;
}

export interface FlowState {
  nodes: CanvasNode[];
  wires: Wire[];
}
