import { FileText, Hash, Sparkles } from "lucide-react";
import type { PluginsExtraCopy } from "@/i18n/pending/pluginsExtra";

type BrainCopy = PluginsExtraCopy["brain"];

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
  { id: "roadmap", label: "roadmap", type: "note", x: 68, y: 86 },
];

export const EDGES: Array<[string, string]> = [
  ["central", "leonardo"],
  ["central", "matrix"],
  ["central", "agents"],
  ["central", "ideas"],
  ["central", "roadmap"],
  ["leonardo", "matrix"],
  ["shipping", "central"],
  ["agents", "roadmap"],
];

export const NODE_ICON: Record<NodeType, typeof FileText> = {
  note: FileText,
  tag: Hash,
  idea: Sparkles,
};

/** Sample vault files; each note line is `pluginsExtraCopy.brain.backlinkNotes[noteKey]`. */
export const BACKLINKS: { label: string; noteKey: keyof BrainCopy["backlinkNotes"] }[] = [
  { label: "leonardo.md", noteKey: "leonardo" },
  { label: "matrix-redesign.md", noteKey: "matrix" },
  { label: "agents.md", noteKey: "agents" },
  { label: "roadmap.md", noteKey: "roadmap" },
];

/** Recent captures; each line is `pluginsExtraCopy.brain.captures[textKey]`. */
export const CAPTURES: { time: string; textKey: keyof BrainCopy["captures"] }[] = [
  { time: "12m", textKey: "wire" },
  { time: "1h", textKey: "masks" },
  { time: "3h", textKey: "graph" },
];

export function nodeById(id: string): GraphNode {
  if (id === CENTRAL.id) return CENTRAL;
  return SATELLITES.find((node) => node.id === id)!;
}
