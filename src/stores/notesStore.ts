import { create } from "zustand";
import { api } from "@/lib/api";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import type { SyncedNote } from "@/lib/notes/notesModel";

interface NotesState {
  notes: SyncedNote[];
  loading: boolean;
  /** At least one fetch has settled (success or failure): the empty state may show. */
  loaded: boolean;
  /** Last failure, so "fetch failed" is never painted as "no notes". */
  error: string | null;
  /** When the current list arrived (ms), for the staleness line. */
  fetchedAt: number | null;
  /** Load the synced notes. Realtime (`synced_notes`) calls it on every desktop push. */
  fetchNotes: () => Promise<void>;
}

/** A later fetch supersedes an earlier one still in flight (a Realtime burst). */
let latestRequest = 0;

/**
 * The desktop Notepad's goals (`synced_notes`, PHASE2-SPEC.md 5.1), read
 * through the `api` proxy: the demo gets `mockApi`'s fixture, the live plane
 * the sync mirror, the orchestrator plane an empty list. Read-only in v1.
 */
export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,
  loaded: false,
  error: null,
  fetchedAt: null,
  fetchNotes: async () => {
    const request = ++latestRequest;
    set({ loading: true });
    try {
      const notes = await api.listNotes();
      if (request !== latestRequest) return;
      set({ notes, loading: false, loaded: true, error: null, fetchedAt: Date.now() });
    } catch (err) {
      if (request !== latestRequest) return;
      captureExceptionScrubbed(err, { tags: { scope: "notesStore.fetchNotes" } });
      set({ loading: false, loaded: true, error: err instanceof Error ? err.message : "Failed to load notes" });
    }
  },
}));
