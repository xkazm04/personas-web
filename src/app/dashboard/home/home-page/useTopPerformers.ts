"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import { MOCK_LEADERBOARD, type LeaderboardPersona } from "@/lib/mock-dashboard-data";

export interface TopPerformersData {
  leaderboard: LeaderboardPersona[];
  loading: boolean;
}

/**
 * Top-performers data source. Demo → the static MOCK_LEADERBOARD (unchanged).
 * Real/supabase mode → the synced composite-scored leaderboard (already sorted
 * by composite desc), or an empty array when nothing has synced yet.
 */
export function useTopPerformers(): TopPerformersData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [leaderboard, setLeaderboard] = useState<LeaderboardPersona[]>(
    useMock ? MOCK_LEADERBOARD : [],
  );
  const [loading, setLoading] = useState(!useMock);

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await getSyncedLeaderboard();
        if (cancelled) return;
        setLeaderboard(rows);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useTopPerformers" } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { leaderboard, loading };
}
