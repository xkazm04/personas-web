import { create } from "zustand";
import { api } from "@/lib/api";
import type { HealthResponse, StatusResponse } from "@/lib/types";

interface SystemState {
  health: HealthResponse | null;
  status: StatusResponse | null;
  fetchHealth: () => Promise<void>;
  fetchStatus: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  health: null,
  status: null,
  fetchHealth: async () => {
    try {
      const health = await api.getHealth();
      set({ health });
    } catch {
      // leave null
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
}));
