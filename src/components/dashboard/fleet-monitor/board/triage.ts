import { queueOf, topReview, type SimAgent } from "./model";

/* ── Triage: everyone who needs you, one decision at a time ─────────
 *
 * The queue is decisions, not agents: an agent that failed and also holds two
 * reviews is three items (the failure first, then the reviews, most severe
 * first). The order is frozen when triage starts, so items do not jump while
 * you work; new needs that appear meanwhile join at the end, and items that
 * resolved themselves (a self-heal, a decision made elsewhere) drop out.
 */

export type TriageKind = "failed" | "input" | "draft" | "review";

export interface TriageItem {
  key: string;
  agentId: string;
  kind: TriageKind;
  /** The review a review item decides. */
  rid?: string;
}

const SEV = { critical: 0, warning: 1, info: 2 } as const;

/** The decisions one agent is waiting on, in the order to take them. */
export function itemsOf(a: SimAgent): TriageItem[] {
  const out: TriageItem[] = [];
  if (a.state === "failed") out.push({ key: `${a.id}:failed`, agentId: a.id, kind: "failed" });
  if (a.state === "input_required") out.push({ key: `${a.id}:input`, agentId: a.id, kind: "input" });
  if (a.state === "draft_ready" && !a.reviews.length) out.push({ key: `${a.id}:draft`, agentId: a.id, kind: "draft" });
  const reviews = [...a.reviews].sort((x, y) => SEV[x.severity] - SEV[y.severity] || y.ageMin - x.ageMin);
  for (const r of reviews) out.push({ key: `${a.id}:review:${r.id}`, agentId: a.id, kind: "review", rid: r.id });
  return out;
}

/** Every decision waiting in the fleet, most urgent agent first. */
export function triageItems(scope: readonly SimAgent[]): TriageItem[] {
  return queueOf([...scope]).flatMap(itemsOf);
}

/**
 * What is left to triage: the frozen `snapshot` order first (only items that
 * still exist), then new items in queue order, without any already `handled`.
 */
export function triageList(snapshot: readonly string[], scope: readonly SimAgent[], handled: ReadonlySet<string>): TriageItem[] {
  const live = triageItems(scope);
  const byKey = new Map(live.map((i) => [i.key, i]));
  const order = new Map(snapshot.map((k, i) => [k, i]));
  const kept = snapshot.filter((k) => byKey.has(k) && !handled.has(k)).map((k) => byKey.get(k)!);
  const added = live.filter((i) => !order.has(i.key) && !handled.has(i.key));
  return [...kept, ...added];
}

/** The review an item is about (its own, or for a draft, none). */
export function itemReview(a: SimAgent, item: TriageItem) {
  return item.rid ? a.reviews.find((r) => r.id === item.rid) : item.kind === "input" && a.reviews.length ? topReview(a) : undefined;
}
