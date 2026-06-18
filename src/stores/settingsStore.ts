import { create } from "zustand";

/**
 * Dashboard Settings preferences (healing-alert severities, weekly digest, and
 * the BYOM allowed-provider policy). Persisted to localStorage like
 * reviewVoiceStore so the choices survive navigation/reload — previously these
 * lived in component-local useState seeded from MOCK_* constants and silently
 * reverted on every mount, even though the adjacent voice toggle persisted.
 *
 * Provider state is stored as an override map (id -> allowed) layered over each
 * provider's default `allowed`, so the store stays decoupled from the mock data.
 * These are browser-level preferences, not user data, so they are intentionally
 * not cleared on sign-out (same policy as reviewVoiceStore).
 */

const STORAGE_KEY = "dashboard-settings-prefs";

export type AlertSeverity = {
  critical: boolean;
  high: boolean;
  medium: boolean;
  low: boolean;
};

interface SettingsState {
  alertSeverity: AlertSeverity;
  weeklyDigest: boolean;
  providerOverrides: Record<string, boolean>;
  setAlertSeverity: (key: keyof AlertSeverity, on: boolean) => void;
  setWeeklyDigest: (on: boolean) => void;
  setProviderAllowed: (id: string, on: boolean) => void;
}

const DEFAULTS = {
  alertSeverity: { critical: true, high: true, medium: false, low: false } as AlertSeverity,
  weeklyDigest: true,
  providerOverrides: {} as Record<string, boolean>,
};

function persistSnapshot(): void {
  const { alertSeverity, weeklyDigest, providerOverrides } = useSettingsStore.getState();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ alertSeverity, weeklyDigest, providerOverrides }));
  } catch {
    /* storage blocked (private mode / quota) — keep in-memory only */
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  setAlertSeverity: (key, on) => {
    set({ alertSeverity: { ...get().alertSeverity, [key]: on } });
    persistSnapshot();
  },
  setWeeklyDigest: (on) => {
    set({ weeklyDigest: on });
    persistSnapshot();
  },
  setProviderAllowed: (id, on) => {
    set({ providerOverrides: { ...get().providerOverrides, [id]: on } });
    persistSnapshot();
  },
}));

// Hydrate from localStorage on the client (mirrors reviewVoiceStore).
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<typeof DEFAULTS>;
      useSettingsStore.setState({
        alertSeverity: { ...DEFAULTS.alertSeverity, ...(saved.alertSeverity ?? {}) },
        weeklyDigest: saved.weeklyDigest ?? DEFAULTS.weeklyDigest,
        providerOverrides: saved.providerOverrides ?? {},
      });
    }
  } catch {
    /* ignore — defaults apply */
  }
}
