import * as Sentry from "@sentry/nextjs";
import { useAuthStore } from "@/stores/authStore";
import { mockApi } from "./mockApi";
import { supabaseApi } from "./supabaseApi";
import {
  OrchestratorConfigError,
  validateOrchestratorUrl,
} from "./orchestrator-config";

export { OrchestratorConfigError };
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

function getOrchestratorBase(): string {
  return validateOrchestratorUrl(process.env.NEXT_PUBLIC_ORCHESTRATOR_URL);
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 15_000;

async function orchestratorFetch<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | undefined>;
    timeoutMs?: number;
  },
): Promise<T> {
  const { accessToken, initialized } = useAuthStore.getState();

  if (!initialized) {
    throw new Error(
      `orchestratorFetch("${path}"): auth store has not been initialized. ` +
        "API calls require AuthProvider to have run first (only happens under /dashboard routes). " +
        "If you need to call the API outside the dashboard, ensure auth is initialized beforehand.",
    );
  }

  const base = getOrchestratorBase();
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

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: options?.method ?? "GET",
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`API request timed out: ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

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
  getObservabilityMetrics(): Promise<ObservabilityMetrics>;
  getObservabilityDaily(): Promise<DailyMetric[]>;
  getObservabilityPersonaSpend(): Promise<PersonaSpend[]>;
  getObservabilityHealthIssues(): Promise<HealthIssue[]>;
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
        const settled = await Promise.allSettled(
          personas.map((p) =>
            orchestratorFetch<PersonaEventSubscription[]>(
              `/api/personas/${p.id}/subscriptions`,
            ),
          ),
        );
        const fulfilled: PersonaEventSubscription[] = [];
        for (let i = 0; i < settled.length; i++) {
          const result = settled[i];
          if (result.status === "fulfilled") {
            fulfilled.push(...result.value);
          } else {
            const personaId = personas[i]?.id;
            Sentry.captureException(result.reason, {
              tags: { scope: "listAllSubscriptions" },
              contexts: { persona: { id: personaId } },
            });
          }
        }
        return fulfilled;
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

      // Observability — full payload. Use this when a consumer needs every tier
      // at once (the Performance view); single-tier consumers use the
      // field-selected variants below so they fetch only what they render.
      getObservability: () =>
        orchestratorFetch<{
          metrics: ObservabilityMetrics;
          dailyMetrics: DailyMetric[];
          personaSpend: PersonaSpend[];
          healthIssues: HealthIssue[];
        }>("/api/observability"),

      getObservabilityMetrics: () =>
        orchestratorFetch<ObservabilityMetrics>("/api/observability", {
          params: { fields: "metrics" },
        }),

      getObservabilityDaily: () =>
        orchestratorFetch<DailyMetric[]>("/api/observability", {
          params: { fields: "daily" },
        }),

      getObservabilityPersonaSpend: () =>
        orchestratorFetch<PersonaSpend[]>("/api/observability", {
          params: { fields: "personaSpend" },
        }),

      getObservabilityHealthIssues: () =>
        orchestratorFetch<HealthIssue[]>("/api/observability", {
          params: { fields: "healthIssues" },
        }),

      // Usage analytics
      getUsageAnalytics: () =>
        orchestratorFetch<{
          toolUsage: ToolUsageSummary[];
          toolUsageOverTime: ToolUsageOverTime[];
          toolUsageByPersona: ToolUsageByPersona[];
        }>("/api/usage"),
    };

/**
 * Which production data plane to use:
 *   - `supabaseApi` — the desktop → Supabase sync mirror (read-only), when
 *     `NEXT_PUBLIC_DATA_SOURCE=supabase`.
 *   - `realApi` — the orchestrator REST API (default; left untouched).
 * Demo/dev always use the mock.
 */
const USE_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/**
 * Dynamic API dispatch: uses mockApi when the user entered via the "Try Demo"
 * button (isDemo flag in auth store); otherwise the Supabase mirror or the
 * orchestrator depending on NEXT_PUBLIC_DATA_SOURCE. Behaviour is identical in
 * every environment — demo is always an explicit user choice, never auto-on.
 */
export const api: ApiClient = new Proxy({} as ApiClient, {
  get(_target, prop: string | symbol) {
    const { isDemo } = useAuthStore.getState();
    if (isDemo) return mockApi[prop as keyof ApiClient];
    const impl = USE_SUPABASE ? supabaseApi : realApi;
    return impl[prop as keyof ApiClient];
  },
});
