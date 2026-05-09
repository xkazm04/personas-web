import { create } from "zustand";
import { api } from "@/lib/api";
import type { Persona } from "@/lib/types";

interface PersonaState {
  /** Full ordered list — kept for legacy consumers (enrichment, dropdowns). */
  personas: Persona[];
  /** Keyed lookup so single-id selectors stay referentially stable across other-id updates. */
  personasById: Record<string, Persona>;
  /** Stable id order — reference is preserved across optimistic patches. */
  personaIds: string[];
  personasLoading: boolean;
  personasFetchedAt: number | null;
  fetchPersonas: () => Promise<void>;
  /**
   * Apply a patch to the local persona record. Returns the pre-update
   * snapshot so callers can pass it to `rollbackPersona` if the wrapped
   * API mutation rejects. Returns null when the id is not in the store
   * (no-op — there is nothing to roll back).
   */
  optimisticUpdatePersona: (id: string, patch: Partial<Persona>) => Persona | null;
  /**
   * Revert a persona to a previously captured snapshot. No-op if the
   * persona is no longer in the store (e.g., a refetch removed it) — we
   * don't resurrect records the server has dropped.
   */
  rollbackPersona: (id: string, snapshot: Persona) => void;
  /**
   * Optimistic-update + auto-rollback wrapper. Applies the patch
   * immediately, awaits `mutate`, and reverts to the pre-update snapshot
   * if `mutate` rejects. Re-throws so the caller can surface the failure
   * (toast, inline error, etc.).
   */
  commitOptimisticUpdate: <T>(
    id: string,
    patch: Partial<Persona>,
    mutate: () => Promise<T>,
  ) => Promise<T>;
  /**
   * Drop all persona records and any in-flight fetch state. Called on auth
   * transitions so a freshly signed-in user never sees personas that
   * belonged to the previous session.
   */
  reset: () => void;
}

const PERSONA_STALE_MS = 300_000;

let inflight: Promise<void> | null = null;

function buildById(list: Persona[]): Record<string, Persona> {
  const out: Record<string, Persona> = {};
  for (const p of list) out[p.id] = p;
  return out;
}

function buildIds(list: Persona[]): string[] {
  return list.map((p) => p.id);
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: [],
  personasById: {},
  personaIds: [],
  personasLoading: false,
  personasFetchedAt: null,
  fetchPersonas: () => {
    const { personas, personasFetchedAt } = usePersonaStore.getState();
    const now = Date.now();
    const hasStaleData = personas.length > 0;
    const isFresh =
      personasFetchedAt !== null && now - personasFetchedAt < PERSONA_STALE_MS;

    if (isFresh) return Promise.resolve();
    if (inflight) return inflight;

    if (!hasStaleData) {
      set({ personasLoading: true });
    }

    inflight = api
      .listPersonas()
      .then((nextPersonas) => {
        set((s) => {
          const nextIds = buildIds(nextPersonas);
          // Preserve personaIds reference if order is unchanged so
          // useSortedPersonaIds() consumers don't re-render on refetch.
          const personaIds = arraysEqual(s.personaIds, nextIds) ? s.personaIds : nextIds;
          return {
            personas: nextPersonas,
            personasById: buildById(nextPersonas),
            personaIds,
            personasFetchedAt: Date.now(),
          };
        });
      })
      .catch(() => {
        // leave stale
      })
      .finally(() => {
        inflight = null;
        set({ personasLoading: false });
      });

    return inflight;
  },
  optimisticUpdatePersona: (id, patch) => {
    let snapshot: Persona | null = null;
    set((s) => {
      const existing = s.personasById[id];
      if (!existing) return s;
      snapshot = existing;
      const next = { ...existing, ...patch };
      return {
        personas: s.personas.map((p) => (p.id === id ? next : p)),
        personasById: { ...s.personasById, [id]: next },
        // personaIds reference unchanged — order didn't change.
      };
    });
    return snapshot;
  },
  rollbackPersona: (id, snapshot) => {
    set((s) => {
      const current = s.personasById[id];
      if (!current) return s;
      return {
        personas: s.personas.map((p) => (p.id === id ? snapshot : p)),
        personasById: { ...s.personasById, [id]: snapshot },
      };
    });
  },
  commitOptimisticUpdate: async (id, patch, mutate) => {
    const snapshot = usePersonaStore.getState().optimisticUpdatePersona(id, patch);
    try {
      return await mutate();
    } catch (err) {
      if (snapshot) {
        usePersonaStore.getState().rollbackPersona(id, snapshot);
      }
      throw err;
    }
  },
  reset: () => {
    inflight = null;
    set({
      personas: [],
      personasById: {},
      personaIds: [],
      personasLoading: false,
      personasFetchedAt: null,
    });
  },
}));

/**
 * Subscribe to a single persona by id. Re-renders only when *that* persona
 * changes — patches to other personas leave this subscriber's value
 * referentially equal, so React skips reconciliation for unaffected cards.
 */
export function usePersona(id: string | null | undefined): Persona | undefined {
  return usePersonaStore((s) => (id ? s.personasById[id] : undefined));
}

/**
 * Subscribe to the ordered list of persona ids. The array reference is
 * preserved across optimistic patches (and across refetches that produce
 * the same id sequence), so list iterators don't re-render on field edits.
 */
export function useSortedPersonaIds(): string[] {
  return usePersonaStore((s) => s.personaIds);
}
