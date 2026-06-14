import { Target, Search, BarChart3, PenLine, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/**
 * Team-canvas pipeline geometry + content. A horizontal DAG: one goal fans out
 * to personas working in PARALLEL, which converge into a writer and a reviewer.
 * Distinct from the OrchestrationHub (which shows triggers): this is the
 * multi-agent pipeline, not the single signal that wakes one agent.
 *
 * Hardcoded EN for now (Stream-1 i18n descope; see parity-backlog EXECUTION doc).
 */

export const VB_W = 780;
export const VB_H = 360;
export const NW = 150;
export const NH = 60;
/** Dependency depths 0..3 — nodes light up in this order during a run. */
export const STAGE_COUNT = 4;
export const AUTO_CYCLE_MS = 1500;

export interface FlowNodeDef {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  brand: BrandKey;
  /** Dependency depth; lights in order during the cascade. */
  stage: number;
  /** Center position in viewBox units. */
  x: number;
  y: number;
}

export const NODES: FlowNodeDef[] = [
  { id: "goal", label: "Goal", sub: "Ship release notes", icon: Target, brand: "cyan", stage: 0, x: 95, y: 180 },
  { id: "researcher", label: "Researcher", sub: "gathers sources", icon: Search, brand: "purple", stage: 1, x: 305, y: 96 },
  { id: "analyst", label: "Analyst", sub: "checks the data", icon: BarChart3, brand: "emerald", stage: 1, x: 305, y: 264 },
  { id: "writer", label: "Writer", sub: "drafts the notes", icon: PenLine, brand: "amber", stage: 2, x: 510, y: 180 },
  { id: "reviewer", label: "Reviewer", sub: "approves & ships", icon: ShieldCheck, brand: "cyan", stage: 3, x: 690, y: 180 },
];

export interface FlowEdgeDef {
  from: string;
  to: string;
}

export const EDGES: FlowEdgeDef[] = [
  { from: "goal", to: "researcher" },
  { from: "goal", to: "analyst" },
  { from: "researcher", to: "writer" },
  { from: "analyst", to: "writer" },
  { from: "writer", to: "reviewer" },
];

export const NODE_BY_ID: Record<string, FlowNodeDef> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

/** Cubic bezier from the right edge of `a` to the left edge of `b`. */
export function edgePath(a: FlowNodeDef, b: FlowNodeDef): string {
  const x1 = a.x + NW / 2;
  const y1 = a.y;
  const x2 = b.x - NW / 2;
  const y2 = b.y;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

/** Plain-text narration of the pipeline stages (carries the message on small screens). */
export const STAGE_LEGEND = [
  "Set the goal",
  "Personas work in parallel",
  "Outputs merge",
  "Reviewed & shipped",
];
