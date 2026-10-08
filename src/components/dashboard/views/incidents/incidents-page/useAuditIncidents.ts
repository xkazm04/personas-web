"use client";

import { useDemoOnlySWR } from "@/hooks/useDemoOnlySWR";
import { getAuditIncidents } from "@/lib/mockApi";
import type { AuditIncident } from "@/lib/mock-dashboard-data";

/**
 * Audit incidents for the Incidents Inbox. Demo-only — sourced directly from
 * the standalone mock fetcher (incidents have no synced source), with SWR
 * giving a brief loading state. A real (non-demo) session fetches nothing and
 * gets `liveUnavailable` (see useDemoOnlySWR).
 */
export function useAuditIncidents(): {
  incidents: AuditIncident[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  liveUnavailable: boolean;
} {
  const { data, ...rest } = useDemoOnlySWR("audit-incidents", getAuditIncidents);
  return { incidents: data ?? [], ...rest };
}
