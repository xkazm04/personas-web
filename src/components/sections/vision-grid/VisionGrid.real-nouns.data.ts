import { connectors } from "@/data/connectors";
import { categories as TEMPLATE_CATEGORIES, templates } from "@/lib/templates";
import type { BrandKey } from "@/lib/brand-theme";

/**
 * /illustrate "real-nouns" data layer: every mark in the six cards is derived
 * from a catalogue, never typed as a number.
 *
 * - Vault glyphs   <- `@/data/connectors` (generated from the app's builtin
 *   connector JSON). Connectors without an `icon` have no /public/tools SVG,
 *   so they render their monogram instead.
 * - Template frames <- `@/lib/templates`, the same list Hero.tsx counts.
 * - BYOM, stages, Lab statuses and trigger kinds mirror the personas app's own
 *   vocabularies (paths noted per constant). They are closed sets in the app;
 *   consolidation should move them into a shared data module.
 *
 * NOTE for consolidation: this module pulls both catalogues into the (lazy)
 * vision chunk. Reduce them to these shapes on the server, as Hero.tsx does.
 */

/* ── Vault: one glyph per connector ─────────────────────────────── */

export interface Glyph {
  name: string;
  label: string;
  color: string;
  icon?: string;
  monogram: string;
  authType: string;
}

export const GLYPHS: Glyph[] = connectors.map(({ name, label, color, icon, monogram, authType }) => ({
  name,
  label,
  color,
  icon,
  monogram,
  authType,
}));

/** Most common credential kinds, counted from the catalogue. */
export const TOP_AUTH_TYPES: { type: string; count: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const c of connectors) counts.set(c.authType, (counts.get(c.authType) ?? 0) + 1);
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
})();

/* ── Templates: frames grouped by category ──────────────────────── */

export interface TemplateRow {
  category: string;
  frames: { id: string; title: string; tool: string; color: string }[];
}

export const TEMPLATE_COUNT = templates.length;

export const TEMPLATE_ROWS: TemplateRow[] = TEMPLATE_CATEGORIES.map((category) => ({
  category,
  frames: templates
    .filter((t) => t.category === category)
    .map((t) => ({ id: t.id, title: t.title, tool: t.tool, color: t.toolColor })),
}))
  .filter((row) => row.frames.length > 0)
  .sort((a, b) => b.frames.length - a.frames.length);

/* ── BYOM: providers and their model catalogues ─────────────────── */
// personas: src/lib/models/modelCatalog.ts (ANTHROPIC_MODELS, OLLAMA_LOCAL_MODELS)

export const PROVIDERS = [
  { id: "claude", name: "Claude", via: "official CLI", models: ["haiku", "sonnet", "opus"] },
  { id: "ollama", name: "Ollama", via: "localhost:11434", models: ["lfm2.5", "gemma4", "qwen3.5"] },
] as const;

export const MODEL_COUNT = PROVIDERS.reduce((n, p) => n + p.models.length, 0);

/* ── Monitoring: the seven pipeline stages ──────────────────────── */
// personas: src/lib/execution/pipeline.ts (PIPELINE_STAGES + STAGE_META labels).
// `weight` is a SAMPLE run's relative duration, shown without units.

export const STAGES = [
  { id: "initiate", label: "Initiate", weight: 1 },
  { id: "validate", label: "Validate", weight: 1 },
  { id: "create_record", label: "Create Record", weight: 1 },
  { id: "spawn_engine", label: "Spawn Engine", weight: 2 },
  { id: "stream_output", label: "Stream Output", weight: 8 },
  { id: "finalize_status", label: "Finalize Status", weight: 1 },
  { id: "frontend_complete", label: "Frontend Complete", weight: 1 },
] as const;

/* ── Lab: the Versions & Ratings table's status vocabulary ─────── */
// personas: features/agents/sub_lab (LabTab, VersionStatusBadge; en.json vr_status_*)

export type LabStatus = "active" | "measured" | "unmeasured" | "archived";

export const LAB_STATUS: Record<LabStatus, { label: string; brand: BrandKey | null }> = {
  active: { label: "Active", brand: "cyan" },
  measured: { label: "Measured", brand: "blue" },
  unmeasured: { label: "Unmeasured", brand: null },
  archived: { label: "Archived", brand: null },
};

export const LAB_MODELS = ["haiku", "sonnet", "opus"] as const;

/** A sample persona's prompt versions x models; v2 x sonnet is the baseline. */
export const LAB_ROWS: { version: string; cells: LabStatus[]; baselineAt?: number }[] = [
  { version: "v3", cells: ["measured", "active", "unmeasured"] },
  { version: "v2", cells: ["measured", "measured", "unmeasured"], baselineAt: 1 },
  { version: "v1", cells: ["archived", "archived", "unmeasured"] },
];

/* ── Orchestration: the closed TriggerKind vocabulary, by category ─ */
// personas: src/lib/bindings/TriggerKind.ts + lib/utils/platform/triggerConstants.ts

export const TRIGGER_GROUPS: { label: string; brand: BrandKey | null; kinds: string[] }[] = [
  { label: "Watch", brand: "amber", kinds: ["Schedule", "Polling", "File Watcher", "Clipboard", "App Focus"] },
  { label: "Listen", brand: "blue", kinds: ["Webhook", "Event Listener"] },
  { label: "Combine", brand: "purple", kinds: ["Chain", "Composite"] },
  { label: "On demand", brand: null, kinds: ["Manual"] },
];

export const TRIGGER_COUNT = TRIGGER_GROUPS.reduce((n, g) => n + g.kinds.length, 0);

/* ── Copy fixes: data.ts strings that drifted from their catalogue ─ */

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export function numberWord(n: number, capital = false): string {
  const w = WORDS[n] ?? String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

/** Card copy with the drifted counts re-derived; everything else is data.ts verbatim. */
export const COPY_FIXES: Record<string, { description?: string; details?: Record<number, string> }> = {
  templates: { details: { 0: `${TEMPLATE_COUNT} curated persona templates` } },
  orchestration: {
    description: `${numberWord(TRIGGER_COUNT, true)} trigger types wake personas in parallel — schedule, webhook, file watcher, clipboard, chain, and more.`,
  },
};
