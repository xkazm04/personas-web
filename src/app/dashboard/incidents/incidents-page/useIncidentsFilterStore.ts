import { create } from "zustand";

import {
  INCIDENT_SEVERITIES,
  INCIDENT_SOURCES,
  INCIDENT_STATUSES,
} from "@/lib/mock-dashboard-data";
import type {
  GroupByKey,
  SeverityFilter,
  SourceFilter,
  StatusFilter,
} from "./incidentFormat";

interface IncidentsFilterState {
  status: StatusFilter;
  severity: SeverityFilter;
  source: SourceFilter;
  persona: string; // "all" or persona name
  groupBy: GroupByKey;
  setStatus: (v: StatusFilter) => void;
  setSeverity: (v: SeverityFilter) => void;
  setSource: (v: SourceFilter) => void;
  setPersona: (v: string) => void;
  setGroupBy: (v: GroupByKey) => void;
  reset: () => void;
}

const STORAGE_KEY = "incidents-filter-state";

const GROUP_BY_KEYS: GroupByKey[] = ["none", "agent", "severity", "source"];

const DEFAULTS = {
  status: "all" as StatusFilter,
  severity: "all" as SeverityFilter,
  source: "all" as SourceFilter,
  persona: "all",
  groupBy: "none" as GroupByKey,
};

interface PersistedShape {
  status: StatusFilter;
  severity: SeverityFilter;
  source: SourceFilter;
  persona: string;
  groupBy: GroupByKey;
}

// Type-guard each field on load so a corrupt or stale payload can never land
// the store in an out-of-range filter (matches dashboardFilterStore).
function hydrate(): Partial<IncidentsFilterState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedShape>;
    const next: Partial<IncidentsFilterState> = {};
    if (parsed.status === "all" || (INCIDENT_STATUSES as string[]).includes(parsed.status as string)) {
      next.status = parsed.status as StatusFilter;
    }
    if (parsed.severity === "all" || (INCIDENT_SEVERITIES as string[]).includes(parsed.severity as string)) {
      next.severity = parsed.severity as SeverityFilter;
    }
    if (parsed.source === "all" || (INCIDENT_SOURCES as string[]).includes(parsed.source as string)) {
      next.source = parsed.source as SourceFilter;
    }
    if (typeof parsed.persona === "string") {
      next.persona = parsed.persona;
    }
    if (typeof parsed.groupBy === "string" && GROUP_BY_KEYS.includes(parsed.groupBy)) {
      next.groupBy = parsed.groupBy;
    }
    return next;
  } catch {
    return {};
  }
}

function persist(state: IncidentsFilterState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedShape = {
      status: state.status,
      severity: state.severity,
      source: state.source,
      persona: state.persona,
      groupBy: state.groupBy,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage disabled — non-fatal
  }
}

export const useIncidentsFilterStore = create<IncidentsFilterState>((set, get) => ({
  ...DEFAULTS,
  setStatus: (v) => { set({ status: v }); persist(get()); },
  setSeverity: (v) => { set({ severity: v }); persist(get()); },
  setSource: (v) => { set({ source: v }); persist(get()); },
  setPersona: (v) => { set({ persona: v }); persist(get()); },
  setGroupBy: (v) => { set({ groupBy: v }); persist(get()); },
  reset: () => { set({ ...DEFAULTS }); persist(get()); },
}));

if (typeof window !== "undefined") {
  useIncidentsFilterStore.setState(hydrate());
}
