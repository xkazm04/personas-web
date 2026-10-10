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
  MOCK_NOTES,
  MOCK_CHAT_SESSIONS,
  MOCK_CHAT_MESSAGES,
  type AthenaActionCost,
  type AthenaLedgerTotals,
  type AthenaUsagePoint,
  type AuditIncident,
  type DirectorPortfolio,
  type DirectorVerdict,
  type HealthCheckSection,
  type ValueRollup,
} from "./mock-dashboard-data";
import { ApiError, type ApiClient, type CommandAck } from "./api";
import { reviewDecideParams, type ReviewDecisionInput } from "./commands/reviewDecide";
import { statusAfterFailedAttempt } from "./eventStatusFsm";
import { AUTO_RETRY_LIMIT } from "./eventWireStatus";
import type { SyncedNote } from "./notes/notesModel";
import type {
  ChatMessage,
  ChatSendInput,
  ChatSession,
  ChatThreadRef,
  ListChatSessionsInput,
} from "./chat/chatModel";
import type { ChannelSayInput } from "./commands/channelSay";
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
  EventStatus,
} from "./types";

/** The demo's commands go to the scripted desktop, which needs no device id. */
const DEMO_TARGET = { demo: true, deviceId: null } as const;

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Reviewer metadata a verdict write carries into the stored payload. */
const REVIEW_METADATA_FIELDS = ["reviewerNotes", "resolvedBy"] as const;

/** Folds `metadata.reviewerNotes` / `metadata.resolvedBy` into the event payload,
 *  where `parseManualReview` reads them back. Unparseable input leaves the payload as is. */
function mergeReviewMetadata(payload: string | null, metadata?: string): string | null {
  if (!metadata) return payload;
  try {
    const meta: unknown = JSON.parse(metadata);
    if (!meta || typeof meta !== "object") return payload;
    const fields: Record<string, string> = {};
    for (const key of REVIEW_METADATA_FIELDS) {
      const value = (meta as Record<string, unknown>)[key];
      if (typeof value === "string") fields[key] = value;
    }
    if (Object.keys(fields).length === 0) return payload;
    const base: unknown = JSON.parse(payload ?? "{}");
    if (!base || typeof base !== "object" || Array.isArray(base)) return payload;
    return JSON.stringify({ ...base, ...fields });
  } catch {
    return payload;
  }
}

/**
 * Monotonic id source for events minted by `publishEvent`. A counter rather
 * than `Math.random()` keeps demo ids stable and readable, and it never runs
 * in a render path.
 */
let publishedEventSeq = 0;

/**
 * The demo has no dispatcher, so the mock plays the desktop's auto-retry
 * sweep on every read: a `failed` row spends one more attempt and, once
 * `AUTO_RETRY_LIMIT` is spent, escalates to `dead_letter` - the desktop's
 * `increment_retry_or_dead_letter` (../personas
 * db/src/repos/communication/events.rs:1309-1350). Without it a `failed` row,
 * which offers no operator verb, would sit in the lane forever.
 */
function sweepFailedEvents(): void {
  MOCK_EVENTS.forEach((ev, i) => {
    if (ev.status !== "failed") return;
    const attempts = (ev.retryCount ?? 0) + 1;
    const status = statusAfterFailedAttempt(attempts, AUTO_RETRY_LIMIT);
    MOCK_EVENTS[i] = { ...ev, status, retryCount: attempts };
  });
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

  getExecution: async (id: string, offset?: number): Promise<ExecutionDetail> => {
    await delay(200);
    return getMockExecutionDetail(id, offset);
  },

  // The demo is a command plane like the live mirror (PHASE2-SPEC.md 6.3):
  // these send to the scripted desktop in mockCommandPlane, which answers on
  // realistic timings and writes the effect through to the fixtures.
  cancelExecution: async (id: string, personaId?: string): Promise<CommandAck> => {
    const owner = personaId ?? MOCK_EXECUTIONS.find((e) => e.id === id)?.personaId ?? "";
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("cancel_execution", owner, { executionId: id }, DEMO_TARGET);
  },

  executePersona: async (personaId: string, prompt: string): Promise<CommandAck> => {
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("run_persona", personaId, { prompt }, DEMO_TARGET);
  },

  pausePersona: async (id: string): Promise<CommandAck> => {
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("pause_persona", id, {}, DEMO_TARGET);
  },

  resumePersona: async (id: string): Promise<CommandAck> => {
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("resume_persona", id, {}, DEMO_TARGET);
  },

  listEvents: async (opts?: {
    eventType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PersonaEvent[]> => {
    await delay();
    sweepFailedEvents();
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
      retryCount: 0,
    };
    MOCK_EVENTS.unshift(event);
    return event;
  },

  updateEvent: async (
    id: string,
    body: { status: EventStatus; metadata?: string; retryCount?: number },
  ): Promise<PersonaEvent> => {
    await delay();
    const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError(404, "Event not found");
    // Write through to the in-session copy (demo-data-plane/network-faithful-mocks):
    // the next listEvents — the review queue's 15s poll, the home page's fetch —
    // must see the verdict, or every committed review snaps back to pending.
    const ev = MOCK_EVENTS[idx];
    const updated: PersonaEvent = {
      ...ev,
      status: body.status,
      // A re-queue clears processed_at, as the desktop's RETRY_DLQ_SQL does,
      // and carries its count on the row (no browser keeps it any more).
      processedAt: body.status === "pending" ? null : new Date().toISOString(),
      retryCount: body.retryCount ?? ev.retryCount,
      payload: mergeReviewMetadata(ev.payload, body.metadata),
      // A drained dead letter stops showing its old failure once processed.
      errorMessage: body.status === "processed" ? null : ev.errorMessage,
    };
    MOCK_EVENTS[idx] = updated;
    return { ...updated };
  },

  // A verdict is a `review_decide` to the scripted desktop (M20), which writes
  // it back through `updateEvent` above, as a desktop's sync would.
  decideReview: async (input: ReviewDecisionInput): Promise<CommandAck> => {
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    const params = reviewDecideParams(input.reviewId, input.decision, input.notes);
    return sendPersonaCommand("review_decide", input.personaId, { ...params }, DEMO_TARGET);
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

  listNotes: async (): Promise<SyncedNote[]> => {
    await delay(250);
    return MOCK_NOTES.map((note) => ({ ...note }));
  },

  // Chat (PHASE2-SPEC.md 5.2, 5.3): the fixtures are the demo computer's synced
  // threads; a send goes to the scripted desktop, which writes the message and,
  // about 4 s later, a canned reply into these same fixtures.
  listChatSessions: async ({ threadKind, personaId }: ListChatSessionsInput): Promise<ChatSession[]> => {
    await delay(200);
    return MOCK_CHAT_SESSIONS.filter(
      (s) => s.threadKind === threadKind && (threadKind === "athena" || !personaId || s.personaId === personaId),
    ).map((s) => ({ ...s }));
  },

  listChatMessages: async ({ threadKind, deviceId, sessionId }: ChatThreadRef): Promise<ChatMessage[]> => {
    await delay(150);
    return MOCK_CHAT_MESSAGES.filter(
      (m) => m.threadKind === threadKind && m.sessionId === sessionId && (deviceId === null || m.deviceId === deviceId),
    ).map((m) => ({ ...m }));
  },

  sendChatMessage: async (input: ChatSendInput): Promise<CommandAck> => {
    // Lazy, like the command plane: chat is not in the dashboard's first load.
    const { ATHENA_PERSONA_ID, chatSendParams } = await import("./chat/chatModel");
    const params = chatSendParams(input.sessionId, input.message);
    if (!params) throw new ApiError(400, input.message.trim() ? "message_too_long" : "empty_message");
    const personaId = input.threadKind === "athena" ? ATHENA_PERSONA_ID : input.personaId;
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("chat_send", personaId, params, DEMO_TARGET);
  },

  sayToMaster: async (input: ChannelSayInput): Promise<CommandAck> => {
    const { channelSayParams } = await import("./commands/channelSay");
    const { sendPersonaCommand } = await import("./commands/personaCommands");
    return sendPersonaCommand("channel_say", input.personaId, { ...channelSayParams(input.message) }, DEMO_TARGET);
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
