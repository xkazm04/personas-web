"use client";

import { useEffect, useMemo, useState } from "react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

import { scopeKnowledge } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { useDemoOnlySWR } from "@/hooks/useDemoOnlySWR";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { KNOWLEDGE_MEMORIES_KEY, memoryItemFromSynced } from "@/lib/knowledgeMemories";
import { getKnowledgeMemories } from "@/lib/mockApi";
import {
  getSyncedKnowledgePatterns,
  getSyncedMemories,
  type SyncedKnowledgePattern,
} from "@/lib/supabaseApi";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  type KnowledgePattern,
  type MemoryItem,
} from "@/lib/mock-dashboard-data";

const KNOWLEDGE_TYPES: KnowledgePattern["knowledgeType"][] = [
  "tool_sequence",
  "failure_pattern",
  "cost_quality",
  "model_performance",
  "data_flow",
];

/** Coerce an arbitrary synced knowledge_type token into the web display union. */
function normalizeKnowledgeType(raw: string): KnowledgePattern["knowledgeType"] {
  return (KNOWLEDGE_TYPES as string[]).includes(raw)
    ? (raw as KnowledgePattern["knowledgeType"])
    : "tool_sequence";
}

function mapSyncedPattern(
  k: SyncedKnowledgePattern,
  personaName: string,
): KnowledgePattern {
  const total = k.successCount + k.failureCount;
  const confidence = Number.isFinite(k.confidence) ? k.confidence : 0;
  // The synced row has no human description; surface the pattern key + a short
  // outcome summary so the table/graph have a body to show.
  const rate = total > 0 ? Math.round((k.successCount / total) * 100) : 0;
  const description = `${k.patternKey} — ${rate}% success across ${total} runs (confidence ${(confidence * 100).toFixed(0)}%).`;
  return {
    id: k.id,
    personaName,
    knowledgeType: normalizeKnowledgeType(k.knowledgeType),
    patternKey: k.patternKey,
    successCount: k.successCount,
    failureCount: k.failureCount,
    confidence,
    avgCostUsd: k.avgCostUsd,
    avgDurationMs: k.avgDurationMs,
    description,
    lastSeen: k.updatedAt,
    lastExecutionId: k.lastExecutionId,
  };
}

export interface KnowledgeData {
  /** Patterns in the scope bar's persona, last seen inside its window. */
  patterns: KnowledgePattern[];
  /** Memories in the scope bar's persona (standing knowledge: the window does not apply). */
  memories: MemoryItem[];
  /** The scope emptied a list that has rows. */
  scopeEmpty: { patterns: boolean; memories: boolean };
  /** The patterns (and, in real mode, the memories) are loading. */
  loading: boolean;
  /** The demo's separate memories read is in flight (real mode loads them with the patterns, under `loading`). */
  memoriesLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Knowledge module data source. Demo → the static pattern fixtures plus the
 * memories read (`mockApi.getKnowledgeMemories`: what the scripted desktop
 * learned from this session's review verdicts, newest first, then the seeded
 * set; the command store refreshes it when the desktop writes). Real/supabase
 * mode → the synced knowledge patterns + memories, mapped into the web display
 * shapes with persona names resolved via the API. Either way the rows are then
 * cut to the scope bar's persona + window (`scopeKnowledge`).
 */
export function useKnowledgeData(): KnowledgeData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = isDemo;

  // isDemo can flip mid-session, and a real→demo switch must replace the
  // previous account's patterns/memories instead of leaving them on screen.
  // That's done by DERIVING the demo data during render — only the fetched
  // half is state. Re-seeding from the effect instead cost an extra render pass
  // before paint and still showed one frame of the previous account's rows.
  const [fetchedPatterns, setFetchedPatterns] = useState<KnowledgePattern[]>([]);
  const [fetchedMemories, setFetchedMemories] = useState<MemoryItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Keyed only in demo (null key otherwise, so real mode never runs it).
  const demoMemories = useDemoOnlySWR(KNOWLEDGE_MEMORIES_KEY, getKnowledgeMemories);

  useEffect(() => {
    // Demo mode has nothing to fetch here; its data is derived below.
    if (useMock) return;

    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const [syncedPatterns, syncedMemories, personas] = await Promise.all([
          getSyncedKnowledgePatterns(),
          getSyncedMemories(),
          api.listPersonas(),
        ]);
        if (cancelled) return;
        const nameById = new Map(personas.map((p) => [p.id, p.name]));
        setFetchedPatterns(
          syncedPatterns.map((k) =>
            mapSyncedPattern(k, nameById.get(k.personaId) ?? k.personaId),
          ),
        );
        setFetchedMemories(
          syncedMemories.map((m) =>
            memoryItemFromSynced(m, nameById.get(m.personaId) ?? m.personaId),
          ),
        );
        setFetchError(null);
      } catch (err) {
        if (cancelled) return;
        captureExceptionScrubbed(err, { tags: { scope: "useKnowledgeData" } });
        setFetchError(
          err instanceof Error ? err.message : "Failed to load knowledge data",
        );
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock, reloadKey]);

  const allPatterns = useMock ? MOCK_KNOWLEDGE_PATTERNS : fetchedPatterns;
  const allMemories = useMock ? demoMemories.data : fetchedMemories;
  const scope = useDashboardScope();
  const { patterns, memories } = useMemo(
    () => scopeKnowledge({ patterns: allPatterns, memories: allMemories ?? [] }, scope),
    [allPatterns, allMemories, scope],
  );
  const loading = useMock ? false : fetchLoading;
  const memoriesLoading = useMock && demoMemories.data === undefined && !demoMemories.error;
  const error = useMock ? demoMemories.error : fetchError;

  return {
    patterns,
    memories,
    scopeEmpty: {
      patterns: scopeHidAll(allPatterns, patterns),
      memories: scopeHidAll(allMemories ?? [], memories),
    },
    loading,
    memoriesLoading,
    error,
    retry: useMock ? demoMemories.retry : () => setReloadKey((k) => k + 1),
  };
}
