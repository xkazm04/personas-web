import { useAuthStore } from "@/stores/authStore";
import { DEVELOPMENT } from "./dev";
import {
  MOCK_PERSONAS,
  MOCK_EXECUTIONS,
  MOCK_EVENTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_TRIGGERS,
  MOCK_HEALTH,
  MOCK_STATUS,
  MOCK_REVIEWS,
  MOCK_OBSERVABILITY_METRICS,
  MOCK_DAILY_METRICS,
  MOCK_PERSONA_SPEND,
  MOCK_HEALTH_ISSUES,
  MOCK_TOOL_USAGE,
  MOCK_TOOL_USAGE_OVER_TIME,
  MOCK_TOOL_USAGE_BY_PERSONA,
  getMockExecutionDetail,
  resetMockOutputOffset,
} from "./mockData";
import type {
  Persona,
  PersonaExecution,
  PersonaEvent,
  PersonaEventSubscription,
  PersonaTrigger,
  ExecutionDetail,
  HealthResponse,
  StatusResponse,
  CreateEventInput,
  ExecFilterOpts,
  ObservabilityMetrics,
  DailyMetric,
  PersonaSpend,
  HealthIssue,
  ToolUsageSummary,
  ToolUsageOverTime,
  ToolUsageByPersona,
} from "./types";

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}: ${body}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function orchestratorFetch<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | undefined>;
  },
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const base = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL;
  const url = new URL(path, base);

  if (options?.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.NEXT_PUBLIC_TEAM_API_KEY;
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  if (accessToken) {
    headers["X-User-Token"] = accessToken;
  }

  const res = await fetch(url.toString(), {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ---------------------------------------------------------------------------
// Mock API (dev mode)
// ---------------------------------------------------------------------------

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const mockApi = {
  listPersonas: async (): Promise<Persona[]> => {
    await delay();
    return [...MOCK_PERSONAS];
  },

  getPersona: async (id: string): Promise<Persona> => {
    await delay();
    const p = MOCK_PERSONAS.find((pp) => pp.id === id);
    if (!p) throw new ApiError(404, "Persona not found");
    return { ...p };
  },

  deletePersona: async (_id: string): Promise<{ deleted: boolean }> => {
    await delay();
    return { deleted: true };
  },

  listExecutions: async (_opts?: ExecFilterOpts): Promise<PersonaExecution[]> => {
    await delay();
    let result = [...MOCK_EXECUTIONS];
    if (_opts?.personaId) {
      result = result.filter((e) => e.personaId === _opts.personaId);
    }
    if (_opts?.status) {
      result = result.filter((e) => e.status === _opts.status);
    }
    return result;
  },

  getExecution: async (id: string, _offset?: number): Promise<ExecutionDetail> => {
    await delay(200);
    return getMockExecutionDetail(id);
  },

  cancelExecution: async (id: string): Promise<{ executionId: string; status: string }> => {
    await delay();
    return { executionId: id, status: "cancelled" };
  },

  executePersona: async (personaId: string, _prompt: string): Promise<{ executionId: string; status: string }> => {
    await delay(500);
    resetMockOutputOffset();
    return { executionId: `e-new-${Date.now()}`, status: "queued" };
  },

  listEvents: async (opts?: {
    eventType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PersonaEvent[]> => {
    await delay();
    let result = [...MOCK_EVENTS];
    if (opts?.eventType) {
      result = result.filter((e) => e.eventType === opts.eventType);
    }
    if (opts?.status) {
      result = result.filter((e) => e.status === opts.status);
    }
    return result;
  },

  publishEvent: async (_input: CreateEventInput): Promise<PersonaEvent> => {
    await delay();
    return MOCK_EVENTS[0];
  },

  updateEvent: async (id: string, body: { status: string; metadata?: string }): Promise<PersonaEvent> => {
    await delay();
    const ev = MOCK_EVENTS.find((e) => e.id === id);
    if (!ev) throw new ApiError(404, "Event not found");
    return { ...ev, status: body.status, processedAt: new Date().toISOString() };
  },

  listSubscriptions: async (personaId: string): Promise<PersonaEventSubscription[]> => {
    await delay(150);
    return [...(MOCK_SUBSCRIPTIONS[personaId] ?? [])];
  },

  listTriggers: async (personaId: string): Promise<PersonaTrigger[]> => {
    await delay(150);
    return [...(MOCK_TRIGGERS[personaId] ?? [])];
  },

  getHealth: async (): Promise<HealthResponse> => {
    await delay(100);
    return { ...MOCK_HEALTH, timestamp: Date.now() };
  },

  getStatus: async (): Promise<StatusResponse> => {
    await delay(200);
    return { ...MOCK_STATUS };
  },

  getObservability: async (): Promise<{
    metrics: ObservabilityMetrics;
    dailyMetrics: DailyMetric[];
    personaSpend: PersonaSpend[];
    healthIssues: HealthIssue[];
  }> => {
    await delay(300);
    return {
      metrics: { ...MOCK_OBSERVABILITY_METRICS },
      dailyMetrics: [...MOCK_DAILY_METRICS],
      personaSpend: [...MOCK_PERSONA_SPEND],
      healthIssues: [...MOCK_HEALTH_ISSUES],
    };
  },

  getUsageAnalytics: async (): Promise<{
    toolUsage: ToolUsageSummary[];
    toolUsageOverTime: ToolUsageOverTime[];
    toolUsageByPersona: ToolUsageByPersona[];
  }> => {
    await delay(300);
    return {
      toolUsage: [...MOCK_TOOL_USAGE],
      toolUsageOverTime: [...MOCK_TOOL_USAGE_OVER_TIME],
      toolUsageByPersona: [...MOCK_TOOL_USAGE_BY_PERSONA],
    };
  },
};

// ---------------------------------------------------------------------------
// API namespace
// ---------------------------------------------------------------------------

export const api = DEVELOPMENT
  ? mockApi
  : {
      // Personas
      listPersonas: () => orchestratorFetch<Persona[]>("/api/personas"),

      getPersona: (id: string) =>
        orchestratorFetch<Persona>(`/api/personas/${id}`),

      deletePersona: (id: string) =>
        orchestratorFetch<{ deleted: boolean }>(`/api/personas/${id}`, {
          method: "DELETE",
        }),

      // Executions
      listExecutions: (opts?: ExecFilterOpts) =>
        orchestratorFetch<PersonaExecution[]>("/api/executions", {
          params: {
            personaId: opts?.personaId,
            status: opts?.status,
            limit: opts?.limit?.toString(),
            offset: opts?.offset?.toString(),
          },
        }),

      getExecution: (id: string, offset?: number) =>
        orchestratorFetch<ExecutionDetail>(`/api/executions/${id}`, {
          params:
            offset !== undefined ? { offset: String(offset) } : undefined,
        }),

      cancelExecution: (id: string) =>
        orchestratorFetch<{ executionId: string; status: string }>(
          `/api/executions/${id}/cancel`,
          { method: "POST" },
        ),

      executePersona: (personaId: string, prompt: string) =>
        orchestratorFetch<{ executionId: string; status: string }>(
          "/api/execute",
          {
            method: "POST",
            body: { personaId, prompt },
          },
        ),

      // Events
      listEvents: (opts?: {
        eventType?: string;
        status?: string;
        limit?: number;
        offset?: number;
      }) =>
        orchestratorFetch<PersonaEvent[]>("/api/events", {
          params: {
            eventType: opts?.eventType,
            status: opts?.status,
            limit: opts?.limit?.toString(),
            offset: opts?.offset?.toString(),
          },
        }),

      publishEvent: (input: CreateEventInput) =>
        orchestratorFetch<PersonaEvent>("/api/events", {
          method: "POST",
          body: input,
        }),

      updateEvent: (
        id: string,
        body: { status: string; metadata?: string },
      ) =>
        orchestratorFetch<PersonaEvent>(`/api/events/${id}`, {
          method: "PUT",
          body,
        }),

      // Subscriptions
      listSubscriptions: (personaId: string) =>
        orchestratorFetch<PersonaEventSubscription[]>(
          `/api/personas/${personaId}/subscriptions`,
        ),

      // Triggers
      listTriggers: (personaId: string) =>
        orchestratorFetch<PersonaTrigger[]>(
          `/api/personas/${personaId}/triggers`,
        ),

      // System
      getHealth: () => orchestratorFetch<HealthResponse>("/health"),

      getStatus: () => orchestratorFetch<StatusResponse>("/api/status"),

      // Observability
      getObservability: () =>
        orchestratorFetch<{
          metrics: ObservabilityMetrics;
          dailyMetrics: DailyMetric[];
          personaSpend: PersonaSpend[];
          healthIssues: HealthIssue[];
        }>("/api/observability"),

      // Usage analytics
      getUsageAnalytics: () =>
        orchestratorFetch<{
          toolUsage: ToolUsageSummary[];
          toolUsageOverTime: ToolUsageOverTime[];
          toolUsageByPersona: ToolUsageByPersona[];
        }>("/api/usage"),
    };
