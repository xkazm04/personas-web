"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import {
  HEATMAP_DAYS,
  MOCK_EXECUTION_HEATMAP,
  type HeatmapRow,
} from "@/lib/mock-dashboard-data";

const FALLBACK_PERSONA_COLOR = "#888888";

/**
 * Bucket real executions into the same agent × day grid the mock uses:
 * one row per persona, one cell per day across the last HEATMAP_DAYS days
 * (oldest → newest). Each cell counts executions whose `createdAt` falls on
 * that calendar day. Personas with no runs in the window are dropped so the
 * grid only shows agents that were actually active.
 */
function deriveHeatmap(
  executions: { personaId: string; createdAt: string }[],
  personaMeta: Map<string, { name: string; color: string }>,
): HeatmapRow[] {
  // Day boundaries: index 0 = oldest day, index HEATMAP_DAYS-1 = today.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayStartMs = startOfToday.getTime();
  const windowStartMs = dayStartMs - (HEATMAP_DAYS - 1) * 86_400_000;

  const counts = new Map<string, number[]>();
  for (const e of executions) {
    const ts = new Date(e.createdAt).getTime();
    if (!Number.isFinite(ts) || ts < windowStartMs) continue;
    const dayIdx = Math.floor((ts - windowStartMs) / 86_400_000);
    if (dayIdx < 0 || dayIdx >= HEATMAP_DAYS) continue;
    let row = counts.get(e.personaId);
    if (!row) {
      row = Array.from({ length: HEATMAP_DAYS }, () => 0);
      counts.set(e.personaId, row);
    }
    row[dayIdx] += 1;
  }

  return [...counts.entries()].map(([personaId, days]) => {
    const meta = personaMeta.get(personaId);
    return {
      persona: meta?.name ?? personaId,
      color: meta?.color ?? FALLBACK_PERSONA_COLOR,
      days,
    };
  });
}

export interface ExecutionHeatmapData {
  rows: HeatmapRow[];
  loading: boolean;
}

/**
 * Execution-heatmap data source. Demo → the static MOCK_EXECUTION_HEATMAP
 * (unchanged). Real/supabase mode → an agent × day grid derived from the last
 * window of synced executions, bucketed by createdAt. Empty array when nothing
 * has run in the window.
 */
export function useExecutionHeatmap(): ExecutionHeatmapData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  const [rows, setRows] = useState<HeatmapRow[]>(
    useMock ? MOCK_EXECUTION_HEATMAP : [],
  );
  const [loading, setLoading] = useState(!useMock);

  useEffect(() => {
    if (useMock) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [executions, personas] = await Promise.all([
          api.listExecutions({ limit: 2000 }),
          api.listPersonas(),
        ]);
        if (cancelled) return;
        const meta = new Map(
          personas.map((p) => [
            p.id,
            { name: p.name, color: p.color ?? FALLBACK_PERSONA_COLOR },
          ]),
        );
        setRows(deriveHeatmap(executions, meta));
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useExecutionHeatmap" } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { rows, loading };
}
