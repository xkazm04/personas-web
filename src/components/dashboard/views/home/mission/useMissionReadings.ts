"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

import { api } from "@/lib/api";
import {
  MOCK_CREDENTIAL_ROTATIONS,
  MOCK_HEALTH_DIGEST,
  MOCK_MEMORY_ACTIONS,
  MOCK_OPEN_INCIDENTS,
  MOCK_UNREAD_MESSAGES,
  MOCK_VAULT_CHANGES,
} from "@/lib/mock-dashboard-data";
import { detectCostAnomalies } from "@/lib/observabilitySeries";
import type { DailyMetric, HealthIssue } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useReviewStore } from "@/stores/reviewStore";
import { effectiveNextRunMs } from "../home-page/relativeLabels";
import { useUpcomingRoutines } from "../home-page/useUpcomingRoutines";
import { gradeOf, successPercent, type MissionReadings, type Reading } from "./readings";

/** z-score above which a day's cost counts as a spike (matches Observability). */
const COST_SPIKE_Z = 2;

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60_000,
} as const;

export type SourceKey = "observability" | "healing" | "reviews" | "routines";

export interface SourceState {
  key: SourceKey;
  status: "pending" | "ok" | "failed";
  error: string | null;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function fromSwr<T, V>(data: T | undefined, error: unknown, map: (data: T) => V): Reading<V> {
  if (error) return { status: "failed", error: errorText(error) };
  if (data === undefined) return { status: "pending" };
  return { status: "ready", value: map(data) };
}

function outcomesOf(daily: DailyMetric[]) {
  const runs = daily.reduce((sum, day) => sum + day.executions, 0);
  const completed = daily.reduce((sum, day) => sum + day.successes, 0);
  const failed = daily.reduce((sum, day) => sum + day.failures, 0);
  return {
    successRate: successPercent(completed, failed),
    runs,
    failed,
    trace: daily.map((day) => {
      const finished = day.successes + day.failures;
      return finished > 0 ? day.successes / finished : 0;
    }),
  };
}

function spendOf(daily: DailyMetric[]) {
  const total = daily.reduce((sum, day) => sum + day.cost, 0);
  return {
    total,
    perDay: daily.length > 0 ? total / daily.length : null,
    anomalies: detectCostAnomalies(daily, COST_SPIKE_Z).length,
    trace: daily.map((day) => day.cost),
  };
}

function recoveryOf(issues: HealthIssue[]) {
  const open = issues.filter((issue) => issue.status === "open");
  return {
    open: open.length,
    // The demo's issues flag a tripped circuit breaker; synced ones do not yet.
    paused: open.filter((issue) => "isCircuitBreaker" in issue && issue.isCircuitBreaker === true).length,
    autoFixed: issues.filter((issue) => issue.status === "auto_fixed").length,
  };
}

/**
 * Fills the eight Mission Control readings. Sources with a synced path
 * (observability, healing issues, reviews, routines) are read in both modes;
 * the rest are demo fixtures and read as "not measured" for a real tenant
 * rather than showing it numbers from somebody else's fleet.
 */
export function useMissionReadings(now: number): {
  readings: MissionReadings;
  sources: SourceState[];
  daily: DailyMetric[];
  issues: HealthIssue[];
} {
  const isDemo = useAuthStore((s) => s.isDemo);
  const pendingReviews = useReviewStore((s) => s.pendingReviewCount);
  const reviewsLoading = useReviewStore((s) => s.reviewsLoading);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  // `reviewsLoading` flips only once the fetch starts; latch the first paint.
  const [reviewsSettled, setReviewsSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchReviews().finally(() => {
      if (!cancelled) setReviewsSettled(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchReviews]);

  const dailyQuery = useSWR("observability:daily", api.getObservabilityDaily, SWR_OPTIONS);
  const issuesQuery = useSWR("observability:health-issues", api.getObservabilityHealthIssues, SWR_OPTIONS);
  const routines = useUpcomingRoutines();

  const reviewsReady = reviewsSettled && !reviewsLoading;
  const routinesReading: Reading<{ scheduled: number; nextAtMs: number | null }> = routines.error
    ? { status: "failed", error: routines.error }
    : routines.loading
      ? { status: "pending" }
      : {
          status: "ready",
          value: {
            scheduled: routines.routines.length,
            nextAtMs: routines.routines.reduce<number | null>((soonest, routine) => {
              const at = effectiveNextRunMs(routine.nextRunAt, routine.everyMinutes, now);
              if (!Number.isFinite(at)) return soonest;
              return soonest === null || at < soonest ? at : soonest;
            }, null),
          },
        };

  const demoQueueExtras = isDemo
    ? { alerts: MOCK_OPEN_INCIDENTS, memory: MOCK_MEMORY_ACTIONS.length, reports: MOCK_UNREAD_MESSAGES }
    : { alerts: 0, memory: 0, reports: 0 };

  const readings: MissionReadings = {
    outcomes: fromSwr(dailyQuery.data, dailyQuery.error, outcomesOf),
    agents: isDemo
      ? {
          status: "ready",
          value: (() => {
            const scores = MOCK_HEALTH_DIGEST.agents.map((agent) => agent.score).sort((a, b) => a - b);
            const grades = scores.map(gradeOf);
            return {
              score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
              critical: grades.filter((grade) => grade === "critical").length,
              degraded: grades.filter((grade) => grade === "degraded").length,
              healthy: grades.filter((grade) => grade === "healthy").length,
              trace: scores,
            };
          })(),
        }
      : { status: "unmeasured" },
    queue: reviewsReady
      ? {
          status: "ready",
          value: {
            reviews: pendingReviews,
            ...demoQueueExtras,
            total: pendingReviews + demoQueueExtras.alerts + demoQueueExtras.memory + demoQueueExtras.reports,
          },
        }
      : { status: "pending" },
    recovery: fromSwr(issuesQuery.data, issuesQuery.error, recoveryOf),
    spend: fromSwr(dailyQuery.data, dailyQuery.error, spendOf),
    autonomy: routinesReading,
    vault: isDemo
      ? {
          status: "ready",
          value: {
            overdue: MOCK_CREDENTIAL_ROTATIONS.filter((rotation) => rotation.overdue).length,
            anomalies: MOCK_CREDENTIAL_ROTATIONS.filter((rotation) => rotation.anomaly).length,
            events: MOCK_VAULT_CHANGES.length,
          },
        }
      : { status: "unmeasured" },
    instruments: { status: "pending" },
  };

  const sources: SourceState[] = [
    sourceOf("observability", dailyQuery.data !== undefined, dailyQuery.error),
    sourceOf("healing", issuesQuery.data !== undefined, issuesQuery.error),
    { key: "reviews", status: reviewsReady ? "ok" : "pending", error: null },
    sourceOf("routines", !routines.loading, routines.error),
  ];
  if (sources.every((source) => source.status !== "pending")) {
    readings.instruments = {
      status: "ready",
      value: { ok: sources.filter((source) => source.status === "ok").length, total: sources.length },
    };
  }

  return { readings, sources, daily: dailyQuery.data ?? [], issues: issuesQuery.data ?? [] };
}

function sourceOf(key: SourceKey, settled: boolean, error: unknown): SourceState {
  if (error) return { key, status: "failed", error: errorText(error) };
  return { key, status: settled ? "ok" : "pending", error: null };
}
