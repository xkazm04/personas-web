import { create } from "zustand";
import { api } from "@/lib/api";
import type { Persona } from "@/lib/types";

interface PersonaState {
  personas: Persona[];
  personasLoading: boolean;
  personasFetchedAt: number | null;
  fetchPersonas: () => Promise<void>;
  optimisticUpdatePersona: (id: string, patch: Partial<Persona>) => void;
}

const PERSONA_STALE_MS = 300_000;

// In-flight promise ref for fetch deduplication — lives outside the store
// so concurrent callers share the same request.
let inflight: Promise<void> | null = null;

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: [],
  personasLoading: false,
  personasFetchedAt: null,
  fetchPersonas: () => {
    const { personas, personasFetchedAt } = usePersonaStore.getState();
    const now = Date.now();
    const hasStaleData = personas.length > 0;
    const isFresh =
      personasFetchedAt !== null && now - personasFetchedAt < PERSONA_STALE_MS;

    if (isFresh) return Promise.resolve();

    // Return the in-flight request if one is already running
    if (inflight) return inflight;

    if (!hasStaleData) {
      set({ personasLoading: true });
    }

    inflight = api
      .listPersonas()
      .then((nextPersonas) => {
        set({ personas: nextPersonas, personasFetchedAt: Date.now() });
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
    set((s) => ({
      personas: s.personas.map((persona) =>
        persona.id === id ? { ...persona, ...patch } : persona,
      ),
    }));
  },
}));
