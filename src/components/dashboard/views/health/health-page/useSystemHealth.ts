"use client";

import useSWR from "swr";

import { getSystemHealth } from "@/lib/mockApi";
import type { HealthCheckSection } from "@/lib/mock-dashboard-data";

/**
 * System-health snapshot for the System Health Panel. Demo-only — sourced from
 * the standalone mock fetcher, with SWR providing a brief loading state.
 */
export function useSystemHealth(): {
  sections: HealthCheckSection[];
  diskUsage: { usedGb: number; totalGb: number };
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} {
  const { data, isLoading, error, mutate } = useSWR("system-health", getSystemHealth, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    sections: data?.sections ?? [],
    diskUsage: data?.diskUsage ?? { usedGb: 0, totalGb: 0 },
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    retry: () => void mutate(),
  };
}
