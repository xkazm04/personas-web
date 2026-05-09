import { create } from "zustand";
import { api } from "@/lib/api";
import type { PersonaEvent, PersonaEventSubscription } from "@/lib/types";
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
  retryCounts: Record<string, number>;
  replayEvent: (event: PersonaEvent) => Promise<void>;
  replayEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number; aborted: boolean; skipped: number }>;

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
      const events = await api.listEvents({ limit: 100 });
      set({ events, eventIds: new Set(events.map((e) => e.id)) });
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
  retryCounts: loadRetryCounts(),
  replayEvent: async (event) => {
    if (isReplayLocked(get().retryCounts, event.id)) {
      throw new ReplayLockedError(event.id);
    }
    set((s) => ({ replayingIds: new Set(s.replayingIds).add(event.id) }));
    try {
      const newEvent = await api.publishEvent({
        eventType: event.eventType,
        sourceType: event.sourceType,
        sourceId: event.sourceId ?? undefined,
        targetPersonaId: event.targetPersonaId ?? undefined,
        payload: event.payload ?? undefined,
      });
      set((s) => {
        const nextReplayingIds = new Set(s.replayingIds);
        nextReplayingIds.delete(event.id);
        const nextRetryCounts = {
          ...s.retryCounts,
          [event.id]: (s.retryCounts[event.id] ?? 0) + 1,
        };
        saveRetryCounts(nextRetryCounts);
        return {
          replayingIds: nextReplayingIds,
          retryCounts: nextRetryCounts,
          events: [newEvent, ...s.events],
          eventIds: new Set(s.eventIds).add(newEvent.id),
        };
      });
    } catch (err) {
      set((s) => {
        const nextReplayingIds = new Set(s.replayingIds);
        nextReplayingIds.delete(event.id);
        return { replayingIds: nextReplayingIds };
      });
      if (err instanceof ReplayLockedError) throw err;
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
    // them just to throw ReplayLockedError. Lockout is reported as `skipped`.
    const eligible: PersonaEvent[] = [];
    for (const e of events) {
      if (isReplayLocked(get().retryCounts, e.id)) {
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
      retryCounts: {},
      subscriptions: [],
      subscriptionsLoading: false,
    });
  },
}));
