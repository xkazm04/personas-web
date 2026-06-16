import { create } from "zustand";
import * as Sentry from "@sentry/nextjs";
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
  /**
   * Last fetch failure, surfaced to the UI. Null while loading or after a
   * success. Lets pages distinguish "fetch failed" from "genuinely no agents"
   * instead of painting a reassuring empty state over a network error.
   */
  personasError: string | null;
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

// Per-id mutex for optimistic updates. Two rapid clicks on the same toggle
// (or two panels writing to the same persona concurrently) used to capture
// overlapping snapshots — snapshot B was taken *after* A's optimistic patch
// landed, so a rollback of B reverted to A's patched value rather than the
// original, leaving the UI showing a state the server never agreed to. By
// serializing per id we make snapshot N always reflect the post-mutation
// store of snapshot N-1.
const personaMutationInflight = new Map<string, Promise<unknown>>();

/**
 * Cheap structural equality for the optimistic-patch CAS: did the field-set we
 * wrote at optimistic-update time still hold at rollback time? If a later
 * commit overwrote any of these keys, we don't revert — the later commit is
 * now source of truth.
 */
function patchStillApplied(
  current: Persona,
  applied: Partial<Persona>,
): boolean {
  for (const key of Object.keys(applied) as (keyof Persona)[]) {
    if (current[key] !== applied[key]) return false;
  }
  return true;
}

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
  personasError: null,
  fetchPersonas: () => {
    const { personas, personasFetchedAt } = usePersonaStore.getState();
    const now = Date.now();
    const hasStaleData = personas.length > 0;
    const isFresh =
      personasFetchedAt !== null && now - personasFetchedAt < PERSONA_STALE_MS;

    if (isFresh) return Promise.resolve();
    if (inflight) return inflight;

    // Clear any prior error at the start of a fetch (incl. an explicit retry).
    set({ personasError: null });
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
            personasError: null,
          };
        });
      })
      .catch((err) => {
        // Keep any stale data on screen, but record the failure so the UI can
        // surface it (and retry) instead of falling back to an empty state.
        Sentry.captureException(err, { tags: { scope: "fetchPersonas" } });
        set({
          personasError: err instanceof Error ? err.message : "Failed to load agents",
        });
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
    // Serialize per id: if a previous mutation for this persona is still in
    // flight, wait for it to settle (success OR failure) before capturing
    // our snapshot. Without this, two concurrent commits would each snapshot
    // the partially-mutated store and a later rollback would revert to a
    // state that was already itself an optimistic patch.
    const previous = personaMutationInflight.get(id);
    if (previous) {
      try {
        await previous;
      } catch {
        // Don't propagate — each commit's caller surfaces its own error.
      }
    }

    const snapshot = usePersonaStore.getState().optimisticUpdatePersona(id, patch);

    const run = (async () => {
      try {
        return await mutate();
      } catch (err) {
        // CAS rollback: only revert when the field-set we wrote is still in
        // place. If a later commit (or a refetch) has already changed the
        // optimistic value, we leave the newer state alone — clobbering it
        // would resurrect a stale snapshot over the agreed-upon truth.
        if (snapshot) {
          const current = usePersonaStore.getState().personasById[id];
          if (current && patchStillApplied(current, patch)) {
            usePersonaStore.getState().rollbackPersona(id, snapshot);
          }
        }
        throw err;
      }
    })();

    personaMutationInflight.set(id, run);
    try {
      return await run;
    } finally {
      // Only clear the slot if we still own it — a reset() between schedule
      // and finally could already have wiped the map.
      if (personaMutationInflight.get(id) === run) {
        personaMutationInflight.delete(id);
      }
    }
  },
  reset: () => {
    inflight = null;
    personaMutationInflight.clear();
    set({
      personas: [],
      personasById: {},
      personaIds: [],
      personasLoading: false,
      personasFetchedAt: null,
      personasError: null,
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
