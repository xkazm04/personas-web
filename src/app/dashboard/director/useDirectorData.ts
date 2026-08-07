"use client";

import useSWR from "swr";

import { getDirectorSnapshot } from "@/lib/mockApi";
import type { DirectorPortfolio, DirectorVerdict } from "@/lib/mock-dashboard-data";

/**
 * Director coaching data for /dashboard/director. Demo-only — sourced from the
 * standalone mock fetcher, with SWR providing a brief loading state.
 */
export function useDirectorData(): {
  portfolio: DirectorPortfolio | null;
  verdicts: DirectorVerdict[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} {
  const { data, isLoading, error, mutate } = useSWR("director-snapshot", getDirectorSnapshot, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    portfolio: data?.portfolio ?? null,
    verdicts: data?.verdicts ?? [],
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    retry: () => void mutate(),
  };
}
