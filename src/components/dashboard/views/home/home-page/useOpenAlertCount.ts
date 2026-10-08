"use client";

import { useEffect, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { api } from "@/lib/api";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { isNotServed, openAlertValue } from "../mission/readings";

/**
 * Open-alert count. Demo → the mock health-issue fixture count (unchanged).
 * Real/supabase mode → the count of synced healing issues with status "open".
 * `null` means unknown: the first real read is in flight, or it failed (the
 * desktop plane answers 501 not_on_desktop, which is expected and not reported).
 * Shared by the home Mission-Control cockpit (Status Ticker).
 */
export function useOpenAlertCount(): number | null {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [count, setCount] = useState<number | null>(() =>
    useMock ? MOCK_HEALTH_ISSUES.filter((issue) => issue.status === "open").length : null,
  );

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      try {
        const issues = await api.getObservabilityHealthIssues();
        if (cancelled) return;
        setCount(openAlertValue(issues, false));
      } catch (err) {
        if (cancelled) return;
        if (!isNotServed(err)) captureExceptionScrubbed(err, { tags: { scope: "useOpenAlertCount" } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return count;
}
