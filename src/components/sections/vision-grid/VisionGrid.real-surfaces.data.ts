import type { LucideIcon } from "lucide-react";
import { Clock, FileEdit, GitPullRequest, Inbox, PenLine, Receipt, Webhook } from "lucide-react";
import { connectors } from "@/data/connectors";
import { categories as templateCategories, templates } from "@/lib/templates";

/**
 * Sample content for the "real surfaces" vision grid. Every NOUN here is real
 * (connector names and colours from `src/data/connectors`, template titles and
 * the template count from `src/lib/templates`, stage names from the app's
 * `lib/execution/pipeline.ts`, trigger labels from its studio constants, model
 * names from its model selector). Every VALUE is sample and the section says so.
 */

/* ── Personas used across the screens (sample identities, data-driven colour) ── */
export interface SamplePersona {
  name: string;
  color: string;
  icon: LucideIcon;
}

export const PERSONAS = {
  triage: { name: "Inbox triage", color: "#06b6d4", icon: Inbox },
  drafter: { name: "Reply drafter", color: "#a855f7", icon: PenLine },
  reviewer: { name: "PR reviewer", color: "#8b5cf6", icon: GitPullRequest },
  filer: { name: "Invoice filer", color: "#f59e0b", icon: Receipt },
} satisfies Record<string, SamplePersona>;

/* ── Vault: credential rows, connectors resolved from the real catalogue ── */
export type Health = "healthy" | "untested";

function connector(name: string) {
  const c = connectors.find((x) => x.name === name);
  return c ? { label: c.label, color: c.color, icon: c.icon } : null;
}

export const CREDENTIALS = [
  { name: "Gmail · work", connector: connector("gmail"), health: "healthy" as Health },
  { name: "Linear", connector: connector("linear"), health: "healthy" as Health },
  { name: "Stripe · test mode", connector: connector("stripe"), health: "healthy" as Health },
  { name: "Google Drive", connector: connector("google_drive"), health: "untested" as Health },
];

/* ── Templates: count and categories DERIVED, never typed ── */
export const TEMPLATE_COUNT = templates.length;
export const TEMPLATE_CATEGORY_COUNT = templateCategories.length;

const TILE_IDS = [
  "gmail-inbox-triage",
  "github-pr-reviewer",
  "stripe-failed-payment",
  "sales-lead-scorer",
  "support-ticket-classifier",
];

export const TEMPLATE_TILES = TILE_IDS.map((id) => templates.find((t) => t.id === id)).filter(
  (t): t is (typeof templates)[number] => t !== undefined,
);

/* ── BYOM: the app's provider columns (ModelSelector) ── */
export const PROVIDERS = [
  { key: "anthropic", label: "Anthropic", color: "#D97706", models: ["Haiku", "Sonnet", "Opus"] },
  { key: "ollama", label: "Ollama", color: "#10B981", models: ["Qwen3 Coder", "GLM-5", "Kimi K2.5"] },
  { key: "custom", label: "Custom", color: "#3B82F6", models: ["Your endpoint"] },
];
export const SELECTED_MODEL = "Sonnet";

/* ── Monitoring: the seven real pipeline stages, sample durations (ms) ── */
export type StageTone = "frontend" | "record" | "engine";

export interface Stage {
  label: string;
  ms: number;
  tone: StageTone;
}

export const STAGES: Stage[] = [
  { label: "Initiate", ms: 8, tone: "frontend" },
  { label: "Validate", ms: 42, tone: "record" },
  { label: "Create Record", ms: 15, tone: "record" },
  { label: "Spawn Engine", ms: 1180, tone: "engine" },
  { label: "Stream Output", ms: 11400, tone: "engine" },
  { label: "Finalize Status", ms: 64, tone: "record" },
  { label: "Frontend Complete", ms: 12, tone: "frontend" },
];

export const STAGE_STARTS = STAGES.reduce<number[]>(
  (acc, _s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + STAGES[i - 1].ms],
  [],
);
export const TRACE_TOTAL_MS = STAGES.reduce((sum, s) => sum + s.ms, 0);

export function formatMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

/* ── Lab: two prompt variants, the app's composite formula (TA 40 / OQ 40 / PC 20) ── */
export interface ArenaVariant {
  key: string;
  name: string;
  note: string;
  scores: { label: string; value: number }[];
}

export const VARIANTS: ArenaVariant[] = [
  {
    key: "A",
    name: "v3",
    note: "current prompt",
    scores: [
      { label: "Tool accuracy", value: 71 },
      { label: "Output quality", value: 64 },
      { label: "Protocol", value: 80 },
    ],
  },
  {
    key: "B",
    name: "v4",
    note: "adds sender history",
    scores: [
      { label: "Tool accuracy", value: 82 },
      { label: "Output quality", value: 78 },
      { label: "Protocol", value: 85 },
    ],
  },
];

const WEIGHTS = [0.4, 0.4, 0.2];
export function composite(v: ArenaVariant): number {
  return Math.round(v.scores.reduce((sum, s, i) => sum + s.value * WEIGHTS[i], 0));
}

/* ── Orchestration: chain-studio ledger rows (source, condition, target) ── */
export type RouteSource =
  | { kind: "trigger"; label: string; icon: LucideIcon; brand: "amber" | "blue" | "cyan" }
  | { kind: "persona"; persona: SamplePersona };

export interface Route {
  source: RouteSource;
  condition: string;
  target: SamplePersona;
  live: boolean;
}

export const ROUTES: Route[] = [
  { source: { kind: "trigger", label: "Schedule", icon: Clock, brand: "amber" }, condition: "always", target: PERSONAS.triage, live: true },
  { source: { kind: "persona", persona: PERSONAS.triage }, condition: "on success", target: PERSONAS.drafter, live: true },
  { source: { kind: "trigger", label: "Webhook", icon: Webhook, brand: "blue" }, condition: "always", target: PERSONAS.reviewer, live: true },
  { source: { kind: "trigger", label: "File Watcher", icon: FileEdit, brand: "cyan" }, condition: "always", target: PERSONAS.filer, live: false },
];
