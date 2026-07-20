"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import {
  SPARKLINE_AGENTS,
  SPARKLINE_COST,
  SPARKLINE_EXECUTIONS,
  SPARKLINE_SUCCESS,
} from "@/lib/mock-dashboard-data";

export interface Sparklines {
  cost: number[];
  executions: number[];
  success: number[];
  /** Active-agents-over-time has no synced source — kept empty (flat line). */
  agents: number[];
}

export interface SparklinesResult {
  data: Sparklines;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const MOCK_SPARKLINES: Sparklines = {
  cost: SPARKLINE_COST,
  executions: SPARKLINE_EXECUTIONS,
  success: SPARKLINE_SUCCESS,
  agents: SPARKLINE_AGENTS,
};

const EMPTY_SPARKLINES: Sparklines = {
  cost: [],
  executions: [],
  success: [],
  agents: [],
};

/**
 * Metric-card sparkline series. Demo → the static seeded SPARKLINE_* fixtures
 * (unchanged). Real/supabase mode → daily series derived from the synced
 * observability rollup: cost, executions, and per-day success rate (%). The
 * "agents over time" sparkline has no synced source, so it stays empty and the
 * card renders a flat line rather than a fabricated trend.
 */
export function useSparklines(): SparklinesResult {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [sparklines, setSparklines] = useState<Sparklines>(
    useMock ? MOCK_SPARKLINES : EMPTY_SPARKLINES,
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const daily = await api.getObservabilityDaily();
        if (cancelled) return;
        setSparklines({
          cost: daily.map((d) => d.cost),
          executions: daily.map((d) => d.executions),
          success: daily.map((d) =>
            d.executions > 0 ? (d.successes / d.executions) * 100 : 0,
          ),
          agents: [],
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useSparklines" } });
        setError(
          err instanceof Error ? err.message : "Failed to load sparkline data",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  return {
    data: sparklines,
    loading,
    error,
    retry: () => setReloadKey((k) => k + 1),
  };
}
