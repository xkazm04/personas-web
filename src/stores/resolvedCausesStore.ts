import { create } from "zustand";

import type { HealthActionKind } from "@/lib/mock-dashboard-data";
import { NO_RESOLVED_CAUSES, type ResolvedCauses } from "@/lib/settleThread";

/**
 * The demo session's fixed causes, keyed by incident-thread `causeKey`
 * (lib/settleThread.ts projects them onto the fixtures). Demo-only and
 * session-only: in memory, never persisted, so a reload restores the outage.
 * Written by the System Health actions through lib/demoCauseFix.ts; a real
 * tenant never writes or reads it.
 */
interface ResolvedCausesState {
  resolved: ResolvedCauses;
  settle: (causeKey: string, kind: HealthActionKind, at: string) => void;
  reopen: (causeKey: string) => void;
  /** A new session (sign-in, sign-out, demo entry) starts on the outage. */
  reset: () => void;
}

export const useResolvedCausesStore = create<ResolvedCausesState>((set) => ({
  resolved: NO_RESOLVED_CAUSES,
  settle: (causeKey, kind, at) =>
    set((state) =>
      state.resolved[causeKey] ? state : { resolved: { ...state.resolved, [causeKey]: { at, kind } } },
    ),
  reopen: (causeKey) =>
    set((state) => {
      if (!state.resolved[causeKey]) return state;
      const rest = Object.fromEntries(Object.entries(state.resolved).filter(([key]) => key !== causeKey));
      return { resolved: Object.keys(rest).length === 0 ? NO_RESOLVED_CAUSES : rest };
    }),
  reset: () => set({ resolved: NO_RESOLVED_CAUSES }),
}));
