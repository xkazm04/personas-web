import { create } from "zustand";

export type DateRangePreset = "24h" | "7d" | "30d" | "90d" | "custom";

export const DATE_RANGE_PRESETS: DateRangePreset[] = ["24h", "7d", "30d", "90d"];

interface DashboardFilterState {
  personaId: string | null;
  dateRange: DateRangePreset;
  customStart: string | null;
  customEnd: string | null;
  compareEnabled: boolean;
  setPersonaId: (id: string | null) => void;
  setDateRange: (r: DateRangePreset) => void;
  setCustomRange: (start: string, end: string) => void;
  setCompareEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = "dashboard-filter-state";

interface PersistedShape {
  personaId: string | null;
  dateRange: DateRangePreset;
  compareEnabled: boolean;
}

function hydrate(): Partial<DashboardFilterState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    const next: Partial<DashboardFilterState> = {};
    if (parsed.personaId === null || typeof parsed.personaId === "string") {
      next.personaId = parsed.personaId;
    }
    if (
      parsed.dateRange === "24h" ||
      parsed.dateRange === "7d" ||
      parsed.dateRange === "30d" ||
      parsed.dateRange === "90d"
    ) {
      next.dateRange = parsed.dateRange;
    } else if (parsed.dateRange === "custom") {
      // Bounds aren't persisted, so a hydrated "custom" range has no
      // start/end and would silently widen the user's filter to all-time.
      // Coerce back to the default preset instead.
      next.dateRange = "7d";
    }
    if (typeof parsed.compareEnabled === "boolean") {
      next.compareEnabled = parsed.compareEnabled;
    }
    return next;
  } catch {
    return {};
  }
}

function persist(state: DashboardFilterState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedShape = {
      personaId: state.personaId,
      dateRange: state.dateRange,
      compareEnabled: state.compareEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage disabled — non-fatal
  }
}

export const useDashboardFilterStore = create<DashboardFilterState>((set, get) => ({
  personaId: null,
  dateRange: "7d",
  customStart: null,
  customEnd: null,
  compareEnabled: false,
  setPersonaId: (id) => {
    set({ personaId: id });
    persist(get());
  },
  setDateRange: (r) => {
    if (r === "custom") {
      // Custom mode requires start/end bounds — callers must use
      // setCustomRange(start, end). Throw to surface the bug instead of
      // landing the store in an inconsistent dateRange="custom"+null state.
      throw new Error(
        "[dashboardFilterStore] setDateRange('custom') is not allowed; call setCustomRange(start, end) instead",
      );
    }
    set({ dateRange: r });
    persist(get());
  },
  setCustomRange: (start, end) => {
    set({ customStart: start, customEnd: end, dateRange: "custom" });
    persist(get());
  },
  setCompareEnabled: (enabled) => {
    set({ compareEnabled: enabled });
    persist(get());
  },
  reset: () => {
    set({
      personaId: null,
      dateRange: "7d",
      customStart: null,
      customEnd: null,
      compareEnabled: false,
    });
    persist(get());
  },
}));

if (typeof window !== "undefined") {
  useDashboardFilterStore.setState(hydrate());
}
