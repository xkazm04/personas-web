"use client";

import { useEffect, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { SPARKLINE_AGENTS } from "@/lib/mock-dashboard-data";
import { MOCK_DAILY_METRICS } from "@/lib/mockData";
import { sparklinesFromDaily } from "@/lib/observabilitySeries";

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
  ...sparklinesFromDaily(MOCK_DAILY_METRICS),
  agents: SPARKLINE_AGENTS,
};

const EMPTY_SPARKLINES: Sparklines = {
  cost: [],
  executions: [],
  success: [],
  agents: [],
};

/**
 * Metric-card sparkline series: cost, executions and per-day success rate (%),
 * projected by `sparklinesFromDaily` from the same daily series the tiles total
 * — MOCK_DAILY_METRICS in demo, the synced observability rollup in real mode.
 * The "agents over time" sparkline has no synced source: demo keeps its seeded
 * fixture, real mode stays empty and the card renders a flat line rather than
 * a fabricated trend.
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
        setSparklines({ ...sparklinesFromDaily(daily), agents: [] });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        captureExceptionScrubbed(err, { tags: { scope: "useSparklines" } });
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
