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

  const [leaderboard, setLeaderboard] = useState<LeaderboardPersona[]>(
    useMock ? MOCK_LEADERBOARD : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (useMock) {
      setLeaderboard(MOCK_LEADERBOARD);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await getSyncedLeaderboard();
        if (cancelled) return;
        setLeaderboard(rows);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useTopPerformers" } });
        setError(err instanceof Error ? err.message : loadFailed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey, loadFailed]);

  return { leaderboard, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
