import { attentionOf, type Attention } from "../attention";
import { TEAM_BY_ID, rank, type SimAgent } from "./model";

/* ── The fleet as a table: sorting and bulk eligibility ─────────────── */

export type SortKey = "attention" | "agent" | "team" | "runs" | "success" | "cost";
export type SortDir = "asc" | "desc";

const PILE_RANK: Record<Attention, number> = { needs: 0, working: 1, resting: 2, off: 3 };

/** The attention order the field reads in: needs (most urgent first), working
 *  (furthest along first), resting, off. */
function attentionCmp(x: SimAgent, y: SimAgent): number {
  const ax = attentionOf(x), ay = attentionOf(y);
  if (ax !== ay) return PILE_RANK[ax] - PILE_RANK[ay];
  if (ax === "needs") return rank(x) - rank(y);
  if (ax === "working") return (y.progress ?? 0) - (x.progress ?? 0);
  return 0;
}

const CMP: Record<SortKey, (x: SimAgent, y: SimAgent) => number> = {
  attention: attentionCmp,
  agent: (x, y) => x.callsign.localeCompare(y.callsign),
  team: (x, y) => (TEAM_BY_ID[x.team]?.idx ?? 0) - (TEAM_BY_ID[y.team]?.idx ?? 0) || attentionCmp(x, y),
  runs: (x, y) => x.runsToday - y.runsToday,
  success: (x, y) => x.successRate - y.successRate,
  cost: (x, y) => x.costTodayUsd - y.costTodayUsd,
};

/** Numbers sort biggest first on the first click; names and attention start ascending. */
export const DEFAULT_DIR: Record<SortKey, SortDir> = { attention: "asc", agent: "asc", team: "asc", runs: "desc", success: "desc", cost: "desc" };

export function sortAgents(list: readonly SimAgent[], key: SortKey, dir: SortDir): SimAgent[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...list].sort((x, y) => sign * CMP[key](x, y) || x.idx - y.idx);
}

export type BulkVerb = "pause" | "resume" | "run" | "cancel";
export const BULK_VERBS: readonly BulkVerb[] = ["pause", "resume", "run", "cancel"];

/** Whether a bulk verb applies to an agent (the same rules as its own controls). */
export function eligible(verb: BulkVerb, a: SimAgent): boolean {
  if (verb === "pause") return a.enabled;
  if (verb === "resume") return !a.enabled;
  if (verb === "cancel") return a.state === "running";
  return a.enabled && a.state !== "running" && a.state !== "input_required" && a.state !== "draft_ready";
}

/** The ids between two rows of the shown order, inclusive (shift-click). */
export function rangeIds(order: readonly SimAgent[], fromId: string, toId: string): string[] {
  const i = order.findIndex((a) => a.id === fromId);
  const j = order.findIndex((a) => a.id === toId);
  if (i < 0 || j < 0) return [toId];
  const [lo, hi] = i < j ? [i, j] : [j, i];
  return order.slice(lo, hi + 1).map((a) => a.id);
}
