import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  Persona,
  PersonaExecution,
  PersonaEvent,
  GlobalExecution,
  ManualReviewItem,
  WithPersonaInfo,
  HealthResponse,
  StatusResponse,
  DashboardTab,
  ExecFilterOpts,
  ObservabilityMetrics,
  DailyMetric,
  PersonaSpend,
  HealthIssue,
  ToolUsageSummary,
  ToolUsageOverTime,
  ToolUsageByPersona,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function enrichWithPersona<T extends { personaId: string }>(
  records: T[],
  personas: Persona[],
): (T & WithPersonaInfo)[] {
  const map = new Map(personas.map((p) => [p.id, p]));
  return records.map((r) => {
    const p = map.get(r.personaId);
    return {
      ...r,
      personaName: p?.name,
      personaIcon: p?.icon ?? undefined,
      personaColor: p?.color ?? undefined,
    };
  });
}

function parseManualReview(
  event: PersonaEvent,
  personas: Persona[],
): ManualReviewItem | null {
  if (event.eventType !== "manual_review") return null;
  const p = personas.find((pp) => pp.id === event.targetPersonaId);
  let content = "";
  let severity = "info";
  let reviewerNotes: string | null = null;
  try {
    const payload = JSON.parse(event.payload ?? "{}");
    content = payload.title
      ? `${payload.title}\n${payload.description ?? ""}`
      : (payload.content ?? "");
    severity = payload.severity ?? "info";
    reviewerNotes = payload.reviewerNotes ?? null;
  } catch {
    content = event.payload ?? "";
  }
  return {
    id: event.id,
    personaId: event.targetPersonaId ?? "",
    executionId: event.sourceId ?? "",
    eventType: event.eventType,
    content,
    severity,
    status: event.status === "processed" ? "approved" : event.status === "failed" ? "rejected" : "pending",
    reviewerNotes,
    createdAt: event.createdAt,
    resolvedAt: event.processedAt,
    personaName: p?.name,
    personaIcon: p?.icon ?? undefined,
    personaColor: p?.color ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface DashboardState {
  // Personas
  personas: Persona[];
  personasLoading: boolean;
  fetchPersonas: () => Promise<void>;

  // Executions
  executions: GlobalExecution[];
  executionsLoading: boolean;
  fetchExecutions: (opts?: ExecFilterOpts) => Promise<void>;
  cancelExecution: (id: string) => Promise<void>;

  // Events
  events: PersonaEvent[];
  eventsLoading: boolean;
  fetchEvents: () => Promise<void>;

  // Reviews
  reviews: ManualReviewItem[];
  reviewsLoading: boolean;
  pendingReviewCount: number;
  fetchReviews: () => Promise<void>;
  resolveReview: (id: string, status: "approved" | "rejected", notes?: string) => Promise<void>;

  // System
  health: HealthResponse | null;
  status: StatusResponse | null;
  fetchHealth: () => Promise<void>;
  fetchStatus: () => Promise<void>;

  // Observability
  observabilityMetrics: ObservabilityMetrics | null;
  dailyMetrics: DailyMetric[];
  personaSpend: PersonaSpend[];
  healthIssues: HealthIssue[];
  observabilityLoading: boolean;
  fetchObservability: () => Promise<void>;

  // Usage analytics
  toolUsage: ToolUsageSummary[];
  toolUsageOverTime: ToolUsageOverTime[];
  toolUsageByPersona: ToolUsageByPersona[];
  usageLoading: boolean;
  fetchUsage: () => Promise<void>;

  // UI
  sidebarTab: DashboardTab;
  setSidebarTab: (tab: DashboardTab) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // -- Personas --
  personas: [],
  personasLoading: false,
  fetchPersonas: async () => {
    set({ personasLoading: true });
    try {
      const personas = await api.listPersonas();
      set({ personas });
    } catch {
      // leave stale
    } finally {
      set({ personasLoading: false });
    }
  },

  // -- Executions --
  executions: [],
  executionsLoading: false,
  fetchExecutions: async (opts) => {
    set({ executionsLoading: true });
    try {
      const raw = await api.listExecutions({ limit: 50, ...opts });
      const enriched = enrichWithPersona(raw, get().personas);
      set({ executions: enriched });
    } catch {
      // leave stale
    } finally {
      set({ executionsLoading: false });
    }
  },
  cancelExecution: async (id) => {
    await api.cancelExecution(id);
    // Optimistic: mark as cancelling
    set((s) => ({
      executions: s.executions.map((e) =>
        e.id === id ? { ...e, status: "cancelled" } : e,
      ),
    }));
  },

  // -- Events --
  events: [],
  eventsLoading: false,
  fetchEvents: async () => {
    set({ eventsLoading: true });
    try {
      const events = await api.listEvents({ limit: 100 });
      set({ events });
    } catch {
      // leave stale
    } finally {
      set({ eventsLoading: false });
    }
  },

  // -- Reviews --
  reviews: [],
  reviewsLoading: false,
  pendingReviewCount: 0,
  fetchReviews: async () => {
    set({ reviewsLoading: true });
    try {
      const events = await api.listEvents({ eventType: "manual_review", limit: 100 });
      const personas = get().personas;
      const reviews = events
        .map((e) => parseManualReview(e, personas))
        .filter((r): r is ManualReviewItem => r !== null);
      set({
        reviews,
        pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
      });
    } catch {
      // leave stale
    } finally {
      set({ reviewsLoading: false });
    }
  },
  resolveReview: async (id, status, notes) => {
    const mappedStatus = status === "approved" ? "processed" : "failed";
    await api.updateEvent(id, {
      status: mappedStatus,
      metadata: notes ? JSON.stringify({ reviewerNotes: notes }) : undefined,
    });
    // Optimistic update
    set((s) => ({
      reviews: s.reviews.map((r) =>
        r.id === id ? { ...r, status, resolvedAt: new Date().toISOString() } : r,
      ),
      pendingReviewCount: s.reviews.filter(
        (r) => r.id !== id && r.status === "pending",
      ).length,
    }));
  },

  // -- System --
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

  // -- Observability --
  observabilityMetrics: null,
  dailyMetrics: [],
  personaSpend: [],
  healthIssues: [],
  observabilityLoading: false,
  fetchObservability: async () => {
    set({ observabilityLoading: true });
    try {
      const data = await api.getObservability();
      set({
        observabilityMetrics: data.metrics,
        dailyMetrics: data.dailyMetrics,
        personaSpend: data.personaSpend,
        healthIssues: data.healthIssues,
      });
    } catch {
      // leave stale
    } finally {
      set({ observabilityLoading: false });
    }
  },

  // -- Usage --
  toolUsage: [],
  toolUsageOverTime: [],
  toolUsageByPersona: [],
  usageLoading: false,
  fetchUsage: async () => {
    set({ usageLoading: true });
    try {
      const data = await api.getUsageAnalytics();
      set({
        toolUsage: data.toolUsage,
        toolUsageOverTime: data.toolUsageOverTime,
        toolUsageByPersona: data.toolUsageByPersona,
      });
    } catch {
      // leave stale
    } finally {
      set({ usageLoading: false });
    }
  },

  // -- UI --
  sidebarTab: "home",
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}));
