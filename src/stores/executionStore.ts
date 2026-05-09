import { create } from "zustand";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { usePersonaStore } from "./personaStore";
import type {
  Persona,
  PersonaExecution,
  GlobalExecution,
  ExecFilterOpts,
} from "@/lib/types";

const personaLookupCache = new WeakMap<Persona[], Map<string, Persona>>();
let executionFetchSeq = 0;

function getPersonaLookup(personas: Persona[]): Map<string, Persona> {
  const cached = personaLookupCache.get(personas);
  if (cached) return cached;
  const next = new Map(personas.map((p) => [p.id, p]));
  personaLookupCache.set(personas, next);
  return next;
}

/* ── Persona enrichment (pure function) ── */

function enrichWithPersona(
  records: PersonaExecution[],
  personas: Persona[],
): GlobalExecution[] {
  const map = getPersonaLookup(personas);
  return records.map((r) => {
    const p = map.get(r.personaId);
    return {
      ...r,
      personaName: p?.name,
      personaIcon: p?.icon ?? undefined,
      personaColor: p?.color ?? undefined,
    };
  });
}

/* ── Store (normalized — no persona metadata) ── */

/**
 * Pre-aggregate the running count alongside the raw list so that the
 * dashboard nav (and anything else that only cares about the count) can
 * subscribe to a primitive selector. Without this, every list mutation
 * — including unrelated field edits — would re-render the nav even when
 * the count didn't change.
 */
function countRunning(execs: PersonaExecution[]): number {
  let n = 0;
  for (const e of execs) if (e.status === "running") n++;
  return n;
}

interface ExecutionState {
  /** Raw executions without persona enrichment */
  rawExecutions: PersonaExecution[];
  /** Pre-aggregated count of running executions; consume via primitive selector. */
  runningCount: number;
  executionsLoading: boolean;
  executionsError: string | null;
  fetchExecutions: (opts?: ExecFilterOpts) => Promise<void>;
  cancelExecution: (id: string) => Promise<void>;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  rawExecutions: [],
  runningCount: 0,
  executionsLoading: false,
  executionsError: null,
  fetchExecutions: async (opts) => {
    const seq = ++executionFetchSeq;
    set({ executionsLoading: true });
    try {
      const raw = await api.listExecutions({ limit: 50, ...opts });
      if (seq === executionFetchSeq) {
        set({
          rawExecutions: raw,
          runningCount: countRunning(raw),
          executionsError: null,
        });
      }
    } catch (err) {
      if (seq === executionFetchSeq) {
        set({
          executionsError:
            err instanceof Error ? err.message : "Failed to fetch executions",
        });
      }
    } finally {
      if (seq === executionFetchSeq) {
        set({ executionsLoading: false });
      }
    }
  },
  cancelExecution: async (id) => {
    await api.cancelExecution(id);
    set((s) => {
      const rawExecutions = s.rawExecutions.map((e) =>
        e.id === id ? { ...e, status: "cancelled" as const } : e,
      );
      return { rawExecutions, runningCount: countRunning(rawExecutions) };
    });
  },
  reset: () => {
    // Bump the seq so any in-flight fetch from the previous user can't write back.
    executionFetchSeq++;
    set({
      rawExecutions: [],
      runningCount: 0,
      executionsLoading: false,
      executionsError: null,
    });
  },
}));

/* ── Memoized selector: dynamically joins executions + personas ── */

/**
 * Returns enriched GlobalExecution[] that stays in sync with both
 * the execution store and the persona store. No race condition —
 * if personas load after executions, the join recomputes automatically.
 */
export function useEnrichedExecutions(): GlobalExecution[] {
  const raw = useExecutionStore((s) => s.rawExecutions);
  const personas = usePersonaStore((s) => s.personas);
  return useMemo(() => enrichWithPersona(raw, personas), [raw, personas]);
}
