"use client";

import { useDemoOnlySWR } from "@/hooks/useDemoOnlySWR";
import { getSystemHealth } from "@/lib/mockApi";
import type { HealthCheckSection } from "@/lib/mock-dashboard-data";

/**
 * System-health snapshot for the System Health Panel. Demo-only — sourced from
 * the standalone mock fetcher, with SWR providing a brief loading state. Host
 * checks have no synced source, so a real (non-demo) session fetches nothing
 * and gets `liveUnavailable` (see useDemoOnlySWR).
 */
export function useSystemHealth(): {
  sections: HealthCheckSection[];
  diskUsage: { usedGb: number; totalGb: number };
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  liveUnavailable: boolean;
} {
  const { data, ...rest } = useDemoOnlySWR("system-health", getSystemHealth);
  return {
    sections: data?.sections ?? [],
    diskUsage: data?.diskUsage ?? { usedGb: 0, totalGb: 0 },
    ...rest,
  };
}
