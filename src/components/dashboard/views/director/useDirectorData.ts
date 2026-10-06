"use client";

import { useDemoOnlySWR } from "@/hooks/useDemoOnlySWR";
import { getDirectorSnapshot } from "@/lib/mockApi";
import type { DirectorPortfolio, DirectorVerdict } from "@/lib/mock-dashboard-data";

/**
 * Director coaching data for /dashboard/director. Demo-only — sourced from the
 * standalone mock fetcher, with SWR providing a brief loading state. Director
 * verdicts have no synced source, so a real (non-demo) session fetches nothing
 * and gets `liveUnavailable` (see useDemoOnlySWR).
 */
export function useDirectorData(): {
  portfolio: DirectorPortfolio | null;
  verdicts: DirectorVerdict[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  liveUnavailable: boolean;
} {
  const { data, ...rest } = useDemoOnlySWR("director-snapshot", getDirectorSnapshot);
  return {
    portfolio: data?.portfolio ?? null,
    verdicts: data?.verdicts ?? [],
    ...rest,
  };
}
