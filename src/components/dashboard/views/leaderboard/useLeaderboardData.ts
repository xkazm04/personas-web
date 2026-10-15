"use client";

import { useEffect, useMemo, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { scopeLeaderboard } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useAuthStore } from "@/stores/authStore";
import { getDemoLeaderboard } from "@/lib/mockApi";
import { getSyncedLeaderboard } from "@/lib/supabaseApi";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

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
 * Leaderboard data source. Demo → `standings()` over the demo world's daily
 * snapshots (getDemoLeaderboard: the whole demo fleet, ranked by the engine
 * the Supabase plane uses). Real/supabase mode → the `synced_leaderboard`
 * aggregate, normalized into composite + radar axes by getSyncedLeaderboard.
 * Either way the rows shown follow the scope bar's persona; the field they
 * rank in stays whole.
 */
export function useLeaderboardData(): LeaderboardData {
  const isDemo = useAuthStore((s) => s.isDemo);

  // isDemo is a live store subscription that can flip mid-session (sign out
  // into demo, expiry), so the rows are held with the mode that fetched them:
  // after a switch, the previous mode's rows read as not loaded, never as
  // this account's leaderboard.
  const [fetched, setFetched] = useState<{ demo: boolean; rows: LeaderboardPersona[] } | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const data = await (isDemo ? getDemoLeaderboard() : getSyncedLeaderboard());
        if (cancelled) return;
        setFetched({ demo: isDemo, rows: data });
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
  }, [isDemo, reloadKey]);

  const current = fetched !== null && fetched.demo === isDemo ? fetched.rows : null;
  const ranked = useMemo(() => current ?? [], [current]);
  const scope = useDashboardScope();
  const personas = useMemo(() => scopeLeaderboard(ranked, scope), [ranked, scope]);
  // Real mode reads as it always has (the fetch in flight); the demo is loading until its first rows land.
  const loading = isDemo ? current === null && !fetchError : fetchLoading;
  const error = fetchError;

  return {
    personas,
    ranked,
    scopeEmpty: scopeHidAll(ranked, personas),
    loading,
    error,
    retry: () => setReloadKey((k) => k + 1),
  };
}
