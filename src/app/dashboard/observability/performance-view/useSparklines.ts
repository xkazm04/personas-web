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
export function useSparklines(): Sparklines {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [sparklines, setSparklines] = useState<Sparklines>(
    useMock ? MOCK_SPARKLINES : EMPTY_SPARKLINES,
  );

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
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
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useSparklines" } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return sparklines;
}
