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
import {
  overlayWith,
  transition,
  type LedgerBatch,
  type LedgerEffect,
  type LedgerEvent,
  type LedgerState,
  type RefusalReason,
} from "@/lib/review-ledger";
import { summarizeOutcome, type DeadLetterFailure, type OutcomeSummary } from "@/lib/deadLetterTriage";
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

/** The operator's two dead-letter verdicts, armed through the commit window. */
export type EventVerdict = "retry" | "discard";

/** A bulk verb's per-row result, the shape of the desktop's `BulkDeadLetterOutcome`. */
export interface DeadLetterRunResult {
  succeeded: string[];
  failed: DeadLetterFailure[];
  /** The circuit breaker stopped the run; the rows it never tried are `aborted`. */
  aborted: boolean;
}

/** The last committed verdict that left rows unresolved: shown, never swallowed. */
export type DeadLetterOutcome = OutcomeSummary & { batchId: number; verb: EventVerdict };

const IDLE_EVENT_LEDGER: LedgerState<EventVerdict> = { window: null, inFlight: [], nextBatchId: 1 };
let windowTimer: { batchId: number; handle: ReturnType<typeof setTimeout> } | null = null;

/** Why one row's verb threw, in the desktop's reason vocabulary. */
function failureReason(err: unknown): DeadLetterFailure["reason"] {
  if (err instanceof ReplayLockedError) return "retry_exhausted";
  if (err instanceof IllegalEventTransitionError) return "wrong_status";
  return "write_failed";
}

/**
 * Paint a pending verdict over a row, so no poll can repaint it during its
 * window. Eligibility is the FSM's (and the row's retry budget): a row the
 * verdict could not move is left as it is, and the commit reports it.
 */
function applyEventVerdict(row: PersonaEvent, batch: LedgerBatch<EventVerdict>): PersonaEvent {
  if (batch.verdict === "discard") {
    return isEventDiscardable(row.status) ? { ...row, status: "discarded" } : row;
  }
  return isEventRetryable(row.status) && !isReplayLocked(row) ? { ...row, status: "pending" } : row;
}

/** Buffered rows with every armed or committing verdict painted over them. */
export function overlayEventVerdicts(
  events: readonly PersonaEvent[],
  ledger: LedgerState<EventVerdict>,
): PersonaEvent[] {
  return overlayWith(events, ledger, applyEventVerdict);
}

/** What the operator sees: the store's rows under its pending verdicts. */
export function selectVisibleEvents(s: Pick<EventState, "events" | "ledger">): PersonaEvent[] {
  return overlayEventVerdicts(s.events, s.ledger);
}

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
  /**
   * The verbs a committed verdict runs. Every id comes back by name: done, or
   * failed with its reason (`not_found`, `retry_exhausted`, `wrong_status`,
   * `write_failed`, `aborted`). Surfaces never call these: they `decide`.
   */
  replayEvents: (ids: readonly string[]) => Promise<DeadLetterRunResult>;
  discardEvent: (event: PersonaEvent) => Promise<void>;
  discardEvents: (ids: readonly string[]) => Promise<DeadLetterRunResult>;

  /** The commit window (review-ledger.ts) holding the operator's verdicts. */
  ledger: LedgerState<EventVerdict>;
  /**
   * The one door for an operator's retry or discard: opens a 5 s undoable
   * window and writes when it closes. Returns false when the ledger refused
   * the arm (see `refusal`).
   */
  decide: (ids: readonly string[], verdict: EventVerdict) => boolean;
  undoDecision: () => void;
  /** Teardown: commit the open window now (unmount, pagehide, sign-out). */
  flushDecisions: () => void;
  /** Last refused arm; shown on the open undo toast. */
  refusal: { reason: RefusalReason; batchId: number | null } | null;
  lastOutcome: DeadLetterOutcome | null;
  dismissOutcome: () => void;

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

export const useEventStore = create<EventState>((set, get) => {
  function dispatch(event: LedgerEvent<EventVerdict>): boolean {
    const t = transition(get().ledger, event);
    if (t.refused) {
      set({ refusal: { reason: t.refused.reason, batchId: get().ledger.window?.batchId ?? null } });
      return false;
    }
    if (t.state === get().ledger) return true;
    set({ ledger: t.state, refusal: event.type === "arm" ? null : get().refusal });
    for (const e of t.effects) runEffect(e);
    return true;
  }

  function runEffect(e: LedgerEffect<EventVerdict>) {
    if (e.type === "schedule") {
      if (windowTimer) clearTimeout(windowTimer.handle);
      const handle = setTimeout(() => {
        windowTimer = null;
        dispatch({ type: "expire", batchId: e.batchId });
      }, Math.max(0, e.deadline - Date.now()));
      windowTimer = { batchId: e.batchId, handle };
    } else if (e.type === "cancelTimer") {
      if (windowTimer?.batchId === e.batchId) {
        clearTimeout(windowTimer.handle);
        windowTimer = null;
      }
    } else {
      void commit(e.batch);
    }
  }

  async function commit(batch: LedgerBatch<EventVerdict>) {
    let result: DeadLetterRunResult;
    try {
      result = batch.verdict === "retry" ? await get().replayEvents(batch.ids) : await get().discardEvents(batch.ids);
    } catch {
      result = { succeeded: [], failed: batch.ids.map((id) => ({ id, reason: "write_failed" as const })), aborted: false };
    }
    if (result.failed.length > 0) {
      set({ lastOutcome: { ...summarizeOutcome(result), batchId: batch.batchId, verb: batch.verdict } });
    }
    dispatch({ type: "settled", batchId: batch.batchId, failedIds: result.failed.map((f) => f.id) });
  }

  /** Run `verb` over `ids` in batches; every id comes back by name. */
  async function runVerb(
    ids: readonly string[],
    refuse: (row: PersonaEvent) => DeadLetterFailure["reason"] | null,
    verb: (row: PersonaEvent) => Promise<void>,
    breaker: boolean,
  ): Promise<DeadLetterRunResult> {
    const succeeded: string[] = [];
    const failed: DeadLetterFailure[] = [];
    const queue: PersonaEvent[] = [];
    // Pre-filter rows the verb would only throw on, so batches are not churned.
    for (const id of new Set(ids)) {
      const row = get().events.find((e) => e.id === id);
      const reason = row ? refuse(row) : "not_found";
      if (reason) failed.push({ id, reason });
      else if (row) queue.push(row);
    }
    let consecutiveFailures = 0;
    for (let i = 0; i < queue.length; i += REPLAY_BATCH_SIZE) {
      const batch = queue.slice(i, i + REPLAY_BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(verb));
      results.forEach((r, j) => {
        if (r.status === "fulfilled") {
          succeeded.push(batch[j].id);
          consecutiveFailures = 0;
        } else {
          failed.push({ id: batch[j].id, reason: failureReason(r.reason) });
          consecutiveFailures++;
        }
      });
      // A sustained outage stops the run; the rows it never tried are named.
      const rest = queue.slice(i + REPLAY_BATCH_SIZE);
      if (breaker && consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD && rest.length > 0) {
        for (const row of rest) failed.push({ id: row.id, reason: "aborted" });
        return { succeeded, failed, aborted: true };
      }
    }
    return { succeeded, failed, aborted: false };
  }

  return {
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
  replayEvents: (ids) =>
    runVerb(
      ids,
      (row) => (!isEventRetryable(row.status) ? "wrong_status" : isReplayLocked(row) ? "retry_exhausted" : null),
      (row) => get().replayEvent(row),
      true,
    ),
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
  discardEvents: (ids) =>
    runVerb(
      ids,
      (row) => (isEventDiscardable(row.status) ? null : "wrong_status"),
      (row) => get().discardEvent(row),
      false,
    ),

  ledger: IDLE_EVENT_LEDGER,
  refusal: null,
  lastOutcome: null,
  decide: (ids, verdict) => dispatch({ type: "arm", ids, verdict, now: Date.now() }),
  undoDecision: () => {
    const w = get().ledger.window;
    if (w) dispatch({ type: "undo", batchId: w.batchId });
  },
  flushDecisions: () => {
    dispatch({ type: "flush" });
  },
  dismissOutcome: () => set({ lastOutcome: null }),

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
    // A verdict made before sign-out is still the operator's: commit it
    // rather than drop it, then forget the rows.
    get().flushDecisions();
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
      refusal: null,
      lastOutcome: null,
    });
  },
  };
});

// Commit any open verdict window when the page goes away (flush-on-teardown).
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => useEventStore.getState().flushDecisions());
}
