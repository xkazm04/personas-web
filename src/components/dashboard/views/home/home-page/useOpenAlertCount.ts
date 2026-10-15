"use client";

import { useEffect, useMemo, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { api } from "@/lib/api";
import { useDemoThreads } from "@/hooks/useDemoThreads";
import { useAuthStore } from "@/stores/authStore";
import { countOpenAlertsForPolicy, useSettingsStore } from "@/stores/settingsStore";
import { isNotServed } from "../mission/readings";

type AlertIssue = { status: string; severity: string };

/**
 * Open-alert count. Demo → the session projection of the health-issue fixture
 * (a fixed incident cause resolves its issue).
 * Real/supabase mode → the count of synced healing issues with status "open".
 * `null` means unknown: the first real read is in flight, or it failed (the
 * desktop plane answers 501 not_on_desktop, which is expected and not reported).
 * Only severities switched on in Settings (`settingsStore.alertSeverity`) count.
 * Shared by the home Mission-Control cockpit (Status Ticker).
 */
export function useOpenAlertCount(): number | null {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const policy = useSettingsStore((s) => s.alertSeverity);
  const demoIssues = useDemoThreads().healthIssues;
  const [fetched, setIssues] = useState<AlertIssue[] | null>(null);
  const issues = useMock ? demoIssues : fetched;

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      try {
        const issues = await api.getObservabilityHealthIssues();
        if (cancelled) return;
        setIssues(issues);
      } catch (err) {
        if (cancelled) return;
        if (!isNotServed(err)) captureExceptionScrubbed(err, { tags: { scope: "useOpenAlertCount" } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return useMemo(() => (issues === null ? null : countOpenAlertsForPolicy(issues, policy)), [issues, policy]);
}
