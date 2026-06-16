"use client";

import useSWR from "swr";

import { getActivityMetrics } from "@/lib/mockApi";
import type { AthenaUsagePoint, ValueRollup } from "@/lib/mock-dashboard-data";

/**
 * Activity-metrics data for the observability Activity tab. Demo-only — sourced
 * from the standalone mock fetcher, with SWR providing a brief loading state.
 */
export function useActivityMetrics(): {
  athenaUsage: AthenaUsagePoint[];
  valueRollup: ValueRollup | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} {
  const { data, isLoading, error, mutate } = useSWR("activity-metrics", getActivityMetrics, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    athenaUsage: data?.athenaUsage ?? [],
    valueRollup: data?.valueRollup ?? null,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    retry: () => void mutate(),
  };
}
