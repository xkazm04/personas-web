"use client";

import useSWR from "swr";

import { useAuthStore } from "@/stores/authStore";

/**
 * The SWR key for a demo-only source: kept in demo mode, `null` otherwise (SWR
 * skips a null key, so the fetcher never runs).
 */
export function demoOnlyKey<K extends string>(key: K, isDemo: boolean): K | null {
  return isDemo ? key : null;
}

/**
 * SWR over a standalone mock fetcher that has no synced/real counterpart
 * (System Health, Incidents, Director). The fetch runs only in a demo session;
 * for a signed-in real tenant it is skipped and `liveUnavailable` is true, so
 * the page shows an honest empty state instead of presenting the fixture as the
 * tenant's own data. The fixture is static, so revalidation is off.
 */
export function useDemoOnlySWR<T>(
  key: string,
  fetcher: () => Promise<T>,
): {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  liveUnavailable: boolean;
} {
  const isDemo = useAuthStore((s) => s.isDemo);
  const { data, isLoading, error, mutate } = useSWR(demoOnlyKey(key, isDemo), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    retry: () => void mutate(),
    liveUnavailable: !isDemo,
  };
}
