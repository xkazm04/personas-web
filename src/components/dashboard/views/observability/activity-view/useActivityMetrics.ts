"use client";

import { useDemoOnlySWR } from "@/hooks/useDemoOnlySWR";
import { getActivityMetrics } from "@/lib/mockApi";
import type {
  AthenaActionCost,
  AthenaLedgerTotals,
  AthenaUsagePoint,
  ValueRollup,
} from "@/lib/mock-dashboard-data";

/**
 * Activity-metrics data for the observability Activity tab. Demo-only — sourced
 * from the standalone mock fetcher, with SWR providing a brief loading state.
 * Athena cost and value outcomes have no synced source, so a real (non-demo)
 * session fetches nothing and gets `liveUnavailable` (see useDemoOnlySWR).
 */
export function useActivityMetrics(): {
  athenaUsage: AthenaUsagePoint[];
  valueRollup: ValueRollup | null;
  athenaActionMix: AthenaActionCost[];
  athenaLedger: AthenaLedgerTotals | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  liveUnavailable: boolean;
} {
  const { data, ...rest } = useDemoOnlySWR("activity-metrics", getActivityMetrics);
  return {
    athenaUsage: data?.athenaUsage ?? [],
    valueRollup: data?.valueRollup ?? null,
    athenaActionMix: data?.athenaActionMix ?? [],
    athenaLedger: data?.athenaLedger ?? null,
    ...rest,
  };
}
