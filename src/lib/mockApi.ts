// Layer 3 of 3 in the demo mocks: behaviour only, the demo `ApiClient` and the
// standalone async getters. Fixture data lives below it, in ./mockData (what
// `ApiClient` serves) or ./mock-dashboard-data (dashboard-only fixtures); never
// declare a MOCK_* constant here. Pinned by mockModuleLayers.test.ts.
import {
  MOCK_PERSONAS,
  MOCK_EXECUTIONS,
  MOCK_EVENTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_TRIGGERS,
  MOCK_HEALTH,
  MOCK_STATUS,
  MOCK_TOOL_USAGE,
  MOCK_TOOL_USAGE_OVER_TIME,
  MOCK_TOOL_USAGE_BY_PERSONA,
  getMockExecutionDetail,
} from "./mockData";
import {
  MOCK_ATHENA_USAGE,
  MOCK_DISK_USAGE,
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
  type LeaderboardPersona,
  MOCK_LEARNED_MEMORIES,
  MOCK_MEMORIES,
  type MemoryItem,
  type ValueRollup,
} from "./mock-dashboard-data";
import { memoryItemFromSynced } from "./knowledgeMemories";
import { crewWorld } from "./demoWorld/crew";
import type { ChartAnnotation } from "./observabilitySeries";
import { ApiError, type ApiClient, type CommandAck } from "./api";
import { currentDemoThreads, DEMO_THREAD_KEYS } from "./demoThreads";
import { correlate, DEMO_CORRELATION_WINDOW_MS, demoSignals, type Incident } from "./incidentCorrelate";
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

/**
 * The demo world's reads (src/lib/demoWorld/fleetReads.ts): the run log and
 * every aggregate of it, over the Board's 99 agents. Loaded on the first read
 * that needs it, so neither it nor `fleet.json` is in the dashboard's first
 * load; held once loaded, so a cache write (lib/demoCauseFix.ts) can read it
 * synchronously.
 */
type FleetReads = typeof import("./demoWorld/fleetReads");
let fleetReadsModule: FleetReads | null = null;

async function fleetReads(): Promise<FleetReads> {
  fleetReadsModule ??= await import("./demoWorld/fleetReads");
  return fleetReadsModule;
}

/** The session as the world's reads see it: its rows and its roster, now. */
const session = () => ({ rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS });

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

  // Writes through like the desktop's cascade: the persona, its executions,
  // triggers and subscriptions go, so the next list read agrees. Events stay
  // (they are history). An unknown id is a 404, never a silent success.
  deletePersona: async (id: string): Promise<{ deleted: boolean }> => {
    await delay();
    const idx = MOCK_PERSONAS.findIndex((p) => p.id === id);
    if (idx === -1) throw new ApiError(404, "Persona not found");
    MOCK_PERSONAS.splice(idx, 1);
    for (let i = MOCK_EXECUTIONS.length - 1; i >= 0; i--) {
      if (MOCK_EXECUTIONS[i].personaId === id) MOCK_EXECUTIONS.splice(i, 1);
    }
    delete MOCK_TRIGGERS[id];
    delete MOCK_SUBSCRIPTIONS[id];
    return { deleted: true };
  },

  // The world's run log (99 agents, 14 days) with the session's rows, newest
  // first, filtered and paged as the real planes do (`limit` honoured when given).
  listExecutions: async (opts?: ExecFilterOpts): Promise<PersonaExecution[]> => {
    await delay();
    return (await fleetReads()).listWorldExecutions(session(), opts);
  },

  getExecution: async (id: string, offset?: number): Promise<ExecutionDetail> => {
    await delay(200);
    const detail = getMockExecutionDetail(id, offset);
    if (!("unavailable" in detail)) return detail;
    const world = (await fleetReads()).worldExecutionDetail(id);
    // The real planes' contract for an id they do not hold (supabaseApi.getExecution).
    if (!world) throw new ApiError(404, "Execution not found");
    return world;
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
    await delay(300);
    return observabilityFrom(await fleetReads());
  },

  // Tiered field-selected variants — fastest (metrics) → slowest (joins)
  // so the progressive-reveal page can render each tier as it arrives. Each
  // is a fold of the same log, so the tiers agree with each other.
  getObservabilityMetrics: async (): Promise<ObservabilityMetrics> => {
    await delay(100);
    return (await fleetReads()).observabilityOf(session()).metrics;
  },

  getObservabilityDaily: async (): Promise<DailyMetric[]> => {
    await delay(300);
    return (await fleetReads()).observabilityOf(session()).dailyMetrics;
  },

  getObservabilityPersonaSpend: async (): Promise<PersonaSpend[]> => {
    await delay(600);
    return (await fleetReads()).observabilityOf(session()).personaSpend;
  },

  getObservabilityHealthIssues: async (): Promise<HealthIssue[]> => {
    await delay(600);
    return healthIssuesSnapshot();
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
  return auditIncidentsSnapshot();
}

/**
 * The audit incidents and the other routes' signals, correlated into
 * incidents (lib/incidentCorrelate.ts) over the session's projection, so a
 * fixed cause's incident reads resolved. Demo-only standalone fetcher.
 */
export async function getCorrelatedIncidents(): Promise<Incident[]> {
  await delay(300);
  return correlatedIncidentsSnapshot();
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
  return systemHealthSnapshot();
}

/** Each crew persona's most recent run (by creation time): the session's rows and the world's log. */
function latestRunByPersona(): Record<string, string> {
  const latest: Record<string, { id: string; at: number }> = {};
  const consider = (personaId: string, id: string, at: number) => {
    const held = latest[personaId];
    if (!held || at > held.at) latest[personaId] = { id, at };
  };
  for (const e of MOCK_EXECUTIONS) consider(e.personaId, e.id, Date.parse(e.createdAt));
  for (const log of crewWorld().logs) {
    const newest = log.runs[0];
    if (newest && MOCK_PERSONAS.some((p) => p.id === log.agent.personaId)) consider(log.agent.personaId, newest.id, newest.at);
  }
  return Object.fromEntries(Object.entries(latest).map(([personaId, run]) => [personaId, run.id]));
}

/**
 * Inputs for the System Health blast-radius panel: who calls which tools, the
 * SLA breaches, the fleet size, and each agent's latest run (its chip opens
 * it). Demo-only standalone fetcher.
 */
export async function getBlastRadiusInputs() {
  await delay(300);
  return blastRadiusInputsSnapshot();
}

// ── Thread-member reads ─────────────────────────────────────────────
// Every demo read that serves a member of an incident thread goes through the
// session's projection (lib/settleThread.ts via currentDemoThreads), here and
// nowhere else, so a fixed cause reads settled on every route at once. The
// synchronous snapshots back both the async getters above and the cache write
// a fix makes (lib/demoCauseFix.ts), keyed by the SWR key each hook reads.

function auditIncidentsSnapshot(): AuditIncident[] {
  return [...currentDemoThreads().auditIncidents];
}

function correlatedIncidentsSnapshot(): Incident[] {
  return correlate(demoSignals(currentDemoThreads()), { windowMs: DEMO_CORRELATION_WINDOW_MS });
}

function systemHealthSnapshot() {
  return {
    sections: currentDemoThreads().healthChecks.map((s) => ({ ...s })),
    diskUsage: { ...MOCK_DISK_USAGE },
  };
}

function blastRadiusInputsSnapshot() {
  return {
    usage: MOCK_TOOL_USAGE_BY_PERSONA,
    breaches: currentDemoThreads().slaBreaches.map((b) => ({ id: b.id, persona: b.persona, resolvedAt: b.resolvedAt })),
    totalPersonas: MOCK_PERSONAS.length,
    latestRunByPersona: latestRunByPersona(),
  };
}

function healthIssuesSnapshot(): HealthIssue[] {
  return [...currentDemoThreads().healthIssues];
}

function observabilityFrom(reads: FleetReads): {
  metrics: ObservabilityMetrics;
  dailyMetrics: DailyMetric[];
  personaSpend: PersonaSpend[];
  healthIssues: HealthIssue[];
} {
  const { metrics, dailyMetrics, personaSpend } = reads.observabilityOf(session());
  return { metrics, dailyMetrics, personaSpend, healthIssues: healthIssuesSnapshot() };
}

/**
 * The observability read as it would answer now, or undefined before the
 * world has loaded: nothing can hold that key yet, and the first read serves
 * the settled thread anyway.
 */
function observabilitySnapshot() {
  return fleetReadsModule ? observabilityFrom(fleetReadsModule) : undefined;
}

/**
 * Each thread-member SWR key's demo value, as its getter would return it now
 * (undefined: not readable yet, so no reader holds it; leave the key alone).
 */
export const DEMO_THREAD_SNAPSHOTS: Record<(typeof DEMO_THREAD_KEYS)[keyof typeof DEMO_THREAD_KEYS], () => unknown> = {
  [DEMO_THREAD_KEYS.systemHealth]: systemHealthSnapshot,
  [DEMO_THREAD_KEYS.blastInputs]: blastRadiusInputsSnapshot,
  [DEMO_THREAD_KEYS.auditIncidents]: auditIncidentsSnapshot,
  [DEMO_THREAD_KEYS.incidentClusters]: correlatedIncidentsSnapshot,
  [DEMO_THREAD_KEYS.observability]: observabilitySnapshot,
  [DEMO_THREAD_KEYS.healthIssues]: healthIssuesSnapshot,
};

/**
 * Knowledge > Memories for the demo: what the scripted desktop learned from
 * this session's review verdicts (MOCK_LEARNED_MEMORIES, newest first), then
 * the seeded set. Learned rows are desktop persona-memory rows and are read
 * through the same mapper real mode uses for synced rows. Demo-only standalone
 * fetcher; the command store refreshes its SWR key when the desktop writes.
 */
export async function getKnowledgeMemories(): Promise<MemoryItem[]> {
  await delay(150);
  const nameById = new Map(MOCK_PERSONAS.map((p) => [p.id, p.name]));
  return [
    ...MOCK_LEARNED_MEMORIES.map((m) => memoryItemFromSynced(m, nameById.get(m.personaId) ?? m.personaId)),
    ...MOCK_MEMORIES.map((m) => ({ ...m })),
  ];
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

/**
 * The demo leaderboard: `standings()` (the engine the Supabase plane ranks
 * synced snapshots with) over the world's daily snapshots, the whole demo
 * fleet ranked. Demo-only standalone fetcher.
 */
export async function getDemoLeaderboard(): Promise<LeaderboardPersona[]> {
  await delay(300);
  return (await fleetReads()).worldLeaderboard(session());
}

/**
 * What the Performance tab overlays on the window, from the same log: the
 * prior 14 days (Compare and the trends), the agents active each day (the
 * active-agents sparkline), the chart annotations and the population the
 * figures cover. Demo-only standalone
 * fetcher; real mode has no prior period and hides these.
 */
export async function getObservabilityWorld(): Promise<{
  prior: DailyMetric[];
  activeAgents: number[];
  annotations: ChartAnnotation[];
  /** The agents the window's figures cover (the demo fleet). */
  agents: number;
}> {
  await delay(300);
  const reads = await fleetReads();
  const { dailyMetrics, prior, activeAgents, agents } = reads.observabilityOf(session());
  return { prior, activeAgents, agents, annotations: reads.worldAnnotations(dailyMetrics) };
}
