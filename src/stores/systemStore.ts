import { create } from "zustand";
import { api } from "@/lib/api";
import type { HealthResponse, StatusResponse } from "@/lib/types";

interface SystemState {
  health: HealthResponse | null;
  status: StatusResponse | null;
  // True once fetchHealth has resolved at least once (success OR failure).
  // Lets the UI distinguish "still verifying" from "verified but down" so it
  // doesn't paint a false Disconnected state before the first health check.
  healthChecked: boolean;
  fetchHealth: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  reset: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  health: null,
  status: null,
  healthChecked: false,
  fetchHealth: async () => {
    try {
      const health = await api.getHealth();
      set({ health });
    } catch {
      // leave null
    } finally {
      set({ healthChecked: true });
    }
  },
  fetchStatus: async () => {
    try {
      const status = await api.getStatus();
      set({ status });
    } catch {
      // leave null
    }
  },
  reset: () => set({ health: null, status: null, healthChecked: false }),
}));
