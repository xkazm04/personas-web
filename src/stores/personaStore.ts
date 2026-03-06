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

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: [],
  personasLoading: false,
  personasFetchedAt: null,
  fetchPersonas: async () => {
    const { personas, personasFetchedAt } = usePersonaStore.getState();
    const now = Date.now();
    const hasStaleData = personas.length > 0;
    const isFresh =
      personasFetchedAt !== null && now - personasFetchedAt < PERSONA_STALE_MS;

    if (isFresh) return;

    if (!hasStaleData) {
      set({ personasLoading: true });
    }

    try {
      const nextPersonas = await api.listPersonas();
      set({ personas: nextPersonas, personasFetchedAt: Date.now() });
    } catch {
      // leave stale
    } finally {
      set({ personasLoading: false });
    }
  },
  optimisticUpdatePersona: (id, patch) => {
    set((s) => ({
      personas: s.personas.map((persona) =>
        persona.id === id ? { ...persona, ...patch } : persona,
      ),
    }));
  },
}));
