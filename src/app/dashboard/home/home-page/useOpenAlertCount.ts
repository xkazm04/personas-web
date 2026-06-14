"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { api } from "@/lib/api";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";

/**
 * Open-alert count. Demo → the mock health-issue fixture count (unchanged).
 * Real/supabase mode → the count of synced healing issues with status "open".
 * Defaults to 0 while the real fetch is in flight. Shared by the home
 * Mission-Control cockpit (Vitals Console, Triage, Status Ticker).
 */
export function useOpenAlertCount(): number {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [count, setCount] = useState(() =>
    useMock ? MOCK_HEALTH_ISSUES.filter((issue) => issue.status === "open").length : 0,
  );

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      try {
        const issues = await api.getObservabilityHealthIssues();
        if (cancelled) return;
        setCount(issues.filter((issue) => issue.status === "open").length);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useOpenAlertCount" } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return count;
}
