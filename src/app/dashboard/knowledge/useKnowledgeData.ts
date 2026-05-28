"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { DEVELOPMENT } from "@/lib/dev";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import {
  getSyncedKnowledgePatterns,
  getSyncedMemories,
  type SyncedKnowledgePattern,
  type SyncedMemory,
} from "@/lib/supabaseApi";
import {
  MOCK_KNOWLEDGE_PATTERNS,
  MOCK_MEMORIES,
  type KnowledgePattern,
  type MemoryAction,
  type MemoryItem,
  type MemoryStatus,
} from "@/lib/mock-dashboard-data";

const KNOWLEDGE_TYPES: KnowledgePattern["knowledgeType"][] = [
  "tool_sequence",
  "failure_pattern",
  "cost_quality",
  "model_performance",
  "data_flow",
];

const MEMORY_TYPES: MemoryAction["type"][] = [
  "throttle",
  "schedule",
  "alert",
  "config",
  "routing",
];

/** Coerce an arbitrary synced knowledge_type token into the web display union. */
function normalizeKnowledgeType(raw: string): KnowledgePattern["knowledgeType"] {
  return (KNOWLEDGE_TYPES as string[]).includes(raw)
    ? (raw as KnowledgePattern["knowledgeType"])
    : "tool_sequence";
}

/** Coerce a synced memory category into the web display memory-action union. */
function normalizeMemoryType(raw: string | null): MemoryAction["type"] {
  return raw && (MEMORY_TYPES as string[]).includes(raw)
    ? (raw as MemoryAction["type"])
    : "config";
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
  };
}

function mapSyncedMemory(m: SyncedMemory, personaName: string): MemoryItem {
  // importance is the desktop's 0..N weight; map onto the 1-10 display score.
  const score = Math.max(1, Math.min(10, Math.round(m.importance ?? 5)));
  return {
    id: m.id,
    type: normalizeMemoryType(m.category),
    title: m.title,
    description: m.content,
    persona: personaName,
    score,
    // No accept/archive workflow is synced; treat every synced memory as active.
    status: "active" as MemoryStatus,
    // usageCount / lastUsed aren't tracked in the sync projection.
    usageCount: 0,
    acceptedAt: m.createdAt,
    lastUsed: m.updatedAt,
    // Conflict detection is a desktop-only concept; never flag synced memories.
    hasConflict: false,
  };
}

export interface KnowledgeData {
  patterns: KnowledgePattern[];
  memories: MemoryItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Knowledge module data source. Dev/demo → the static mock fixtures (unchanged
 * behavior). Real/supabase mode → the synced knowledge patterns + memories,
 * mapped into the web display shapes with persona names resolved via the API.
 */
export function useKnowledgeData(): KnowledgeData {
  const isDemo = useAuthStore((s) => s.isDemo);
  const useMock = DEVELOPMENT || isDemo;

  const [patterns, setPatterns] = useState<KnowledgePattern[]>(
    useMock ? MOCK_KNOWLEDGE_PATTERNS : [],
  );
  const [memories, setMemories] = useState<MemoryItem[]>(
    useMock ? MOCK_MEMORIES : [],
  );
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock/demo mode is decided once per session; the useState initializers
    // above already seed the mock fixtures, so the effect only drives the
    // async real-data fetch.
    if (useMock) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [syncedPatterns, syncedMemories, personas] = await Promise.all([
          getSyncedKnowledgePatterns(),
          getSyncedMemories(),
          api.listPersonas(),
        ]);
        if (cancelled) return;
        const nameById = new Map(personas.map((p) => [p.id, p.name]));
        setPatterns(
          syncedPatterns.map((k) =>
            mapSyncedPattern(k, nameById.get(k.personaId) ?? k.personaId),
          ),
        );
        setMemories(
          syncedMemories.map((m) =>
            mapSyncedMemory(m, nameById.get(m.personaId) ?? m.personaId),
          ),
        );
        setError(null);
      } catch (err) {
        if (cancelled) return;
        Sentry.captureException(err, { tags: { scope: "useKnowledgeData" } });
        setError(
          err instanceof Error ? err.message : "Failed to load knowledge data",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { patterns, memories, loading, error };
}
