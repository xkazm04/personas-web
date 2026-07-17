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

  const [personas, setPersonas] = useState<LeaderboardPersona[]>(
    useMock ? MOCK_LEADERBOARD : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // isDemo is a live store subscription that can flip mid-session (sign out
    // into demo, expiry). Re-seed the mock explicitly rather than early-return,
    // so a real→demo switch replaces the previous account's leaderboard instead
    // of leaving it on screen.
    if (useMock) {
      setPersonas(MOCK_LEADERBOARD);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getSyncedLeaderboard();
        if (cancelled) return;
        setPersonas(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useLeaderboardData" } });
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  return { personas, loading, error, retry: () => setReloadKey((k) => k + 1) };
}
