"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n/useTranslation";
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

// The ETA label is no longer baked in here: the raw next-run timestamp travels
// to the card, which formats it against a live clock (`useLiveClock`). Baking a
// string at fetch time froze the ETA for the lifetime of the page.
function mapTrigger(t: SyncedTrigger): UpcomingRoutine {
  return {
    id: t.id,
    persona: t.personaName,
    color: t.personaColor,
    trigger: normalizeTrigger(t.triggerType),
    nextRunAt: t.nextTriggerAt as string,
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
  // Localized fallback for errors that carry no message of their own. Held as a
  // plain string so the fetch effect only re-runs when the locale changes.
  const { t } = useTranslation();
  const loadFailed = t.dashboard.home.errors.routines;

  // Only the *fetched* half lives in state. The demo values are a pure function
  // of `useMock`, so they're derived during render below rather than copied
  // into state by the effect: mirroring store state into React state costs an
  // extra render pass before paint, and left one frame of the previous
  // account's routines on screen whenever `isDemo` flipped mid-session.
  const [fetchedRoutines, setFetchedRoutines] = useState<UpcomingRoutine[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Demo mode has nothing to fetch; the mock routines are derived below.
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const triggers = await getSyncedTriggers();
        if (cancelled) return;
        setFetchedRoutines(deriveRoutines(triggers));
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useUpcomingRoutines" } });
        setFetchError(err instanceof Error ? err.message : loadFailed);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey, loadFailed]);

  const routines = useMock ? MOCK_UPCOMING_ROUTINES : fetchedRoutines;
  const loading = useMock ? false : fetchLoading;
  const error = useMock ? null : fetchError;

  return { routines, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
