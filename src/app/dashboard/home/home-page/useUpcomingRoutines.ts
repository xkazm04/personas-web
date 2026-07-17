"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { getSyncedTriggers, type SyncedTrigger } from "@/lib/supabaseApi";
import {
  MOCK_UPCOMING_ROUTINES,
  type RoutineTrigger,
  type UpcomingRoutine,
} from "@/lib/mock-dashboard-data";

// Trigger types that represent a *scheduled* future run we can surface an ETA
// for. Webhook/event triggers fire reactively (no nextTriggerAt) so they're
// excluded from "upcoming routines".
const SCHEDULE_TRIGGER_TYPES = new Set(["schedule", "cron", "polling"]);

/** Coerce a desktop trigger_type token into the card's display union. */
function normalizeTrigger(raw: string): RoutineTrigger {
  if (raw === "polling") return "polling";
  if (raw === "webhook") return "webhook";
  if (raw === "event") return "event";
  // schedule, cron, and anything else schedule-ish render as "schedule".
  return "schedule";
}

/** Compact ETA label (e.g. "6m", "1h", "1d") from now → the next run time. */
function etaLabel(nextTriggerAt: string): string {
  const deltaMs = new Date(nextTriggerAt).getTime() - Date.now();
  const mins = Math.max(0, Math.round(deltaMs / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function mapTrigger(t: SyncedTrigger): UpcomingRoutine {
  return {
    id: t.id,
    persona: t.personaName,
    color: t.personaColor,
    trigger: normalizeTrigger(t.triggerType),
    eta: t.nextTriggerAt ? etaLabel(t.nextTriggerAt) : "",
  };
}

/**
 * Keep only enabled, schedule-ish triggers with a concrete next-run time, then
 * sort by soonest. The card renders the resulting list directly.
 */
function deriveRoutines(triggers: SyncedTrigger[]): UpcomingRoutine[] {
  return triggers
    .filter(
      (t) =>
        t.enabled &&
        t.nextTriggerAt != null &&
        SCHEDULE_TRIGGER_TYPES.has(t.triggerType),
    )
    .sort(
      (a, b) =>
        new Date(a.nextTriggerAt as string).getTime() -
        new Date(b.nextTriggerAt as string).getTime(),
    )
    .map(mapTrigger);
}

export interface UpcomingRoutinesData {
  routines: UpcomingRoutine[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Upcoming-routines data source. Demo → the static MOCK_UPCOMING_ROUTINES
 * (unchanged). Real/supabase mode → enabled scheduled triggers with a known
 * next-run time, soonest first. Empty array when nothing is scheduled.
 */
export function useUpcomingRoutines(): UpcomingRoutinesData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [routines, setRoutines] = useState<UpcomingRoutine[]>(
    useMock ? MOCK_UPCOMING_ROUTINES : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (useMock) {
      setRoutines(MOCK_UPCOMING_ROUTINES);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const triggers = await getSyncedTriggers();
        if (cancelled) return;
        setRoutines(deriveRoutines(triggers));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useUpcomingRoutines" } });
        setError(err instanceof Error ? err.message : "Failed to load routines");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  return { routines, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
