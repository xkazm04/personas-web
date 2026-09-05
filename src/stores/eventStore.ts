import { create } from "zustand";
import { api } from "@/lib/api";
import type { EventStatus, PersonaEvent, PersonaEventSubscription } from "@/lib/types";
import {
  assertEventTransition,
  IllegalEventTransitionError,
  isEventDiscardable,
  isEventRetryable,
  statusAfterFailedAttempt,
} from "@/lib/eventStatusFsm";
import { mutate } from "swr";
import { dashboardKeys } from "@/lib/dashboard-queries";

const REPLAY_BATCH_SIZE = 10;
const MAX_EVENTS_BUFFER = 1_000;
// Hard cap on per-event replays. Beyond this, an event is "replay locked" — the
// underlying handler is almost certainly broken and re-publishing just floods
// the bus with events that re-enter the DLQ.
export const MAX_REPLAY_RETRIES = 3;
// Trip the outer batch loop after this many consecutive failures, so a sustained
// outage during "Replay All" can't pump hundreds of doomed events at the bus.
const CIRCUIT_BREAKER_THRESHOLD = 5;

const RETRY_COUNTS_KEY = "event-replay-retry-counts";

export class ReplayLockedError extends Error {
  constructor(eventId: string) {
    super(`Event ${eventId} has reached the maximum replay limit (${MAX_REPLAY_RETRIES})`);
    this.name = "ReplayLockedError";
  }
}

function loadRetryCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RETRY_COUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "number" && Number.isFinite(v) && v > 0) result[k] = v;
      }
      return result;
    }
    return {};
  } catch {
    return {};
  }
}

function saveRetryCounts(counts: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RETRY_COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // quota or serialization issue — degrade gracefully
  }
}

export function isReplayLocked(retryCounts: Record<string, number>, eventId: string): boolean {
  return (retryCounts[eventId] ?? 0) >= MAX_REPLAY_RETRIES;
}

export type ConnectionStatus = "connected" | "reconnecting" | "polling";

type EventSetter = (partial: (state: EventState) => Partial<EventState>) => void;

function clearReplaying(set: EventSetter, eventId: string): void {
  set((s) => {
    const nextReplayingIds = new Set(s.replayingIds);
    nextReplayingIds.delete(eventId);
    return { replayingIds: nextReplayingIds };
  });
}

interface EventState {
  events: PersonaEvent[];
  eventIds: Set<string>;
  eventsLoading: boolean;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  fetchEvents: () => Promise<void>;
  appendEvent: (event: PersonaEvent) => void;

  // Replay / DLQ
  replayingIds: Set<string>;
  discardingIds: Set<string>;
  retryCounts: Record<string, number>;
  /**
   * The only writer of `event.status`. Rejects any move the FSM in
   * `eventStatusFsm.ts` does not allow, so an illegal transition throws at the
   * call site instead of quietly corrupting the dead letter lane.
   */
  transitionEvent: (eventId: string, next: EventStatus) => PersonaEvent | null;
  replayEvent: (event: PersonaEvent) => Promise<void>;
  replayEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number; aborted: boolean; skipped: number }>;
  discardEvent: (event: PersonaEvent) => Promise<void>;
  discardEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number; skipped: number }>;

  subscriptions: PersonaEventSubscription[];
  subscriptionsLoading: boolean;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (input: { personaId: string; eventType: string; sourceFilter?: string }) => Promise<void>;
  updateSubscription: (personaId: string, subId: string, body: { enabled?: boolean; eventType?: string; sourceFilter?: string | null }) => Promise<void>;
  deleteSubscription: (personaId: string, subId: string) => Promise<void>;

  reset: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  eventIds: new Set(),
  eventsLoading: false,
  connectionStatus: "polling" as ConnectionStatus,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  fetchEvents: async () => {
    set({ eventsLoading: true });
    try {
      const fetched = await api.listEvents({ limit: 100 });
      set((s) => {
        // Merge instead of replacing the array. A fetch issued at t=0
        // with limit=100 doesn't include events that the SSE stream
        // delivered at t=0.5 (still in flight at the orchestrator when
        // the listEvents query ran), so a destructive `set({ events })`
        // dropped any events that arrived locally between the dispatch
        // and the response — most painfully during reconnect, when the
        // SSE-arrived events were the *only* signal of what happened
        // while disconnected.
        const fetchedIds = new Set(fetched.map((e) => e.id));
        const preserved = s.events.filter((e) => !fetchedIds.has(e.id));
        const merged = [...fetched, ...preserved]
          .sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return tb - ta; // newest first
          })
          .slice(0, MAX_EVENTS_BUFFER);
        return {
          events: merged,
          eventIds: new Set(merged.map((e) => e.id)),
        };
      });
    } catch {
      // leave stale
    } finally {
      set({ eventsLoading: false });
    }
  },
  appendEvent: (event) => {
    set((s) => {
      if (s.eventIds.has(event.id)) return s;
      // Keep the eventIds Set incremental: rebuilding it from nextEvents on
      // every SSE message is O(n) and burns the React commit phase during
      // traffic spikes (the exact moment the dashboard is needed most).
      const eventIds = new Set(s.eventIds);
      eventIds.add(event.id);
      let nextEvents: PersonaEvent[];
      if (s.events.length >= MAX_EVENTS_BUFFER) {
        const evicted = s.events[s.events.length - 1];
        if (evicted) eventIds.delete(evicted.id);
        nextEvents = [event, ...s.events.slice(0, MAX_EVENTS_BUFFER - 1)];
      } else {
        nextEvents = [event, ...s.events];
      }
      return { events: nextEvents, eventIds };
    });
  },

  // Replay / DLQ
  replayingIds: new Set(),
  discardingIds: new Set(),
  retryCounts: loadRetryCounts(),
  transitionEvent: (eventId, next) => {
    const index = get().events.findIndex((e) => e.id === eventId);
    if (index === -1) return null;
    const current = get().events[index];
    if (current.status === next) return current;
    // Throws IllegalEventTransitionError on an illegal move. Deliberately
    // *before* the set() so a rejected transition leaves the store untouched.
    assertEventTransition(current.status, next);
    const updated: PersonaEvent = {
      ...current,
      status: next,
      processedAt: next === "pending" || next === "processing" ? current.processedAt : new Date().toISOString(),
      errorMessage: next === "processed" ? null : current.errorMessage,
    };
    set((s) => {
      const events = [...s.events];
      const i = events.findIndex((e) => e.id === eventId);
      if (i === -1) return s;
      events[i] = updated;
      return { events };
    });
    return updated;
  },
  replayEvent: async (event) => {
    const currentEvent = get().events.find((e) => e.id === event.id) ?? event;
    // A retry is a transition, not a counter bump: only a row that is actually
    // sitting in the failed / dead-letter lane can be retried.
    if (!isEventRetryable(currentEvent.status)) {
      throw new IllegalEventTransitionError(currentEvent.status, "processing");
    }
    if (isReplayLocked(get().retryCounts, event.id)) {
      // Budget spent. Park it in the dead letter so the row has a destination
      // rather than a permanently climbing retry badge.
      if (currentEvent.status === "failed") get().transitionEvent(event.id, "dead_letter");
      throw new ReplayLockedError(event.id);
    }
    // Count the attempt up front, not the success. The previous shape only
    // incremented retryCounts inside the success branch, so a permanently
    // broken handler (always-throwing downstream) never tripped
    // MAX_REPLAY_RETRIES — Retry / Retry All could pump poison messages at
    // the bus indefinitely. Counting attempts means after MAX_REPLAY_RETRIES
    // calls the event becomes replay-locked regardless of outcome, which is
    // the actual semantics of "retry budget".
    const attempts = (get().retryCounts[event.id] ?? 0) + 1;
    set((s) => {
      const nextRetryCounts = { ...s.retryCounts, [event.id]: attempts };
      saveRetryCounts(nextRetryCounts);
      return {
        replayingIds: new Set(s.replayingIds).add(event.id),
        retryCounts: nextRetryCounts,
      };
    });
    get().transitionEvent(event.id, "processing");
    try {
      const newEvent = await api.publishEvent({
        eventType: event.eventType,
        sourceType: event.sourceType,
        sourceId: event.sourceId ?? undefined,
        targetPersonaId: event.targetPersonaId ?? undefined,
        payload: event.payload ?? undefined,
      });
      get().appendEvent(newEvent);
      // The verb that resolves the row. `api.updateEvent` existed with zero
      // call sites before this — the original event was never written back.
      await api.updateEvent(event.id, { status: "processed" });
      get().transitionEvent(event.id, "processed");
      clearReplaying(set, event.id);
    } catch (err) {
      const landing = statusAfterFailedAttempt(attempts, MAX_REPLAY_RETRIES);
      try {
        await api.updateEvent(event.id, { status: landing });
      } catch {
        // The local transition is still the truth the operator sees.
      }
      get().transitionEvent(event.id, landing);
      clearReplaying(set, event.id);
      if (err instanceof ReplayLockedError) throw err;
      if (err instanceof IllegalEventTransitionError) throw err;
      throw new Error("Replay failed");
    }
  },
  replayEvents: async (events) => {
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    let aborted = false;
    let consecutiveFailures = 0;

    // Pre-filter out already-locked events so we don't churn batches calling
    // them just to throw ReplayLockedError. Lockout is reported as `skipped`,
    // and a locked row is moved into the dead letter here too, so bulk retry
    // resolves exactly the same states as the per-row verb.
    const eligible: PersonaEvent[] = [];
    for (const e of events) {
      if (isReplayLocked(get().retryCounts, e.id)) {
        const current = get().events.find((x) => x.id === e.id) ?? e;
        if (current.status === "failed") get().transitionEvent(e.id, "dead_letter");
        skipped++;
      } else if (!isEventRetryable((get().events.find((x) => x.id === e.id) ?? e).status)) {
        skipped++;
      } else {
        eligible.push(e);
      }
    }

    outer: for (let i = 0; i < eligible.length; i += REPLAY_BATCH_SIZE) {
      const batch = eligible.slice(i, i + REPLAY_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((e) => get().replayEvent(e)),
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          succeeded++;
          consecutiveFailures = 0;
        } else {
          failed++;
          consecutiveFailures++;
          if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
            aborted = true;
            break outer;
          }
        }
      }
    }

    return { succeeded, failed, aborted, skipped };
  },
  discardEvent: async (event) => {
    const currentEvent = get().events.find((e) => e.id === event.id) ?? event;
    if (!isEventDiscardable(currentEvent.status)) {
      throw new IllegalEventTransitionError(currentEvent.status, "discarded");
    }
    set((s) => ({ discardingIds: new Set(s.discardingIds).add(event.id) }));
    try {
      await api.updateEvent(event.id, { status: "discarded" });
      get().transitionEvent(event.id, "discarded");
    } finally {
      set((s) => {
        const next = new Set(s.discardingIds);
        next.delete(event.id);
        return { discardingIds: next };
      });
    }
  },
  discardEvents: async (events) => {
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    const eligible = events.filter((e) => {
      const current = get().events.find((x) => x.id === e.id) ?? e;
      if (isEventDiscardable(current.status)) return true;
      skipped++;
      return false;
    });
    for (let i = 0; i < eligible.length; i += REPLAY_BATCH_SIZE) {
      const batch = eligible.slice(i, i + REPLAY_BATCH_SIZE);
      const results = await Promise.allSettled(batch.map((e) => get().discardEvent(e)));
      for (const r of results) {
        if (r.status === "fulfilled") succeeded++;
        else failed++;
      }
    }
    return { succeeded, failed, skipped };
  },

  subscriptions: [],
  subscriptionsLoading: false,
  fetchSubscriptions: async () => {
    set({ subscriptionsLoading: true });
    try {
      const subscriptions = await api.listAllSubscriptions();
      set({ subscriptions });
    } catch {
      // leave stale
    } finally {
      set({ subscriptionsLoading: false });
    }
  },
  createSubscription: async (input) => {
    const sub = await api.createSubscription(input);
    set((s) => ({ subscriptions: [...s.subscriptions, sub] }));
    void mutate(dashboardKeys.agentDetail(input.personaId));
  },
  updateSubscription: async (personaId, subId, body) => {
    const updated = await api.updateSubscription(personaId, subId, body);
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === subId ? updated : sub,
      ),
    }));
    void mutate(dashboardKeys.agentDetail(personaId));
  },
  deleteSubscription: async (personaId, subId) => {
    await api.deleteSubscription(personaId, subId);
    set((s) => ({
      subscriptions: s.subscriptions.filter((sub) => sub.id !== subId),
    }));
    void mutate(dashboardKeys.agentDetail(personaId));
  },

  reset: () => {
    saveRetryCounts({});
    set({
      events: [],
      eventIds: new Set(),
      eventsLoading: false,
      replayingIds: new Set(),
      discardingIds: new Set(),
      retryCounts: {},
      subscriptions: [],
      subscriptionsLoading: false,
    });
  },
}));
