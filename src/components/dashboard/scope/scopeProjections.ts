import { dayStartMs, scopeRows, type Scope } from "@/lib/dashboardScope";
import type {
  KnowledgePattern,
  LeaderboardPersona,
  MemoryItem,
  MessageThread,
  SLABreach,
  SLATarget,
} from "@/lib/mock-dashboard-data";
import type { DailyMetric, GlobalExecution, ManualReviewItem, PersonaEvent } from "@/lib/types";

/**
 * What each scoped view's rows give the scope (docs/features/dashboard/
 * shell-chrome.md, "Scope"). One function per view, all through `inScope`, so a
 * view applies exactly the dimensions its rows carry and no other:
 *
 * - a row with a persona id or name is filtered by persona;
 * - a row with a time is filtered by the window; standing state (a leaderboard
 *   score, an SLA objective, a memory) has none and is not;
 * - a daily series row is one whole day, in by its start.
 */

/** Runs: whose, and when queued. */
export const scopeExecutions = (rows: readonly GlobalExecution[], scope: Scope) =>
  scopeRows(rows, (run) => ({ personaId: run.personaId, at: run.createdAt }), scope);

/** Reviews: whose, and when raised. */
export const scopeReviews = (rows: readonly ManualReviewItem[], scope: Scope) =>
  scopeRows(rows, (review) => ({ personaId: review.personaId, at: review.createdAt }), scope);

/** Bus events: the persona each targets (null: none), and when published. */
export const scopeEvents = (rows: readonly PersonaEvent[], scope: Scope) =>
  scopeRows(rows, (event) => ({ personaId: event.targetPersonaId, at: event.createdAt }), scope);

/** Leaderboard rows are period scores, not moments: persona only. */
export const scopeLeaderboard = (rows: readonly LeaderboardPersona[], scope: Scope) =>
  scopeRows(rows, (row) => ({ personaId: row.id }), scope);

/**
 * SLA: objectives by persona; a breach by persona and by overlapping the
 * window (an open breach is in every window after it began). A `?focus=`
 * breach stays, so a deep link always lands on its row.
 */
export function scopeSla(
  data: { targets: readonly SLATarget[]; breaches: readonly SLABreach[] },
  scope: Scope,
  focusId: string | null = null,
) {
  return {
    targets: scopeRows(data.targets, (target) => ({ personaName: target.persona }), scope),
    breaches: scopeRows(
      data.breaches,
      (breach) => ({ personaName: breach.persona, at: breach.startedAt, until: breach.resolvedAt }),
      scope,
      { id: focusId, of: (breach) => breach.id },
    ),
  };
}

/** Knowledge: a pattern by persona and when it was last seen; a memory is standing state, persona only. */
export function scopeKnowledge(
  data: { patterns: readonly KnowledgePattern[]; memories: readonly MemoryItem[] },
  scope: Scope,
) {
  return {
    patterns: scopeRows(data.patterns, (pattern) => ({ personaName: pattern.personaName, at: pattern.lastSeen }), scope),
    memories: scopeRows(data.memories, (memory) => ({ personaName: memory.persona }), scope),
  };
}

/** Message threads: whose, and the latest message's time. */
export const scopeMessages = (rows: readonly MessageThread[], scope: Scope) =>
  scopeRows(rows, (thread) => ({ personaName: thread.persona, at: thread.latestTimestamp }), scope);

/** The fleet's daily series has no persona: the window only, whole days. */
export const scopeDaily = (rows: readonly DailyMetric[], scope: Scope) =>
  scopeRows(rows, (day) => ({ at: dayStartMs(day.date) }), scope);
