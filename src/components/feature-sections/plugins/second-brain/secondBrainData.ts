import { FileText, Hash, Sparkles } from "lucide-react";

export type NodeType = "note" | "tag" | "idea";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  size?: number;
}

export const CENTRAL: GraphNode = {
  id: "central",
  label: "personas-web",
  type: "note",
  x: 50,
  y: 50,
  size: 26,
};

export const SATELLITES: GraphNode[] = [
  { id: "leonardo", label: "leonardo", type: "note", x: 18, y: 22 },
  { id: "matrix", label: "matrix redesign", type: "note", x: 82, y: 22 },
  { id: "shipping", label: "#shipping", type: "tag", x: 12, y: 58 },
  { id: "agents", label: "agents", type: "note", x: 88, y: 58 },
  { id: "ideas", label: "ideas", type: "idea", x: 32, y: 86 },
  { id: "research", label: "research-lab", type: "note", x: 68, y: 86 },
];

export const EDGES: Array<[string, string]> = [
  ["central", "leonardo"],
  ["central", "matrix"],
  ["central", "agents"],
  ["central", "ideas"],
  ["central", "research"],
  ["leonardo", "matrix"],
  ["shipping", "central"],
  ["agents", "research"],
];

export const NODE_ICON: Record<NodeType, typeof FileText> = {
  note: FileText,
  tag: Hash,
  idea: Sparkles,
};

export const BACKLINKS = [
  { label: "leonardo.md", note: "tile illustrations" },
  { label: "matrix-redesign.md", note: "3x3 layout - shipped" },
  { label: "agents.md", note: "orchestrator notes" },
  { label: "research-lab.md", note: "lit search - queued" },
];

export const CAPTURES = [
  { time: "12m", text: "Wire dev-tools tab to runner" },
  { time: "1h", text: "Try gradient masks for tile borders" },
  { time: "3h", text: "Backlink graph would be a great demo" },
];

export function nodeById(id: string): GraphNode {
  if (id === CENTRAL.id) return CENTRAL;
  return SATELLITES.find((node) => node.id === id)!;
}
