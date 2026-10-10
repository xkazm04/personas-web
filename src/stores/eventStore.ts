import { create } from "zustand";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import type { EventStatus, PersonaEvent, PersonaEventSubscription } from "@/lib/types";
import {
  assertEventTransition,
  IllegalEventTransitionError,
  isEventDiscardable,
  isEventRetryable,
} from "@/lib/eventStatusFsm";
import { MAX_MANUAL_RETRIES } from "@/lib/eventWireStatus";
import { mutate } from "swr";
import { dashboardKeys } from "@/lib/dashboard-queries";

const REPLAY_BATCH_SIZE = 10;
const MAX_EVENTS_BUFFER = 1_000;
// The manual retry budget is the desktop's (`MAX_MANUAL_RETRIES`,
// events.rs:1086) and it is counted on the ROW (`retryCount`, the desktop's
// `retry_count`), so it is the same in every browser and survives a reload.
// It used to be a 3-try budget kept in one browser's own storage.
export { MAX_MANUAL_RETRIES };
// Trip the outer batch loop after this many consecutive failures, so a sustained
// outage during "Replay All" can't pump hundreds of doomed events at the bus.
const CIRCUIT_BREAKER_THRESHOLD = 5;

export class ReplayLockedError extends Error {
  constructor(eventId: string) {
    super(`Event ${eventId} has reached the maximum replay limit (${MAX_MANUAL_RETRIES})`);
    this.name = "ReplayLockedError";
  }
}

/**
 * Has this row spent its manual retry budget? A null count (a plane that does
 * not report it) is unknown, not spent: the backend's own cap decides.
 */
export function isReplayLocked(event: Pick<PersonaEvent, "retryCount">): boolean {
  return event.retryCount !== null && event.retryCount >= MAX_MANUAL_RETRIES;
}

export type ConnectionStatus = "connected" | "reconnecting" | "polling";

type EventSetter = (partial: (state: EventState) => Partial<EventState>) => void;

/** Overwrite fields of one buffered row (no FSM check: callers own that). */
function patchEvent(set: EventSetter, eventId: string, patch: Partial<PersonaEvent>): void {
  set((s) => {
    const i = s.events.findIndex((e) => e.id === eventId);
    if (i === -1) return {};
    const events = [...s.events];
    events[i] = { ...events[i], ...patch };
    return { events };
  });
}

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
  /** The plane answered 501 not_on_desktop to the list read: an empty list means "not served", not "no events". */
  listNotServed: boolean;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  fetchEvents: () => Promise<void>;
  appendEvent: (event: PersonaEvent) => void;

  // Replay / DLQ
  replayingIds: Set<string>;
  discardingIds: Set<string>;
  /**
   * The only writer of `event.status`. Rejects any move the FSM in
   * `eventStatusFsm.ts` does not allow, so an illegal transition throws at the
   * call site instead of quietly corrupting the dead letter lane.
   */
  transitionEvent: (eventId: string, next: EventStatus) => PersonaEvent | null;
  /**
   * Re-queue a dead-lettered row: one `updateEvent(id, { status: "pending",
   * retryCount: n + 1 })`, the desktop's `retry_dead_letter`. No new event is
   * published. Rejects with `ReplayLockedError` (no api call) once the row
   * has spent `MAX_MANUAL_RETRIES`, and with `IllegalEventTransitionError` for
   * any row that is not in `dead_letter`.
   */
  replayEvent: (event: PersonaEvent) => Promise<void>;
  replayEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number; aborted: boolean; skipped: number }>;
  discardEvent: (event: PersonaEvent) => Promise<void>;
  discardEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number; skipped: number }>;

  subscriptions: PersonaEventSubscription[];
  subscriptionsLoading: boolean;
  /** The plane answered 501 not_on_desktop to the subscription read: an empty list means "not served", not "no subscriptions". */
  subscriptionsNotServed: boolean;
  /** A subscription read has succeeded since the last reset; until then the count is unknown, not zero. */
  subscriptionsRead: boolean;
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
  listNotServed: false,
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
        //
        // A row with a write in flight (retry / discard) keeps its local,
        // optimistic version until the write settles: a poll that read the
        // table before the write must not revert it mid-flight.
        const inFlight = (id: string) => s.replayingIds.has(id) || s.discardingIds.has(id);
        const local = new Map(s.events.map((e) => [e.id, e]));
        const incoming = fetched.map((e) => (inFlight(e.id) ? (local.get(e.id) ?? e) : e));
        const fetchedIds = new Set(fetched.map((e) => e.id));
        const preserved = s.events.filter((e) => !fetchedIds.has(e.id));
        const merged = [...incoming, ...preserved]
          .sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return tb - ta; // newest first
          })
          .slice(0, MAX_EVENTS_BUFFER);
        return {
          events: merged,
          eventIds: new Set(merged.map((e) => e.id)),
          listNotServed: false,
        };
      });
    } catch (err) {
      // 501 means this plane does not serve the list; any other failure leaves stale.
      if (err instanceof ApiError && err.status === 501) set({ listNotServed: true });
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
    const current = get().events.find((e) => e.id === event.id) ?? event;
    // A retry is a transition, not a counter bump: only a dead-lettered row
    // can be retried (a `failed` row belongs to the auto-retry engine).
    if (!isEventRetryable(current.status)) {
      throw new IllegalEventTransitionError(current.status, "pending");
    }
    if (isReplayLocked(current)) throw new ReplayLockedError(event.id);
    const retryCount = (current.retryCount ?? 0) + 1;
    set((s) => ({ replayingIds: new Set(s.replayingIds).add(event.id) }));
    get().transitionEvent(event.id, "pending");
    patchEvent(set, event.id, { retryCount, processedAt: null });
    try {
      await api.updateEvent(event.id, { status: "pending", retryCount });
    } catch {
      // The write never landed, so the row never moved: roll the optimistic
      // re-queue back (not a transition - pending -> dead_letter is not one).
      patchEvent(set, event.id, {
        status: current.status,
        retryCount: current.retryCount,
        processedAt: current.processedAt,
      });
      throw new Error("Replay failed");
    } finally {
      clearReplaying(set, event.id);
    }
  },
  replayEvents: async (events) => {
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    let aborted = false;
    let consecutiveFailures = 0;

    // Pre-filter out locked and non-retryable rows so we don't churn batches
    // calling them just to throw. Both are reported as `skipped`.
    const eligible: PersonaEvent[] = [];
    for (const e of events) {
      const current = get().events.find((x) => x.id === e.id) ?? e;
      if (isReplayLocked(current) || !isEventRetryable(current.status)) skipped++;
      else eligible.push(e);
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
  subscriptionsNotServed: false,
  subscriptionsRead: false,
  fetchSubscriptions: async () => {
    set({ subscriptionsLoading: true });
    try {
      const subscriptions = await api.listAllSubscriptions();
      set({ subscriptions, subscriptionsNotServed: false, subscriptionsRead: true });
    } catch (err) {
      // 501 means this plane does not serve the read; any other failure leaves stale.
      if (err instanceof ApiError && err.status === 501) set({ subscriptionsNotServed: true });
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
    set({
      events: [],
      eventIds: new Set(),
      eventsLoading: false,
      listNotServed: false,
      replayingIds: new Set(),
      discardingIds: new Set(),
      subscriptions: [],
      subscriptionsLoading: false,
      subscriptionsNotServed: false,
      subscriptionsRead: false,
    });
  },
}));
