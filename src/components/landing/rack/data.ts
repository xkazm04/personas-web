import type { LnSpriteId } from "../shared/sprite-data";

/** Connector ids, in bus order. Names live in i18n (`landingNext.rack.connectors`). */
export const CONNECTOR_ORDER = ["gmail", "slack", "github", "drive", "jira", "notion", "calendar", "figma"] as const;
export type ConnectorId = (typeof CONNECTOR_ORDER)[number];

/** Skin tokens `--ln-c-<name>`: the plastic colour of an example persona. */
export type PersonaColor = "graphite" | "butter" | "lilac" | "tomato" | "mint" | "sky";

/** The non-copy half of an example persona. Copy is `landingNext.rack.personas[i]`, same order. */
export interface PersonaMeta {
  id: string;
  color: PersonaColor;
  glyph: LnSpriteId;
  connectors: readonly ConnectorId[];
  /** The colour is dark, so the notes spine flips its ink to the paper tone. */
  darkSpine?: boolean;
}

export const PERSONA_META: readonly PersonaMeta[] = [
  { id: "chief", color: "graphite", glyph: "p-compass", connectors: ["gmail", "slack", "github", "calendar", "drive", "notion"], darkSpine: true },
  { id: "inbox", color: "butter", glyph: "p-envelope", connectors: ["gmail", "calendar"] },
  { id: "pr", color: "lilac", glyph: "p-branch", connectors: ["github", "jira", "slack"] },
  { id: "brief", color: "tomato", glyph: "p-sunrise", connectors: ["calendar", "gmail", "slack", "notion"] },
  { id: "slack", color: "mint", glyph: "p-ribbon", connectors: ["slack", "notion"] },
  { id: "sched", color: "sky", glyph: "p-calendar", connectors: ["calendar", "gmail", "jira"] },
];

export const STEP_COUNT = 5;

export function colorVar(c: PersonaColor): string {
  return `var(--ln-c-${c})`;
}

/** `fill("Persona {n} of {total}", { n: 1, total: 6 })` */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
