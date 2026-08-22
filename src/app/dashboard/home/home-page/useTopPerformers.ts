"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n/useTranslation";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import { MOCK_LEADERBOARD, type LeaderboardPersona } from "@/lib/mock-dashboard-data";

export interface TopPerformersData {
  leaderboard: LeaderboardPersona[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Top-performers data source. Demo → the static MOCK_LEADERBOARD (unchanged).
 * Real/supabase mode → the synced composite-scored leaderboard (already sorted
 * by composite desc), or an empty array when nothing has synced yet.
 */
export function useTopPerformers(): TopPerformersData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;
  // Localized fallback for errors that carry no message of their own. Held as a
  // plain string so the fetch effect only re-runs when the locale changes.
  const { t } = useTranslation();
  const loadFailed = t.dashboard.home.errors.topPerformers;

  // Only the *fetched* half lives in state. The demo values are a pure function
  // of `useMock`, so they're derived during render below rather than copied
  // into state by the effect: mirroring store state into React state costs an
  // extra render pass before paint, and left one frame of the previous
  // account's leaderboard on screen whenever `isDemo` flipped mid-session.
  const [fetchedLeaderboard, setFetchedLeaderboard] = useState<LeaderboardPersona[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Demo mode has nothing to fetch; the mock leaderboard is derived below.
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const rows = await getSyncedLeaderboard();
        if (cancelled) return;
        setFetchedLeaderboard(rows);
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useTopPerformers" } });
        setFetchError(err instanceof Error ? err.message : loadFailed);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey, loadFailed]);

  const leaderboard = useMock ? MOCK_LEADERBOARD : fetchedLeaderboard;
  const loading = useMock ? false : fetchLoading;
  const error = useMock ? null : fetchError;

  return { leaderboard, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
