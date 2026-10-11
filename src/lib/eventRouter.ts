/**
 * Routing what-if, pure. Runs an event through today's subscriptions and
 * personas and says whether a retry could be delivered, before one is spent
 * (registry delivery-guarantees: a retry budget is for events that can
 * succeed). It SIMULATES the desktop's match rule from the fields the web
 * sees (`eventType`, `sourceFilter`, `enabled`, persona existence and
 * pause); anything the desktop routes on that the web does not see (for
 * example `useCaseId` precedence) is outside it, so callers label the result
 * "simulated". Nothing here touches React or the store.
 */
import type { Persona, PersonaEvent, PersonaEventSubscription } from "./types";

export type RouteVerdict =
  /** An enabled subscription of a live persona matches: a retry can deliver. */
  | { kind: "would_deliver"; subscriptionId: string; personaId: string }
  /** The target persona exists but is paused: resume it, then retry. */
  | { kind: "blocked_paused"; personaId: string }
  /** The target persona no longer exists: no retry can ever succeed. */
  | { kind: "futile_target_missing"; personaId: string }
  /** No enabled subscription matches: create one (or enable a disabled match). */
  | { kind: "no_route"; disabledMatchIds: string[] };

type RoutedEvent = Pick<PersonaEvent, "eventType" | "sourceType" | "sourceId" | "targetPersonaId">;

/** A null/blank filter matches every source; otherwise it names the source type or the source id. */
function sourceMatches(filter: string | null, event: RoutedEvent): boolean {
  const f = filter?.trim().toLowerCase();
  if (!f) return true;
  return f === event.sourceType.toLowerCase() || f === event.sourceId?.toLowerCase();
}

export function route(
  event: RoutedEvent,
  subscriptions: readonly PersonaEventSubscription[],
  personas: readonly Pick<Persona, "id" | "enabled">[],
): RouteVerdict {
  const byId = new Map(personas.map((p) => [p.id, p]));
  if (event.targetPersonaId) {
    const target = byId.get(event.targetPersonaId);
    if (!target) return { kind: "futile_target_missing", personaId: event.targetPersonaId };
    if (!target.enabled) return { kind: "blocked_paused", personaId: target.id };
  }
  const disabledMatchIds: string[] = [];
  for (const s of subscriptions) {
    if (s.eventType !== event.eventType || !sourceMatches(s.sourceFilter, event)) continue;
    if (event.targetPersonaId && s.personaId !== event.targetPersonaId) continue;
    if (!s.enabled) {
      disabledMatchIds.push(s.id);
      continue;
    }
    const subscriber = byId.get(s.personaId);
    if (subscriber?.enabled) return { kind: "would_deliver", subscriptionId: s.id, personaId: s.personaId };
  }
  return { kind: "no_route", disabledMatchIds };
}

/** A retry is worth its budget only when the event would deliver now. */
export function isRetryable(verdict: RouteVerdict): boolean {
  return verdict.kind === "would_deliver";
}

/** Futile rows can never succeed; the bulk bar offers to discard them. */
export function isFutile(verdict: RouteVerdict): boolean {
  return verdict.kind === "futile_target_missing";
}
