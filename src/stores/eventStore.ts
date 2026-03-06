import { create } from "zustand";
import { api } from "@/lib/api";
import type { PersonaEvent, PersonaEventSubscription } from "@/lib/types";
import { invalidateAgentDetailCache } from "@/lib/agentDetailCache";

const REPLAY_BATCH_SIZE = 10;
const MAX_EVENTS_BUFFER = 1_000;

interface EventState {
  events: PersonaEvent[];
  eventIds: Set<string>;
  eventsLoading: boolean;
  fetchEvents: () => Promise<void>;
  appendEvent: (event: PersonaEvent) => void;

  // Replay / DLQ
  replayingIds: Set<string>;
  retryCounts: Record<string, number>;
  replayEvent: (event: PersonaEvent) => Promise<void>;
  replayEvents: (events: PersonaEvent[]) => Promise<{ succeeded: number; failed: number }>;

  subscriptions: PersonaEventSubscription[];
  subscriptionsLoading: boolean;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (input: { personaId: string; eventType: string; sourceFilter?: string }) => Promise<void>;
  updateSubscription: (personaId: string, subId: string, body: { enabled?: boolean; eventType?: string; sourceFilter?: string | null }) => Promise<void>;
  deleteSubscription: (personaId: string, subId: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  eventIds: new Set(),
  eventsLoading: false,
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
      const nextEvents = [event, ...s.events].slice(0, MAX_EVENTS_BUFFER);
      const eventIds = new Set(nextEvents.map((e) => e.id));
      return { events: nextEvents, eventIds };
    });
  },

  // Replay / DLQ
  replayingIds: new Set(),
  retryCounts: {},
  replayEvent: async (event) => {
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
        return {
          replayingIds: nextReplayingIds,
          retryCounts: { ...s.retryCounts, [event.id]: (s.retryCounts[event.id] ?? 0) + 1 },
          events: [newEvent, ...s.events],
          eventIds: new Set(s.eventIds).add(newEvent.id),
        };
      });
    } catch {
      set((s) => {
        const nextReplayingIds = new Set(s.replayingIds);
        nextReplayingIds.delete(event.id);
        return { replayingIds: nextReplayingIds };
      });
      throw new Error("Replay failed");
    }
  },
  replayEvents: async (events) => {
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < events.length; i += REPLAY_BATCH_SIZE) {
      const batch = events.slice(i, i + REPLAY_BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((e) => get().replayEvent(e)),
      );

      for (const r of results) {
        if (r.status === "fulfilled") succeeded++;
        else failed++;
      }
    }

    return { succeeded, failed };
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
    invalidateAgentDetailCache(input.personaId);
  },
  updateSubscription: async (personaId, subId, body) => {
    const updated = await api.updateSubscription(personaId, subId, body);
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === subId ? updated : sub,
      ),
    }));
    invalidateAgentDetailCache(personaId);
  },
  deleteSubscription: async (personaId, subId) => {
    await api.deleteSubscription(personaId, subId);
    set((s) => ({
      subscriptions: s.subscriptions.filter((sub) => sub.id !== subId),
    }));
    invalidateAgentDetailCache(personaId);
  },
}));
