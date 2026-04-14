"use client";

import { useEffect, useState } from "react";
import { Radio, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { api } from "@/lib/api";
import type { Persona } from "@/lib/types";
import { relativeTime, formatDuration } from "@/lib/format";
import {
  getCachedAgentDetail,
  setCachedAgentDetail,
  type AgentDetailData,
} from "@/lib/agentDetailCache";

async function loadAgentDetail(personaId: string): Promise<AgentDetailData> {
  const cached = getCachedAgentDetail(personaId);
  if (cached) return cached;

  const [executions, subscriptions, triggers] = await Promise.all([
    api.listExecutions({ personaId, limit: 5 }),
    api.listSubscriptions(personaId),
    api.listTriggers(personaId),
  ]);

  const data = { executions, subscriptions, triggers };
  setCachedAgentDetail(personaId, data);
  return data;
}

export async function prefetchAgentDetail(personaId: string) {
  try {
    await loadAgentDetail(personaId);
  } catch {
    // Best effort prefetch.
  }
}

export default function AgentDetail({ persona }: { persona: Persona }) {
  const [data, setData] = useState<AgentDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedAgentDetail(persona.id);
    if (cached) {
      queueMicrotask(() => {
        setData(cached);
        setError(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      setData(null);
      setError(false);
    });

    loadAgentDetail(persona.id)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, [persona.id]);

  if (error) {
    return (
      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-3 w-3" />
          Failed to load agent details
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
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
    <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
      {/* Recent executions */}
      <div>
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          Recent Executions
        </h4>
        {data.executions.length === 0 ? (
          <p className="mt-1 text-sm text-muted-dark">No executions yet</p>
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
          {data.subscriptions.length} subscription{data.subscriptions.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.triggers.length} trigger{data.triggers.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
