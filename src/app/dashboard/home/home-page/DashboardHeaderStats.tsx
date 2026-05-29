"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Bot, ClipboardCheck, TrendingUp, Zap } from "lucide-react";

import StatBadge from "@/components/dashboard/StatBadge";
import { useTranslation } from "@/i18n/useTranslation";
import { api } from "@/lib/api";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";

/**
 * Open-alert count. Demo → the mock health-issue fixture count (unchanged).
 * Real/supabase mode → the count of synced healing issues with status "open".
 * Defaults to 0 while the real fetch is in flight.
 */
function useOpenAlertCount(): number {
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

/**
 * Compact fleet-vitals badges shown on the right of the dashboard header —
 * success rate, runs, agents, open alerts, and pending reviews. Replaces the
 * larger Fleet vitals console with a space-efficient header strip. `alerts`
 * (open health issues) is derived here; the rest come from the page.
 */
export function DashboardHeaderStats({
  successRate,
  runs,
  agents,
  reviews,
}: {
  successRate: number;
  runs: number;
  agents: number;
  reviews: number;
}) {
  const { t } = useTranslation();
  const openAlerts = useOpenAlertCount();

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      <StatBadge
        icon={TrendingUp}
        label={t.dashboard.successRate}
        value={`${successRate}%`}
        accent="emerald"
        href="/dashboard/observability"
      />
      <StatBadge
        icon={Zap}
        label={t.dashboard.home.vitals.runs}
        value={runs}
        accent="cyan"
        href="/dashboard/executions"
        pulseOnIncrease
      />
      <StatBadge
        icon={Bot}
        label={t.dashboard.agents}
        value={agents}
        accent="purple"
        href="/dashboard/agents"
      />
      <StatBadge
        icon={AlertTriangle}
        label={t.dashboard.home.vitals.alerts}
        value={openAlerts}
        accent={openAlerts > 0 ? "rose" : "emerald"}
        href="/dashboard/observability"
      />
      <StatBadge
        icon={ClipboardCheck}
        label={t.dashboard.reviews}
        value={reviews}
        accent="amber"
        href="/dashboard/reviews"
        pulseOnIncrease
      />
    </div>
  );
}
