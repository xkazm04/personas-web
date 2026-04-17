import {
  MOCK_PERSONAS,
  MOCK_EXECUTIONS,
  MOCK_EVENTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_TRIGGERS,
  MOCK_HEALTH,
  MOCK_STATUS,
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
import { ApiError, type ApiClient } from "./api";
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

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockApi: ApiClient = {
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

  cancelExecution: async (id: string): Promise<{ executionId: string; status: PersonaExecutionStatus }> => {
    await delay();
    return { executionId: id, status: "cancelled" };
  },

  executePersona: async (_personaId: string, _prompt: string): Promise<{ executionId: string; status: PersonaExecutionStatus }> => {
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

  updateEvent: async (id: string, body: { status: EventStatus; metadata?: string }): Promise<PersonaEvent> => {
    await delay();
    const ev = MOCK_EVENTS.find((e) => e.id === id);
    if (!ev) throw new ApiError(404, "Event not found");
    return { ...ev, status: body.status, processedAt: new Date().toISOString() };
  },

  listSubscriptions: async (personaId: string): Promise<PersonaEventSubscription[]> => {
    await delay(150);
    return [...(MOCK_SUBSCRIPTIONS[personaId] ?? [])];
  },

  listAllSubscriptions: async (): Promise<PersonaEventSubscription[]> => {
    await delay(150);
    return Object.values(MOCK_SUBSCRIPTIONS).flat();
  },

  createSubscription: async (input: {
    personaId: string;
    eventType: string;
    sourceFilter?: string;
  }): Promise<PersonaEventSubscription> => {
    await delay(200);
    const sub: PersonaEventSubscription = {
      id: `sub-${Date.now()}`,
      personaId: input.personaId,
      eventType: input.eventType,
      sourceFilter: input.sourceFilter ?? null,
      enabled: true,
      useCaseId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const arr = MOCK_SUBSCRIPTIONS[input.personaId] ?? [];
    arr.push(sub);
    MOCK_SUBSCRIPTIONS[input.personaId] = arr;
    return sub;
  },

  updateSubscription: async (
    personaId: string,
    subId: string,
    body: { enabled?: boolean; eventType?: string; sourceFilter?: string | null },
  ): Promise<PersonaEventSubscription> => {
    await delay(200);
    const subs = MOCK_SUBSCRIPTIONS[personaId] ?? [];
    const idx = subs.findIndex((s) => s.id === subId);
    if (idx === -1) throw new ApiError(404, "Subscription not found");
    const updated = { ...subs[idx], ...body, updatedAt: new Date().toISOString() };
    subs[idx] = updated;
    return updated;
  },

  deleteSubscription: async (personaId: string, subId: string): Promise<void> => {
    await delay(200);
    const subs = MOCK_SUBSCRIPTIONS[personaId] ?? [];
    MOCK_SUBSCRIPTIONS[personaId] = subs.filter((s) => s.id !== subId);
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
    const [metrics, dailyMetrics, personaSpend, healthIssues] = await Promise.all([
      delay(300).then(() => ({ ...MOCK_OBSERVABILITY_METRICS })),
      delay(300).then(() => [...MOCK_DAILY_METRICS]),
      delay(300).then(() => [...MOCK_PERSONA_SPEND]),
      delay(300).then(() => [...MOCK_HEALTH_ISSUES]),
    ]);

    return {
      metrics,
      dailyMetrics,
      personaSpend,
      healthIssues,
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
