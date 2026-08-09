// PROTOTYPE COPY — extract to src/i18n at assembly
import type { BrandAccent } from "@/lib/brand-theme";

export const HERO_COPY = {
  eyebrow: "Athena — fleet conductor",
  headlineTop: "Speak a sentence.",
  headlineAccent: "Watch eight terminals open.",
  sub: "Spoken or typed, it is the same code path: Athena drafts a fleet plan you can edit row by row — label, model, effort — and nothing spawns until you confirm.",
  ctaPrimary: "Get early access",
  ctaSecondary: "See how dispatch works",
  quote: "an assistant that cannot start work is not a conductor.",
  quoteSource: "design note, Personas desktop",
  listeningLabel: "listening",
  orbLabel: "Athena",
  orbSub: "the conductor",
  planTitle: "Fleet plan",
  planMeta: "3 rows · 8 sessions · cap 8",
  planFooter: "fleet_dispatch · claim-before-spawn",
  confirmLabel: "Confirm & dispatch",
  confirmHint: "your click, not hers",
  dispatchedLabel: "Dispatched — 8/8 claimed",
  editedTag: "edited",
  agentsSuffix: "agents",
  claimedPrefix: "claimed",
  standbyLabel: "standby",
} as const;

/** Caption rail — op grammar tokens + human captions, one per phase beat. */
export const CAPTIONS = [
  { token: "listening", caption: "spoken or typed — one code path" },
  { token: "show_fleet_plan", caption: "rows are yours: label · model · effort" },
  {
    token: "fleet_dispatch · 3 rows",
    caption: "your click, not hers — nothing spawns before Confirm",
  },
  { token: "claimed 8/8 — idempotent", caption: "claim-before-spawn, capped at eight" },
] as const;

/** The sentence Athena hears — typed out char by char during the listen phase. */
export const SPOKEN_SENTENCE = "get three agents on the flaky tests";

export type Effort = "low" | "medium" | "high";

export interface FleetRow {
  label: string;
  objective: string;
  model: string;
  effort: Effort;
  /** When set, the edit phase swaps the effort chip to this value. */
  editedEffort?: Effort;
  agents: number;
  accent: BrandAccent;
}

/** Row that is visibly edited during the edit phase. */
export const EDITED_ROW_INDEX = 1;

/** 3 rows → fleet_dispatch (1 row would be fleet_spawn); 3 + 3 + 2 = 8, the cap. */
export const FLEET_ROWS: FleetRow[] = [
  {
    label: "personas-web",
    objective: "Hunt the flaky Playwright specs",
    model: "opus",
    effort: "high",
    agents: 3,
    accent: "cyan",
  },
  {
    label: "personas-desktop",
    objective: "Reproduce the CI-only races",
    model: "sonnet",
    effort: "medium",
    editedEffort: "high",
    agents: 3,
    accent: "purple",
  },
  {
    label: "harness",
    objective: "Quarantine and re-run the reds",
    model: "sonnet",
    effort: "low",
    agents: 2,
    accent: "emerald",
  },
];

export interface TerminalTile {
  operator: string;
  cmd: string;
  accent: BrandAccent;
}

/** 8 tiles — one per dispatched session, grouped by plan row accent. */
export const TERMINALS: TerminalTile[] = [
  { operator: "op-1 · web", cmd: "npx playwright test --grep @flaky", accent: "cyan" },
  { operator: "op-2 · web", cmd: "git bisect run npm run test:e2e", accent: "cyan" },
  { operator: "op-3 · web", cmd: "trace: auth.spec retry #3", accent: "cyan" },
  { operator: "op-4 · desktop", cmd: "repro: ipc race under CI load", accent: "purple" },
  { operator: "op-5 · desktop", cmd: "vitest --retry=0 --seed 42", accent: "purple" },
  { operator: "op-6 · desktop", cmd: "diff: timers vs fake clock", accent: "purple" },
  { operator: "op-7 · harness", cmd: "quarantine list updated (4)", accent: "emerald" },
  { operator: "op-8 · harness", cmd: "re-run: green 12/12", accent: "emerald" },
];
