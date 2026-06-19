import {
  Mail, MessageSquare, Calendar, CreditCard, HardDrive,
  SquareKanban, Globe, Database, Bell, Webhook,
  FileText, Cloud, Rss, Shield, Terminal, Bot,
  Plug, Share2,
} from "lucide-react";
import { Github, Figma } from "@/components/icons/brand-icons";
import type { CanvasNode, ToolDef, Wire } from "./types";

export const TOOL_CATALOGUE: ToolDef[] = [
  { id: "gmail", name: "Gmail", icon: Mail, color: "#ea4335", category: "both" },
  { id: "slack", name: "Slack", icon: MessageSquare, color: "#4a154b", category: "both" },
  { id: "github", name: "GitHub", icon: Github, color: "#8b5cf6", category: "both" },
  { id: "calendar", name: "Calendar", icon: Calendar, color: "#06b6d4", category: "producer" },
  { id: "stripe", name: "Stripe", icon: CreditCard, color: "#635bff", category: "both" },
  { id: "jira", name: "Jira", icon: SquareKanban, color: "#0052cc", category: "both" },
  { id: "drive", name: "Drive", icon: HardDrive, color: "#34a853", category: "consumer" },
  { id: "figma", name: "Figma", icon: Figma, color: "#f24e1e", category: "consumer" },
  { id: "webhook", name: "Webhook", icon: Webhook, color: "#f59e0b", category: "producer" },
  { id: "api", name: "REST API", icon: Globe, color: "#3b82f6", category: "both" },
  { id: "database", name: "Database", icon: Database, color: "#14b8a6", category: "consumer" },
  { id: "notify", name: "Notify", icon: Bell, color: "#ec4899", category: "consumer" },
  { id: "docs", name: "Docs", icon: FileText, color: "#6366f1", category: "consumer" },
  { id: "s3", name: "S3 Bucket", icon: Cloud, color: "#f97316", category: "both" },
  { id: "rss", name: "RSS Feed", icon: Rss, color: "#fb923c", category: "producer" },
  { id: "auth", name: "Auth", icon: Shield, color: "#10b981", category: "producer" },
  { id: "cli", name: "CLI", icon: Terminal, color: "#a3a3a3", category: "both" },
  { id: "agent", name: "AI Agent", icon: Bot, color: "#8b5cf6", category: "both" },
  { id: "plugin", name: "Plugin", icon: Plug, color: "#d946ef", category: "both" },
  { id: "pubsub", name: "Pub/Sub", icon: Share2, color: "#0ea5e9", category: "both" },
];

export const TOOL_MAP = new Map(TOOL_CATALOGUE.map((t) => [t.id, t]));

// SVG constants
export const VB_W = 100;
export const VB_H = 100;
export const QUEUE_Y = 50;
export const PRODUCER_Y = 16;
export const CONSUMER_Y = 84;
export const NODE_R = 5;

export const DEFAULT_NODES: CanvasNode[] = [
  { id: "n1", toolId: "gmail", side: "producer", x: 20 },
  { id: "n2", toolId: "github", side: "producer", x: 50 },
  { id: "n3", toolId: "webhook", side: "producer", x: 80 },
  { id: "n4", toolId: "jira", side: "consumer", x: 25 },
  { id: "n5", toolId: "slack", side: "consumer", x: 55 },
  { id: "n6", toolId: "database", side: "consumer", x: 80 },
];

export const DEFAULT_WIRES: Wire[] = [
  { from: "n1", to: "n4", label: "email.received" },
  { from: "n2", to: "n5", label: "pr.opened" },
  { from: "n3", to: "n6", label: "hook.payload" },
];

let _nextId = 100;
export function nextId() {
  return `n${++_nextId}`;
}

// Bump _nextId past the highest n<digits> id in `nodes`, so addNode() after
// a hash-restored flow cannot collide with an attacker-chosen id (n101, etc.).
export function seedNextId(nodes: { id: string }[]): void {
  let max = _nextId;
  for (const node of nodes) {
    const m = /^n(\d+)$/.exec(node.id);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  _nextId = max;
}

const NODE_ID_RE = /^n\d+$/;

export function encodeFlow(state: { nodes: CanvasNode[]; wires: Wire[] }): string {
  const json = JSON.stringify(state);
  if (typeof window !== "undefined" && typeof btoa === "function") {
    return btoa(encodeURIComponent(json));
  }
  return "";
}

export function decodeFlow(
  hash: string
): { nodes: CanvasNode[]; wires: Wire[] } | null {
  try {
    const json = decodeURIComponent(atob(hash));
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.wires)) return null;

    // Reject decoded states with non-conforming or duplicate node ids — these
    // would otherwise corrupt the React key set, drag math, and wire lookups.
    const seen = new Set<string>();
    for (const node of parsed.nodes) {
      if (!node || typeof node.id !== "string" || !NODE_ID_RE.test(node.id)) {
        return null;
      }
      if (seen.has(node.id)) return null;
      seen.add(node.id);
    }

    // Validate wires too — a hand-edited / garbage hash can carry wires whose
    // from/to reference ids not in `nodes` (or non-string from/to/label). Those
    // dangling wires all collapse onto the same fallback coordinate, can't be
    // cleanly removed (removeWire keys on from,to), and an attacker-controlled
    // `label` would render straight into the SVG. Reject the whole state.
    for (const wire of parsed.wires) {
      if (
        !wire ||
        typeof wire.from !== "string" ||
        typeof wire.to !== "string" ||
        typeof wire.label !== "string" ||
        !seen.has(wire.from) ||
        !seen.has(wire.to)
      ) {
        return null;
      }
    }
    return parsed as { nodes: CanvasNode[]; wires: Wire[] };
  } catch {
    /* invalid hash */
  }
  return null;
}
