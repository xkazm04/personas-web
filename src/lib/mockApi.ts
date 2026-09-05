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
  MOCK_TOOL_USAGE,
  MOCK_TOOL_USAGE_OVER_TIME,
  MOCK_TOOL_USAGE_BY_PERSONA,
  getMockExecutionDetail,
} from "./mockData";
import {
  MOCK_ATHENA_USAGE,
  MOCK_AUDIT_INCIDENTS,
  MOCK_HEALTH_ISSUES,
  MOCK_DISK_USAGE,
  MOCK_HEALTH_CHECKS,
  MOCK_VALUE_ROLLUP,
  MOCK_DIRECTOR_PORTFOLIO,
  MOCK_DIRECTOR_VERDICTS,
  MOCK_ATHENA_ACTION_MIX,
  MOCK_ATHENA_LEDGER,
  type AthenaActionCost,
  type AthenaLedgerTotals,
  type AthenaUsagePoint,
  type AuditIncident,
  type DirectorPortfolio,
  type DirectorVerdict,
  type HealthCheckSection,
  type ValueRollup,
} from "./mock-dashboard-data";
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

/**
 * Monotonic id source for events minted by `publishEvent`. A counter rather
 * than `Math.random()` keeps demo ids stable and readable, and it never runs
 * in a render path.
 */
let publishedEventSeq = 0;

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

  getExecution: async (id: string, offset?: number): Promise<ExecutionDetail> => {
    await delay(200);
    return getMockExecutionDetail(id, offset);
  },

  cancelExecution: async (id: string): Promise<{ executionId: string; status: PersonaExecutionStatus }> => {
    await delay();
    return { executionId: id, status: "cancelled" };
  },

  executePersona: async (_personaId: string, _prompt: string): Promise<{ executionId: string; status: PersonaExecutionStatus }> => {
    await delay(500);
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

  publishEvent: async (input: CreateEventInput): Promise<PersonaEvent> => {
    await delay();
    // This used to `return MOCK_EVENTS[0]` — a literal, unrelated fixture. The
    // store dedupes appended events by id, so every replay in the demo was a
    // silent no-op: the operator clicked Retry and nothing whatsoever entered
    // the bus. Mint a real event from the input instead, and push it onto the
    // fixture array so the next poll of `listEvents` still sees it.
    publishedEventSeq += 1;
    const now = new Date().toISOString();
    const event: PersonaEvent = {
      id: `ev-published-${publishedEventSeq}-mock`,
      projectId: "mock-project",
      eventType: input.eventType,
      sourceType: input.sourceType,
      sourceId: input.sourceId ?? null,
      targetPersonaId: input.targetPersonaId ?? null,
      payload: input.payload ?? null,
      status: "pending",
      errorMessage: null,
      processedAt: null,
      useCaseId: null,
      createdAt: now,
    };
    MOCK_EVENTS.unshift(event);
    return event;
  },

  updateEvent: async (id: string, body: { status: EventStatus; metadata?: string }): Promise<PersonaEvent> => {
    await delay();
    const index = MOCK_EVENTS.findIndex((e) => e.id === id);
    if (index === -1) throw new ApiError(404, "Event not found");
    // Write the transition back into the fixture array. Returning a detached
    // copy meant the next `listEvents` poll merged the stale status straight
    // back over the store, so a drained dead letter row reappeared within 10s.
    const updated: PersonaEvent = {
      ...MOCK_EVENTS[index],
      status: body.status,
      processedAt: new Date().toISOString(),
      errorMessage: body.status === "processed" ? null : MOCK_EVENTS[index].errorMessage,
    };
    MOCK_EVENTS[index] = updated;
    return updated;
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

  // Tiered field-selected variants — fastest (metrics) → slowest (joins)
  // so the progressive-reveal page can render each tier as it arrives.
  getObservabilityMetrics: async (): Promise<ObservabilityMetrics> => {
    await delay(100);
    return { ...MOCK_OBSERVABILITY_METRICS };
  },

  getObservabilityDaily: async (): Promise<DailyMetric[]> => {
    await delay(300);
    return [...MOCK_DAILY_METRICS];
  },

  getObservabilityPersonaSpend: async (): Promise<PersonaSpend[]> => {
    await delay(600);
    return [...MOCK_PERSONA_SPEND];
  },

  getObservabilityHealthIssues: async (): Promise<HealthIssue[]> => {
    await delay(600);
    return [...MOCK_HEALTH_ISSUES];
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

/**
 * Audit-log incidents for the Incidents Inbox. Demo-only — incidents have no
 * faithful synced source, so this is a standalone mock fetcher (not part of the
 * real `ApiClient`); callers import it directly rather than via the `api`
 * proxy. Simulates fetch latency so the surface can show a loading state.
 */
export async function getAuditIncidents(): Promise<AuditIncident[]> {
  await delay(300);
  return [...MOCK_AUDIT_INCIDENTS];
}

/**
 * System-health snapshot for the System Health Panel. Demo-only standalone
 * fetcher (not part of the real `ApiClient`); simulates latency for a loading
 * state. Returns the four check sections plus the disk-usage gauge.
 */
export async function getSystemHealth(): Promise<{
  sections: HealthCheckSection[];
  diskUsage: { usedGb: number; totalGb: number };
}> {
  await delay(300);
  return { sections: MOCK_HEALTH_CHECKS.map((s) => ({ ...s })), diskUsage: { ...MOCK_DISK_USAGE } };
}

/**
 * Director coaching snapshot for /dashboard/director: portfolio scorecard,
 * roster with verdict history, and the recent coaching-verdict feed. Demo-only
 * standalone fetcher (not part of the real `ApiClient`); callers import it
 * directly rather than via the `api` proxy. Simulates fetch latency so the
 * surface can show a loading state.
 */
export async function getDirectorSnapshot(): Promise<{
  portfolio: DirectorPortfolio;
  verdicts: DirectorVerdict[];
}> {
  await delay(300);
  return {
    portfolio: {
      ...MOCK_DIRECTOR_PORTFOLIO,
      breakdown: { ...MOCK_DIRECTOR_PORTFOLIO.breakdown },
      scoreDistribution: MOCK_DIRECTOR_PORTFOLIO.scoreDistribution.map((b) => ({ ...b })),
      roster: MOCK_DIRECTOR_PORTFOLIO.roster.map((r) => ({ ...r, scoreTrend: [...r.scoreTrend] })),
    },
    verdicts: MOCK_DIRECTOR_VERDICTS.map((v) => ({ ...v })),
  };
}

/**
 * Activity-metrics snapshot for the observability Activity tab: Athena
 * cost-by-action series, the value-delivered rollup, the op-grammar action
 * mix, and the turn-ledger spend totals. Demo-only standalone fetcher (not
 * part of the real `ApiClient`).
 */
export async function getActivityMetrics(): Promise<{
  athenaUsage: AthenaUsagePoint[];
  valueRollup: ValueRollup;
  athenaActionMix: AthenaActionCost[];
  athenaLedger: AthenaLedgerTotals;
}> {
  await delay(300);
  return {
    athenaUsage: MOCK_ATHENA_USAGE.map((p) => ({ ...p })),
    valueRollup: { ...MOCK_VALUE_ROLLUP },
    athenaActionMix: MOCK_ATHENA_ACTION_MIX.map((a) => ({ ...a })),
    athenaLedger: { ...MOCK_ATHENA_LEDGER },
  };
}
