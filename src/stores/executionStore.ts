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

interface ExecutionState {
  /** Raw executions without persona enrichment */
  rawExecutions: PersonaExecution[];
  executionsLoading: boolean;
  fetchExecutions: (opts?: ExecFilterOpts) => Promise<void>;
  cancelExecution: (id: string) => Promise<void>;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  rawExecutions: [],
  executionsLoading: false,
  fetchExecutions: async (opts) => {
    const seq = ++executionFetchSeq;
    set({ executionsLoading: true });
    try {
      const raw = await api.listExecutions({ limit: 50, ...opts });
      if (seq === executionFetchSeq) {
        set({ rawExecutions: raw });
      }
    } catch {
      // leave stale
    } finally {
      if (seq === executionFetchSeq) {
        set({ executionsLoading: false });
      }
    }
  },
  cancelExecution: async (id) => {
    await api.cancelExecution(id);
    set((s) => ({
      rawExecutions: s.rawExecutions.map((e) =>
        e.id === id ? { ...e, status: "cancelled" as const } : e,
      ),
    }));
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
