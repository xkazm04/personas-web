"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useEventStore } from "@/stores/eventStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { useCommandStore } from "@/stores/commandStore";
import { useControllerStore } from "@/stores/controllerStore";
import { useNotesStore } from "@/stores/notesStore";
import { emitNewReview } from "@/lib/review-voice";
import type { ReviewSeverity } from "@/lib/types";
import { registerSyncedBindings } from "./syncedRealtimeBindings";

/**
 * Live dashboard updates (v2). When the desktop sync writer pushes into the
 * user's Supabase tenant, Postgres emits change events; we subscribe to them
 * and refetch the affected store instead of waiting for the next poll tick.
 *
 * Realtime applies RLS to INSERT and UPDATE events but not to DELETE (a DELETE
 * carries only the primary key and cannot be filtered), so DELETE is not
 * subscribed (scan d4b90e7a F11); see syncedRealtimeBindings.ts. A delete that
 * arrives alone shows at the next refetch, view mount or refresh. Only active
 * in supabase data-source mode for a signed-in (non-demo) user; otherwise a
 * no-op. Polling stays in place as a backstop.
 */

const IS_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/** Coalesce bursts (a sync pass touches many rows of one table at once). */
const DEBOUNCE_MS = 400;

const REVIEW_SEVERITIES = new Set<string>(["critical", "warning", "info"]);

/** Coerce a synced row's severity to a known value (table default is "info"). */
function toReviewSeverity(value: unknown): ReviewSeverity {
  return typeof value === "string" && REVIEW_SEVERITIES.has(value)
    ? (value as ReviewSeverity)
    : "info";
}

/**
 * Turn an INSERT on `synced_manual_reviews` into a new-review signal for the
 * voice announcer. Only genuinely new, still-pending rows fire; `seen` guards
 * against a socket reconnect replaying the same INSERT. Typed structurally so
 * we don't depend on the exact Realtime payload generic.
 */
function maybeAnnounceNewReview(
  payload: { eventType?: string; new?: Record<string, unknown> | null },
  seen: Set<string>,
): void {
  if (payload.eventType !== "INSERT") return;
  const row = payload.new;
  if (!row) return;
  const id = typeof row.id === "string" ? row.id : null;
  if (!id || seen.has(id)) return;
  if (row.status !== "pending") return;
  seen.add(id);
  emitNewReview({
    id,
    title: typeof row.title === "string" ? row.title : "",
    severity: toReviewSeverity(row.severity),
    personaId: typeof row.persona_id === "string" ? row.persona_id : "",
  });
}

/** Map a changed table to the store refetch(es) it should trigger. */
function refetchFor(table: string): (() => void) | null {
  switch (table) {
    case "synced_personas":
      // Forced: the desktop pushed a change, so the 5 min persona cache is stale by definition.
      return () => void usePersonaStore.getState().fetchPersonas({ force: true });
    case "synced_executions":
      return () => void useExecutionStore.getState().fetchExecutions();
    case "synced_events":
      return () => void useEventStore.getState().fetchEvents();
    case "synced_manual_reviews":
      return () => void useReviewStore.getState().fetchReviews();
    case "synced_devices":
      // Device presence drives the health/status surface.
      return () => {
        void useSystemStore.getState().fetchHealth();
        void useSystemStore.getState().fetchStatus();
      };
    case "synced_notes":
      // A full-set replace lands as a burst of upserts; the debounce above
      // folds it into one refetch. Deletes are not subscribed and wait for the
      // next refetch.
      return () => void useNotesStore.getState().fetchNotes();
    case "synced_chat_sessions":
    case "synced_chat_messages":
      // A chat_send reply lands as a message insert (and a thread's updated_at).
      // Only the open chat is re-read; the store loads with the phone's chat
      // sheets, so it is imported lazily rather than into every dashboard load.
      return () => void import("@/stores/chatStore").then((m) => m.useChatStore.getState().refreshOpen());
    default:
      return null;
  }
}

export function useSyncedRealtime(): void {
  const { isAuthenticated, isDemo } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, isDemo: s.isDemo })),
  );
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!IS_SUPABASE || !isAuthenticated || isDemo) return;

    const timersMap = timers.current;
    const scheduleRefetch = (table: string) => {
      const existing = timersMap.get(table);
      if (existing) clearTimeout(existing);
      timersMap.set(
        table,
        setTimeout(() => {
          timersMap.delete(table);
          refetchFor(table)?.();
        }, DEBOUNCE_MS),
      );
    };

    // Per-subscription set of review ids already announced, so a reconnect
    // that replays recent INSERTs doesn't read the same review aloud twice.
    const announcedReviews = new Set<string>();

    let channel: RealtimeChannel | undefined;
    try {
      const supabase = getSupabase();
      channel = supabase.channel("synced-changes");
      registerSyncedBindings(channel, {
        onTableChange: (table, payload) => {
          scheduleRefetch(table);
          // A new review is an event, not just a list change - surface it so
          // the voice announcer can react. The debounced refetch still runs.
          if (table === "synced_manual_reviews") {
            maybeAnnounceNewReview(payload, announcedReviews);
          }
          // The heartbeat itself feeds the online gate (useSyncReachability),
          // applied as it arrives rather than after a refetch.
          if (table === "synced_devices") {
            useDeviceStore.getState().applyRealtime(payload);
          }
        },
        onCommandUpdate: (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row || typeof row.id !== "string" || typeof row.status !== "string") return;
          useCommandStore.getState().applyRow({
            id: row.id,
            status: row.status,
            result: row.result,
            error_message: typeof row.error_message === "string" ? row.error_message : null,
          });
        },
        onControllerUpdate: (payload) =>
          useControllerStore.getState().applyRow(payload.new as Record<string, unknown> | null),
      });
      // Reflect the real socket state in the connection indicator. Previously
      // subscribe() had no status callback, so eventStore.connectionStatus stayed
      // at its "polling" default and the dot was pure decoration in supabase mode.
      channel.subscribe((status) => {
        const setStatus = useEventStore.getState().setConnectionStatus;
        if (status === "SUBSCRIBED") setStatus("connected");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setStatus("reconnecting");
        else if (status === "CLOSED") setStatus("polling");
      });
    } catch (err) {
      captureExceptionScrubbed(err, { tags: { scope: "useSyncedRealtime" } });
      return;
    }

    return () => {
      for (const timer of timersMap.values()) clearTimeout(timer);
      timersMap.clear();
      if (channel) {
        try {
          void getSupabase().removeChannel(channel);
        } catch {
          // Client already torn down (sign-out) — nothing to remove.
        }
      }
      // Realtime is gone; polling is the backstop again.
      useEventStore.getState().setConnectionStatus("polling");
    };
  }, [isAuthenticated, isDemo]);
}
