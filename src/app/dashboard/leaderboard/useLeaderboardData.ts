"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import {
  MOCK_LEADERBOARD,
  type LeaderboardPersona,
} from "@/lib/mock-dashboard-data";

export interface LeaderboardData {
  personas: LeaderboardPersona[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Leaderboard data source. Dev/demo → the static mock (unchanged). Real/supabase
 * mode → the `synced_leaderboard` aggregate, normalized into composite + radar
 * axes by getSyncedLeaderboard.
 */
export function useLeaderboardData(): LeaderboardData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  // isDemo is a live store subscription that can flip mid-session (sign out
  // into demo, expiry), so a real→demo switch must replace the previous
  // account's leaderboard rather than leave it on screen. That's done by
  // DERIVING the demo values during render — only the fetched half is state.
  // Re-seeding from the effect instead cost an extra render pass before paint
  // and still showed one frame of the previous account's rows.
  const [fetchedPersonas, setFetchedPersonas] = useState<LeaderboardPersona[]>([]);
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
        const data = await getSyncedLeaderboard();
        if (cancelled) return;
        setFetchedPersonas(data);
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useLeaderboardData" } });
        setFetchError(
          err instanceof Error ? err.message : "Failed to load leaderboard",
        );
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  const personas = useMock ? MOCK_LEADERBOARD : fetchedPersonas;
  const loading = useMock ? false : fetchLoading;
  const error = useMock ? null : fetchError;

  return { personas, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
