/**
 * The Lab's version ledger — the one root the version rail, the chat's
 * "promote" answer and the arena's contender labels all project from.
 *
 * It mirrors the desktop Lab's Versions & Ratings table (personas repo,
 * docs/features/personas/README.md "Lab — the Versions & Ratings table";
 * sub_lab/components/versions_table/LabVersionsTable.tsx;
 * commands/execution/lab.rs `lab_activate_version`):
 * - exactly one version is tagged `production` (the live config);
 * - Activate promotes a version and demotes the previous live one to
 *   `experimental`, so re-activating the previous version IS the rollback;
 * - Baseline pins a version; other rows show Δ vs baseline, and a drop of
 *   5 points or more is flagged (`REGRESSION_DROP = 5`, `rounded <= -5`).
 * Breed/Evolve are not here: the desktop descoped them from the Lab UI.
 *
 * Ratings are never typed: each version's rating is the mean of its arena
 * side in `ARENA_ROUNDS`, so the rail and the arena cannot disagree.
 * Pure TS, no React — `index.tsx` drives it through `useReducer`.
 */
import { ARENA_ROUNDS } from "./data";

export type VersionStatus = "production" | "experimental";
export type ArenaSide = "A" | "B";

export interface LedgerRow {
  id: string;
  status: VersionStatus;
  /** Which arena column measured this version. */
  side: ArenaSide;
  /** round(mean of that side's arena scores). */
  rating: number;
}

export interface LedgerState {
  rows: readonly LedgerRow[];
  liveId: string;
  baselineId: string | null;
}

export type LedgerAction =
  | { type: "activate"; id: string }
  | { type: "baseline"; id: string };

/** Desktop LabVersionsTable: a drop of this many points vs baseline is flagged. */
export const REGRESSION_DROP = 5;

/** The version the chat refinement minted (desktop Improve mints an experimental version). */
export const REFINED_VERSION = "v4.3";

function sideRating(side: ArenaSide): number {
  const scores = ARENA_ROUNDS.map((r) => (side === "A" ? r.scoreA : r.scoreB));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function initialLedger(): LedgerState {
  return {
    rows: [
      { id: "v4.2", status: "production", side: "A", rating: sideRating("A") },
      { id: REFINED_VERSION, status: "experimental", side: "B", rating: sideRating("B") },
    ],
    liveId: "v4.2",
    baselineId: "v4.2",
  };
}

const has = (state: LedgerState, id: string) => state.rows.some((r) => r.id === id);

export function activate(state: LedgerState, id: string): LedgerState {
  if (id === state.liveId || !has(state, id)) return state;
  return {
    ...state,
    liveId: id,
    rows: state.rows.map((r) => ({
      ...r,
      status: r.id === id ? "production" : "experimental",
    })),
  };
}

export function setBaseline(state: LedgerState, id: string): LedgerState {
  if (id === state.baselineId || !has(state, id)) return state;
  return { ...state, baselineId: id };
}

/** Null for the baseline itself or when nothing is pinned (as on the desktop). */
export function deltaVsBaseline(state: LedgerState, id: string): number | null {
  if (!state.baselineId || state.baselineId === id) return null;
  const row = state.rows.find((r) => r.id === id);
  const base = state.rows.find((r) => r.id === state.baselineId);
  if (!row || !base) return null;
  return row.rating - base.rating;
}

export function isRegression(delta: number | null): boolean {
  return delta !== null && Math.round(delta) <= -REGRESSION_DROP;
}

export function arenaContenders(state: LedgerState): Record<ArenaSide, string> {
  const of = (side: ArenaSide) => state.rows.find((r) => r.side === side)?.id ?? "";
  return { A: of("A"), B: of("B") };
}

export function ledgerReducer(state: LedgerState, action: LedgerAction): LedgerState {
  return action.type === "activate"
    ? activate(state, action.id)
    : setBaseline(state, action.id);
}
