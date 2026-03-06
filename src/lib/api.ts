import { useAuthStore } from "@/stores/authStore";
import { DEVELOPMENT } from "./dev";
import { mockApi } from "./mockApi";
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
  PersonaExecutionStatus,
  EventStatus,
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
// Shared interface — enforces parity between mock and real implementations
// ---------------------------------------------------------------------------

export interface ApiClient {
  listPersonas(): Promise<Persona[]>;
  getPersona(id: string): Promise<Persona>;
  deletePersona(id: string): Promise<{ deleted: boolean }>;
  listExecutions(opts?: ExecFilterOpts): Promise<PersonaExecution[]>;
  getExecution(id: string, offset?: number): Promise<ExecutionDetail>;
  cancelExecution(id: string): Promise<{ executionId: string; status: PersonaExecutionStatus }>;
  executePersona(personaId: string, prompt: string): Promise<{ executionId: string; status: PersonaExecutionStatus }>;
  listEvents(opts?: { eventType?: string; status?: string; limit?: number; offset?: number }): Promise<PersonaEvent[]>;
  publishEvent(input: CreateEventInput): Promise<PersonaEvent>;
  updateEvent(id: string, body: { status: EventStatus; metadata?: string }): Promise<PersonaEvent>;
  listSubscriptions(personaId: string): Promise<PersonaEventSubscription[]>;
  listAllSubscriptions(): Promise<PersonaEventSubscription[]>;
  createSubscription(input: { personaId: string; eventType: string; sourceFilter?: string }): Promise<PersonaEventSubscription>;
  updateSubscription(personaId: string, subId: string, body: { enabled?: boolean; eventType?: string; sourceFilter?: string | null }): Promise<PersonaEventSubscription>;
  deleteSubscription(personaId: string, subId: string): Promise<void>;
  listTriggers(personaId: string): Promise<PersonaTrigger[]>;
  getHealth(): Promise<HealthResponse>;
  getStatus(): Promise<StatusResponse>;
  getObservability(): Promise<{ metrics: ObservabilityMetrics; dailyMetrics: DailyMetric[]; personaSpend: PersonaSpend[]; healthIssues: HealthIssue[] }>;
  getUsageAnalytics(): Promise<{ toolUsage: ToolUsageSummary[]; toolUsageOverTime: ToolUsageOverTime[]; toolUsageByPersona: ToolUsageByPersona[] }>;
}

// ---------------------------------------------------------------------------
// Real API implementation
// ---------------------------------------------------------------------------

const realApi: ApiClient = {
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
        orchestratorFetch<{ executionId: string; status: PersonaExecutionStatus }>(
          `/api/executions/${id}/cancel`,
          { method: "POST" },
        ),

      executePersona: (personaId: string, prompt: string) =>
        orchestratorFetch<{ executionId: string; status: PersonaExecutionStatus }>(
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
        body: { status: EventStatus; metadata?: string },
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

      listAllSubscriptions: async () => {
        const personas = await orchestratorFetch<Persona[]>("/api/personas");
        const results = await Promise.all(
          personas.map((p) =>
            orchestratorFetch<PersonaEventSubscription[]>(
              `/api/personas/${p.id}/subscriptions`,
            ),
          ),
        );
        return results.flat();
      },

      createSubscription: (input: {
        personaId: string;
        eventType: string;
        sourceFilter?: string;
      }) =>
        orchestratorFetch<PersonaEventSubscription>(
          `/api/personas/${input.personaId}/subscriptions`,
          { method: "POST", body: input },
        ),

      updateSubscription: (
        personaId: string,
        subId: string,
        body: { enabled?: boolean; eventType?: string; sourceFilter?: string | null },
      ) =>
        orchestratorFetch<PersonaEventSubscription>(
          `/api/personas/${personaId}/subscriptions/${subId}`,
          { method: "PUT", body },
        ),

      deleteSubscription: (personaId: string, subId: string) =>
        orchestratorFetch<void>(
          `/api/personas/${personaId}/subscriptions/${subId}`,
          { method: "DELETE" },
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

export const api: ApiClient = DEVELOPMENT ? mockApi : realApi;
