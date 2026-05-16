"use client";

import { Radio, Clock, AlertCircle } from "lucide-react";
import { mutate } from "swr";
import StatusBadge from "@/components/dashboard/StatusBadge";
import type { Persona } from "@/lib/types";
import { relativeTime, formatDuration } from "@/lib/format";
import { dashboardKeys, loadAgentDetail, useAgentDetail } from "@/lib/dashboard-queries";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { data, error } = useAgentDetail(persona.id);

  if (error) {
    return (
      <div className="mt-4 border-t border-glass pt-4">
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-3 w-3" />
          {t.dashboardUi.failedAgentDetails}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-4 space-y-3 border-t border-glass pt-4">
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-3 w-24 rounded bg-white/[0.05]" />
            <div className="space-y-2">
              <div className="h-2.5 rounded bg-white/[0.03]" />
              <div className="h-2.5 w-5/6 rounded bg-white/[0.03]" />
            </div>
          </div>
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
