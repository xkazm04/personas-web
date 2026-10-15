"use client";

import { useEffect, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n/useTranslation";
import { getDemoLeaderboard } from "@/lib/mockApi";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

const EMPTY: LeaderboardPersona[] = [];

export interface TopPerformersData {
  leaderboard: LeaderboardPersona[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Top-performers data source. Demo → the demo world's leaderboard
 * (`standings()` over its snapshots, the whole demo fleet). Real/supabase mode
 * → the synced composite-scored leaderboard (already sorted by composite
 * desc), or an empty array when nothing has synced yet.
 */
export function useTopPerformers(): TopPerformersData {
  const isDemo = useAuthStore((s) => s.isDemo);
  // Localized fallback for errors that carry no message of their own. Held as a
  // plain string so the fetch effect only re-runs when the locale changes.
  const { t } = useTranslation();
  const loadFailed = t.dashboard.home.errors.topPerformers;

  // Rows are held with the mode that fetched them, so a mid-session flip of
  // `isDemo` never shows the previous account's leaderboard as this one's.
  const [fetched, setFetched] = useState<{ demo: boolean; rows: LeaderboardPersona[] } | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const rows = await (isDemo ? getDemoLeaderboard() : getSyncedLeaderboard());
        if (cancelled) return;
        setFetched({ demo: isDemo, rows });
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        captureExceptionScrubbed(err, { tags: { scope: "useTopPerformers" } });
        setFetchError(err instanceof Error ? err.message : loadFailed);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemo, reloadKey, loadFailed]);

  const current = fetched !== null && fetched.demo === isDemo ? fetched.rows : null;
  const leaderboard = current ?? EMPTY;
  // Real mode reads as it always has (the fetch in flight); the demo is loading until its first rows land.
  const loading = isDemo ? current === null && !fetchError : fetchLoading;
  const error = fetchError;

  return { leaderboard, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
