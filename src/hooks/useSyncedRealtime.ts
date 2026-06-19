"use client";

import { useEffect, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useEventStore } from "@/stores/eventStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useSystemStore } from "@/stores/systemStore";
import { emitNewReview } from "@/lib/review-voice";
import type { ReviewSeverity } from "@/lib/types";

/**
 * Live dashboard updates (v2). When the desktop sync writer pushes into the
 * user's Supabase tenant, Postgres emits change events; we subscribe to them
 * and refetch the affected store instead of waiting for the next poll tick.
 *
 * Row isolation is automatic: Realtime enforces the same RLS as reads, so the
 * socket only delivers changes to *this* user's rows. Only active in supabase
 * data-source mode for a signed-in (non-demo) user; otherwise a no-op. Polling
 * stays in place as a backstop — this just collapses the latency to ~instant.
 */

const IS_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/** Coalesce bursts (a sync pass touches many rows of one table at once). */
const DEBOUNCE_MS = 400;

/** Synced tables whose changes drive a store refetch. */
const WATCHED_TABLES = [
  "synced_personas",
  "synced_executions",
  "synced_events",
  "synced_manual_reviews",
  "synced_devices",
] as const;

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
      return () => void usePersonaStore.getState().fetchPersonas();
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
    default:
      return null;
  }
}

export function useSyncedRealtime(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDemo = useAuthStore((s) => s.isDemo);
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
      for (const table of WATCHED_TABLES) {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            scheduleRefetch(table);
            // A new review is an event, not just a list change — surface it so
            // the voice announcer can react. The debounced refetch still runs.
            if (table === "synced_manual_reviews") {
              maybeAnnounceNewReview(payload, announcedReviews);
            }
          },
        );
      }
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
      Sentry.captureException(err, { tags: { scope: "useSyncedRealtime" } });
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
