import { create } from "zustand";

/**
 * Whether new manual-review requests are read aloud (Web Speech). Off by
 * default — audio must be opted into, and browsers gate `speak()` behind a
 * user gesture anyway. Persisted to localStorage like the review escalation
 * prefs so the choice survives reloads. Browser-level preference, not user
 * data, so it is intentionally not reset on sign-out.
 */

const STORAGE_KEY = "review-voice-enabled";

interface ReviewVoiceState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useReviewVoiceStore = create<ReviewVoiceState>((set) => ({
  enabled: false,
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      /* storage blocked (private mode / quota) — keep in-memory only */
    }
    set({ enabled });
  },
}));

// Hydrate from localStorage on the client (mirrors reviewStore's escalation prefs).
if (typeof window !== "undefined") {
  try {
    useReviewVoiceStore.setState({ enabled: localStorage.getItem(STORAGE_KEY) === "true" });
  } catch {
    /* ignore — defaults to disabled */
  }
}
