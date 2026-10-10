import type { Severity } from "../fleet-data";
import type { SimAgent } from "./model";
import type { TriageItem, TriageKind } from "./triage";
import { admit } from "./verbs";

/* ── Triage by question ────────────────────────────────────────────
 *
 * Many decisions are the same question asked by different agents: seven
 * agents ask "Merge needs a human look", four runs failed on the same tool
 * timeout. Grouped, one judgment covers the homogeneous run.
 *
 *   groupItems(items, scope) -> groups in the items' order (first member first)
 *   groupVerdicts(group)     -> the verdicts a group earns (no bulk approve
 *                               when any member is critical)
 *   reconcile(group, live)   -> the group minus members that left; it never
 *                               gains one (a late arrival does not join a group
 *                               that predates it)
 *   groupRetry(group, scope) -> how many members the rulebook lets Retry
 *
 * Members are identities captured at grouping time. Answers are free text, so
 * every question waiting for an answer stays its own group.
 */

export interface GroupMember extends TriageItem {
  /** A review member's severity, captured at grouping. */
  severity?: Severity;
}

export interface TriageGroup {
  key: string;
  kind: TriageKind;
  /** The review question, for a review group. */
  title?: string;
  members: GroupMember[];
}

export type GroupVerdict = "approve" | "sendback";

const SEV_ORDER: readonly Severity[] = ["critical", "warning", "info"];

function groupKey(item: TriageItem, a: SimAgent | undefined): { key: string; title?: string; severity?: Severity } {
  if (item.kind === "review") {
    const r = a?.reviews.find((x) => x.id === item.rid);
    const title = r?.title ?? item.key;
    return { key: `review:${title}`, title, severity: r?.severity };
  }
  if (item.kind === "failed") return { key: `failed:${a?.taskKey ?? a?.task ?? ""}` };
  if (item.kind === "draft") return { key: "draft" };
  return { key: `input:${item.agentId}` };
}

/** The items as groups by question, in the order their first member appears. */
export function groupItems(items: readonly TriageItem[], scope: readonly SimAgent[]): TriageGroup[] {
  const byId = new Map(scope.map((a) => [a.id, a]));
  const groups = new Map<string, TriageGroup>();
  for (const item of items) {
    const { key, title, severity } = groupKey(item, byId.get(item.agentId));
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { key, kind: item.kind, title, members: [] }));
    g.members.push(severity ? { ...item, severity } : { ...item });
  }
  return [...groups.values()];
}

/** The group's predicate: how many, and the severity mix (review groups). */
export function groupPredicate(g: TriageGroup): { n: number; severities: Partial<Record<Severity, number>> } {
  const severities: Partial<Record<Severity, number>> = {};
  for (const sev of SEV_ORDER) {
    const n = g.members.filter((m) => m.severity === sev).length;
    if (n) severities[sev] = n;
  }
  return { n: g.members.length, severities };
}

/**
 * The verdicts one judgment may give the whole group. Send back is always
 * offered; approve only when no member is critical (a critical approval is
 * made one by one). Failures retry (see groupRetry) and answers are typed,
 * so neither takes a verdict.
 */
export function groupVerdicts(g: TriageGroup): GroupVerdict[] {
  if (g.kind === "draft") return ["approve", "sendback"];
  if (g.kind !== "review") return [];
  return g.members.some((m) => m.severity === "critical") ? ["sendback"] : ["approve", "sendback"];
}

/** The group with only the members still waiting in `live`; never adds one. */
export function reconcile(g: TriageGroup, live: readonly TriageItem[]): TriageGroup {
  const keys = new Set(live.map((i) => i.key));
  const members = g.members.filter((m) => keys.has(m.key));
  return members.length === g.members.length ? g : { ...g, members };
}

/** A failure group's Retry: the members the rulebook admits, and the rest. */
export function groupRetry(g: TriageGroup, scope: readonly SimAgent[]): { verb: "retry"; n: number; skipped: number } {
  const byId = new Map(scope.map((a) => [a.id, a]));
  const n = g.members.filter((m) => {
    const a = byId.get(m.agentId);
    return !!a && admit("retry", a) === null;
  }).length;
  return { verb: "retry", n, skipped: g.members.length - n };
}

/** Triage's tally with every key marked one way (a group decided or skipped at once). */
export function markAll<V>(handled: ReadonlyMap<string, V>, keys: readonly string[], how: V): Map<string, V> {
  const next = new Map(handled);
  for (const k of keys) next.set(k, how);
  return next;
}
