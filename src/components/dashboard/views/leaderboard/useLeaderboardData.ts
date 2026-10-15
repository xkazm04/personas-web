"use client";

import { useEffect, useMemo, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { scopeLeaderboard } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useAuthStore } from "@/stores/authStore";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import {
  MOCK_LEADERBOARD,
  type LeaderboardPersona,
} from "@/lib/mock-dashboard-data";

export interface LeaderboardData {
  /** The rows in the scope bar's persona (scores have no time, so the window does not apply). */
  personas: LeaderboardPersona[];
  /** The whole ranked field: ranks, the podium and the benchmark are counted here. */
  ranked: LeaderboardPersona[];
  /** The scope emptied a field that has rows. */
  scopeEmpty: boolean;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Leaderboard data source. Dev/demo → the static mock (unchanged). Real/supabase
 * mode → the `synced_leaderboard` aggregate, normalized into composite + radar
 * axes by getSyncedLeaderboard. Either way the rows shown follow the scope
 * bar's persona; the field they rank in stays whole.
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
        captureExceptionScrubbed(err, { tags: { scope: "useLeaderboardData" } });
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

  const ranked = useMock ? MOCK_LEADERBOARD : fetchedPersonas;
  const scope = useDashboardScope();
  const personas = useMemo(() => scopeLeaderboard(ranked, scope), [ranked, scope]);
  const loading = useMock ? false : fetchLoading;
  const error = useMock ? null : fetchError;

  return {
    personas,
    ranked,
    scopeEmpty: scopeHidAll(ranked, personas),
    loading,
    error,
    retry: () => setReloadKey((k) => k + 1),
  };
}
