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
 * Pre-aggregate the active count alongside the raw list so that the
 * dashboard nav (and anything else that only cares about the count) can
 * subscribe to a primitive selector. Without this, every list mutation
 * — including unrelated field edits — would re-render the nav even when
 * the count didn't change.
 *
 * "Active" matches the page's notion (running OR queued) so the nav badge
 * never disagrees with the table the user is staring at.
 */
function countActive(execs: PersonaExecution[]): number {
  let n = 0;
  for (const e of execs) if (e.status === "running" || e.status === "queued") n++;
  return n;
}

interface ExecutionState {
  /** Raw executions without persona enrichment */
  rawExecutions: PersonaExecution[];
  /** Pre-aggregated count of active (running or queued) executions; consume via primitive selector. */
  activeCount: number;
  executionsLoading: boolean;
  executionsError: string | null;
  /** Execution ids with an in-flight cancel request. Gates the per-row button. */
  cancellingIds: Record<string, true>;
  fetchExecutions: (opts?: ExecFilterOpts) => Promise<void>;
  cancelExecution: (id: string) => Promise<void>;
  reset: () => void;
}

const TERMINAL_STATUSES: ReadonlySet<PersonaExecution["status"]> = new Set([
  "completed",
  "failed",
  "cancelled",
]);

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  rawExecutions: [],
  activeCount: 0,
  executionsLoading: false,
  executionsError: null,
  cancellingIds: {},
  fetchExecutions: async (opts) => {
    const seq = ++executionFetchSeq;
    set({ executionsLoading: true });
    try {
      const raw = await api.listExecutions({ limit: 50, ...opts });
      if (seq === executionFetchSeq) {
        set({
          rawExecutions: raw,
          activeCount: countActive(raw),
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
    const state = get();
    // Idempotent on the client: skip if already in-flight or in a terminal state.
    if (state.cancellingIds[id]) return;
    const current = state.rawExecutions.find((e) => e.id === id);
    if (current && TERMINAL_STATUSES.has(current.status)) return;

    set((s) => ({ cancellingIds: { ...s.cancellingIds, [id]: true } }));
    try {
      await api.cancelExecution(id);
      set((s) => {
        const rawExecutions = s.rawExecutions.map((e) =>
          e.id === id ? { ...e, status: "cancelled" as const } : e,
        );
        const { [id]: _omit, ...cancellingIds } = s.cancellingIds;
        void _omit;
        return {
          rawExecutions,
          activeCount: countActive(rawExecutions),
          cancellingIds,
          executionsError: null,
        };
      });
    } catch (err) {
      set((s) => {
        const { [id]: _omit, ...cancellingIds } = s.cancellingIds;
        void _omit;
        return {
          cancellingIds,
          executionsError:
            err instanceof Error ? err.message : "Failed to cancel execution",
        };
      });
      throw err;
    }
  },
  reset: () => {
    // Bump the seq so any in-flight fetch from the previous user can't write back.
    executionFetchSeq++;
    set({
      rawExecutions: [],
      activeCount: 0,
      executionsLoading: false,
      executionsError: null,
      cancellingIds: {},
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
