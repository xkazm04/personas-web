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
} {
  const { data, isLoading } = useSWR("activity-metrics", getActivityMetrics, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    athenaUsage: data?.athenaUsage ?? [],
    valueRollup: data?.valueRollup ?? null,
    isLoading,
  };
}
