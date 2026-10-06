/**
 * The eight dimensions of a persona, in the product's own order (the desktop
 * app's `ALL_CELL_KEYS`: use-cases, connectors, triggers, human-review,
 * memory, error-handling, messages, events - here under the live section's
 * keys). Inks follow the app's dimension palette (task violet, connector
 * cyan, trigger amber, message blue, review rose, memory purple, event teal,
 * error orange) built from theme tokens so every site theme recolours them.
 */
export type DimKey =
  | "tasks"
  | "apps"
  | "triggers"
  | "review"
  | "messages"
  | "memory"
  | "errors"
  | "events";

/** Where a decision came from: your words, a question, or Personas' inference. */
export type DimSource = "said" | "asked" | "inferred";

export interface Dim {
  key: DimKey;
  /** CSS colour expression (theme tokens only). */
  ink: string;
  source: DimSource;
  /** Real connector marks (`public/tools/<name>.svg`) shown with the decision. */
  tools?: string[];
}

const mix = (a: string, b: string, pct: number) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;

export const DIMS: Dim[] = [
  { key: "tasks", ink: "var(--brand-purple)", source: "said" },
  { key: "apps", ink: "var(--brand-cyan)", source: "said", tools: ["gmail", "slack"] },
  { key: "triggers", ink: "var(--brand-amber)", source: "asked" },
  { key: "review", ink: "var(--brand-rose)", source: "asked" },
  { key: "messages", ink: "var(--status-info)", source: "inferred", tools: ["slack"] },
  { key: "memory", ink: mix("var(--brand-purple)", "var(--brand-rose)", 55), source: "inferred" },
  { key: "errors", ink: mix("var(--brand-amber)", "var(--brand-rose)", 50), source: "inferred" },
  { key: "events", ink: "var(--brand-emerald)", source: "inferred" },
];

export const DIM_BY_KEY = Object.fromEntries(DIMS.map((d) => [d.key, d])) as Record<DimKey, Dim>;

/** The dimensions Personas asks about (the live section's two questions). */
export const ASKED: DimKey[] = ["triggers", "review"];

/** A translucent version of a dimension ink. */
export function inkA(ink: string, pct: number): string {
  return `color-mix(in srgb, ${ink} ${pct}%, transparent)`;
}
