"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { MOCK_LATENCY_DATA, type LatencyPoint } from "@/lib/mock-dashboard-data";

/** Linear-interpolated percentile of a numeric sample (sorted ascending). */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const frac = rank - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

/** "MM-DD" key matching the mock's date axis, in local time. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Group completed executions by calendar day and compute p50/p95/p99 of their
 * durations — the exact LatencyPoint shape LatencyChart consumes. Days with no
 * completed runs simply don't appear (the chart plots whatever days exist).
 */
function deriveLatency(
  executions: { status: string; durationMs: number | null; createdAt: string }[],
): LatencyPoint[] {
  const byDay = new Map<string, number[]>();
  for (const e of executions) {
    if (e.status !== "completed") continue;
    if (e.durationMs == null || !Number.isFinite(e.durationMs)) continue;
    const key = dayKey(e.createdAt);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(e.durationMs);
    else byDay.set(key, [e.durationMs]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      return {
        date,
        p50: Math.round(percentile(sorted, 50)),
        p95: Math.round(percentile(sorted, 95)),
        p99: Math.round(percentile(sorted, 99)),
      };
    });
}

export interface LatencyData {
  points: LatencyPoint[];
  loading: boolean;
}

/**
 * Latency-percentile data source. Demo → the static MOCK_LATENCY_DATA
 * (unchanged). Real/supabase mode → per-day p50/p95/p99 derived from completed
 * executions' durations. Empty array when nothing has completed.
 */
export function useLatencyData(): LatencyData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [points, setPoints] = useState<LatencyPoint[]>(
    useMock ? MOCK_LATENCY_DATA : [],
  );
  const [loading, setLoading] = useState(!useMock);

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const executions = await api.listExecutions({ limit: 2000 });
        if (cancelled) return;
        setPoints(deriveLatency(executions));
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useLatencyData" } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { points, loading };
}
