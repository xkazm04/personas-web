"use client";

import { Radio, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { mutate } from "swr";
import { useReducedMotion } from "framer-motion";
import StatusBadge from "@/components/dashboard/StatusBadge";
import type { Persona } from "@/lib/types";
import { relativeTime, formatDuration } from "@/lib/format";
import { dashboardKeys, loadAgentDetail, useAgentDetail } from "@/lib/dashboard-queries";
import { useTranslation } from "@/i18n/useTranslation";

// Mirror the real executions list (api.listExecutions fetches up to 5 rows)
// so the loading placeholder occupies the same vertical space the data will.
const SKELETON_ROWS = [0, 1, 2, 3] as const;

export async function prefetchAgentDetail(personaId: string): Promise<boolean> {
  try {
    const data = await loadAgentDetail(personaId);
    // Seed SWR's cache so the next useAgentDetail(personaId) renders the
    // fetched data instantly instead of firing another round-trip.
    await mutate(dashboardKeys.agentDetail(personaId), data, {
      revalidate: false,
    });
    return true;
  } catch {
    // Best effort prefetch — caller decides whether to retry.
    return false;
  }
}

export default function AgentDetail({ persona }: { persona: Persona }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const { data, error, mutate: revalidate, isValidating } = useAgentDetail(persona.id);

  if (error) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-glass pt-4">
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {t.dashboardUi.failedAgentDetails}
        </p>
        <button
          type="button"
          onClick={() => revalidate()}
          disabled={isValidating}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-sm text-foreground outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-brand-cyan/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw
            className={`h-3 w-3 ${isValidating && !reducedMotion ? "animate-spin" : ""}`}
          />
          {t.dashboardUi.retryAgentDetails}
        </button>
      </div>
    );
  }

  if (!data) {
    const pulse = reducedMotion ? "" : "animate-pulse";
    return (
      <div
        className="mt-4 space-y-3 border-t border-glass pt-4"
        aria-busy="true"
        aria-live="polite"
        aria-label={t.dashboardUi.recentExecutions}
      >
        {/* "Recent Executions" heading */}
        <div className={`h-3 w-28 rounded bg-white/[0.06] ${pulse}`} />

        {/* Execution rows — mirror the status-badge list so data settles in place */}
        <div className="mt-1.5 space-y-1">
          {SKELETON_ROWS.map((i) => (
            <div key={i} className="flex items-center gap-2">
              {/* status badge pill */}
              <div
                className={`h-6 w-20 rounded-full bg-white/[0.05] ${pulse}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
              {/* execution id */}
              <div
                className={`h-3 w-16 rounded bg-white/[0.03] ${pulse}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
              <div className="flex-1" />
              {/* duration */}
              <div
                className={`h-3 w-10 rounded bg-white/[0.03] ${pulse}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
              {/* relative time */}
              <div
                className={`h-3 w-14 rounded bg-white/[0.03] ${pulse}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            </div>
          ))}
        </div>

        {/* Subscriptions & triggers counts row */}
        <div className="flex gap-4">
          <div className={`h-3 w-24 rounded bg-white/[0.03] ${pulse}`} />
          <div className={`h-3 w-20 rounded bg-white/[0.03] ${pulse}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t border-glass pt-4">
      {/* Recent executions */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {t.dashboardUi.recentExecutions}
        </h4>
        {data.executions.length === 0 ? (
          <p className="mt-1 text-sm text-muted-dark">{t.dashboardUi.noExecutionsYet}</p>
        ) : (
          <div className="mt-1.5 space-y-1">
            {data.executions.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <StatusBadge status={exec.status} />
                <span className="flex-1 truncate font-mono text-sm text-muted-dark">
                  {exec.id.slice(0, 8)}
                </span>
                {exec.durationMs && (
                  <span className="tabular-nums text-muted-dark">
                    {formatDuration(exec.durationMs)}
                  </span>
                )}
                <span className="text-muted-dark">
                  {relativeTime(exec.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscriptions & Triggers summary */}
      <div className="flex gap-4 text-sm text-muted-dark">
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3" />
          {data.subscriptions.length} {data.subscriptions.length === 1 ? t.dashboardUi.subscription : t.dashboardUi.subscriptions}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.triggers.length} {data.triggers.length === 1 ? t.dashboardUi.trigger : t.dashboardUi.triggers}
        </span>
      </div>
    </div>
  );
}
