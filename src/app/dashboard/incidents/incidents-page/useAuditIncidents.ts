"use client";

import useSWR from "swr";

import { getAuditIncidents } from "@/lib/mockApi";
import type { AuditIncident } from "@/lib/mock-dashboard-data";

/**
 * Audit incidents for the Incidents Inbox. Demo-only — sourced directly from
 * the standalone mock fetcher (incidents have no synced source), with SWR
 * giving a brief loading state. Revalidation is off; the fixture is static.
 */
export function useAuditIncidents(): {
  incidents: AuditIncident[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} {
  const { data, isLoading, error, mutate } = useSWR("audit-incidents", getAuditIncidents, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60_000,
  });
  return {
    incidents: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    retry: () => void mutate(),
  };
}
