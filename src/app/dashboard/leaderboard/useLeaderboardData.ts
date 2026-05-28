"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { DEVELOPMENT } from "@/lib/dev";
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
}

/**
 * Leaderboard data source. Dev/demo → the static mock (unchanged). Real/supabase
 * mode → the `synced_leaderboard` aggregate, normalized into composite + radar
 * axes by getSyncedLeaderboard.
 */
export function useLeaderboardData(): LeaderboardData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = DEVELOPMENT || isDemo;

  const [personas, setPersonas] = useState<LeaderboardPersona[]>(
    useMock ? MOCK_LEADERBOARD : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock/demo mode is decided once per session; the useState initializers
    // above already seed the mock fixture, so the effect only drives the
    // async real-data fetch.
    if (useMock) return;

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
  }, [useMock]);

  return { personas, loading, error };
}
