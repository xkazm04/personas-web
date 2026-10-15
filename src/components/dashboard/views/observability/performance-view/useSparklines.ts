"use client";

import { useEffect, useState } from "react";
import { isNotServed } from "@/components/dashboard/views/home/mission/readings";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { getObservabilityWorld } from "@/lib/mockApi";
import { sparklinesFromDaily } from "@/lib/observabilitySeries";

export interface Sparklines {
  cost: number[];
  executions: number[];
  success: number[];
  /** Agents that ran each day: the demo world counts them; no synced source, so real mode keeps it empty (flat line). */
  agents: number[];
}

export interface SparklinesResult {
  data: Sparklines;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const EMPTY_SPARKLINES: Sparklines = {
  cost: [],
  executions: [],
  success: [],
  agents: [],
};

/**
 * Metric-card sparkline series: cost, executions and per-day success rate (%),
 * projected by `sparklinesFromDaily` from the same daily series the tiles total
 * — the demo world's window in demo, the synced observability rollup in real
 * mode. The "agents over time" sparkline counts the demo world's agents that
 * ran each day; it has no synced source, so real mode stays empty and the card
 * renders a flat line rather than a fabricated trend.
 */
export function useSparklines(): SparklinesResult {
  const isDemo = useAuthStore((s) => s.isDemo);

  const [sparklines, setSparklines] = useState<Sparklines>(EMPTY_SPARKLINES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [daily, world] = await Promise.all([
          api.getObservabilityDaily(),
          isDemo ? getObservabilityWorld() : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setSparklines({ ...sparklinesFromDaily(daily), agents: world?.activeAgents ?? [] });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        // A 501 means the plane does not serve this read; it is not an error to report.
        if (!isNotServed(err)) captureExceptionScrubbed(err, { tags: { scope: "useSparklines" } });
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
  }, [isDemo, reloadKey]);

  return {
    data: sparklines,
    loading,
    error,
    retry: () => setReloadKey((k) => k + 1),
  };
}
