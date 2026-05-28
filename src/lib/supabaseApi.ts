/**
 * ApiClient implementation backed by the desktop → Supabase sync mirror.
 *
 * Reads the `synced_*` tables the desktop writer populates. Row isolation is
 * automatic: the shared Supabase client carries the signed-in user's session,
 * so RLS (`user_id = auth.uid()`) returns only their rows. Columns are
 * snake_case (mirroring the desktop); we map to the camelCase web types here.
 *
 * This is a READ mirror. Write/action methods (execute, cancel, delete,
 * publish, subscriptions) are not available in cloud-sync mode — remotely
 * driving the desktop is Phase 2 (approval-gated `pending_commands`). They
 * throw a clear error rather than silently no-op.
 */
import { getSupabase } from "./supabase";
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const READ_ONLY = "Cloud-sync mode is read-only — remote control ships in Phase 2.";

function readOnly(): never {
  throw new ApiError(501, READ_ONLY);
}

/** Await a supabase query, throwing a uniform ApiError on failure. */
async function rows<T>(
  builder: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const { data, error } = await builder;
  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

function mapStatus(s: string): PersonaExecutionStatus {
  // The desktop allows an `incomplete` status the web type doesn't model.
  return s === "incomplete" ? "failed" : (s as PersonaExecutionStatus);
}

/** Percentage change of `recent` vs `prior`; 0 when there's no prior baseline. */
function pctChange(recent: number, prior: number): number {
  if (prior === 0) return 0;
  return ((recent - prior) / prior) * 100;
}

// ---------------------------------------------------------------------------
// Row shapes (snake_case, as stored) → web types (camelCase)
// ---------------------------------------------------------------------------

interface PersonaRow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  structured_prompt: string | null;
  icon: string | null;
  color: string | null;
  enabled: boolean;
  max_concurrent: number;
  timeout_ms: number;
  model_profile: string | null;
  max_budget_usd: number | null;
  max_turns: number | null;
  design_context: string | null;
  created_at: string;
  updated_at: string;
}

function mapPersona(r: PersonaRow): Persona {
  return {
    id: r.id,
    projectId: r.project_id,
    name: r.name,
    description: r.description,
    systemPrompt: r.system_prompt,
    structuredPrompt: r.structured_prompt,
    icon: r.icon,
    color: r.color,
    enabled: r.enabled,
    maxConcurrent: r.max_concurrent,
    timeoutMs: r.timeout_ms,
    modelProfile: r.model_profile,
    maxBudgetUsd: r.max_budget_usd,
    maxTurns: r.max_turns,
    designContext: r.design_context,
    groupId: null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

interface ExecutionRow {
  id: string;
  persona_id: string;
  trigger_id: string | null;
  status: string;
  input_data: string | null;
  output_data: string | null;
  claude_session_id: string | null;
  model_used: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  error_message: string | null;
  duration_ms: number | null;
  retry_of_execution_id: string | null;
  retry_count: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

function mapExecution(r: ExecutionRow): PersonaExecution {
  return {
    id: r.id,
    personaId: r.persona_id,
    triggerId: r.trigger_id,
    useCaseId: null,
    status: mapStatus(r.status),
    inputData: r.input_data,
    outputData: r.output_data,
    claudeSessionId: r.claude_session_id,
    modelUsed: r.model_used,
    inputTokens: r.input_tokens ?? 0,
    outputTokens: r.output_tokens ?? 0,
    costUsd: r.cost_usd ?? 0,
    errorMessage: r.error_message,
    durationMs: r.duration_ms,
    retryOfExecutionId: r.retry_of_execution_id,
    retryCount: r.retry_count ?? 0,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  };
}

interface EventRow {
  id: string;
  project_id: string;
  event_type: string;
  source_type: string;
  source_id: string | null;
  target_persona_id: string | null;
  status: string;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

function mapEvent(r: EventRow): PersonaEvent {
  return {
    id: r.id,
    projectId: r.project_id,
    eventType: r.event_type,
    sourceType: r.source_type,
    sourceId: r.source_id,
    targetPersonaId: r.target_persona_id,
    payload: null,
    status: r.status as EventStatus,
    errorMessage: r.error_message,
    processedAt: r.processed_at,
    useCaseId: null,
    createdAt: r.created_at,
  };
}

interface ManualReviewRow {
  id: string;
  execution_id: string;
  persona_id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  reviewer_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}

/**
 * Adapt a synced manual-review row into the `PersonaEvent` shape `reviewStore`
 * already parses (it derives `ManualReviewItem` from a `manual_review` event).
 * This keeps the Reviews module working in sync mode with no interface change:
 * the review's fields ride in the event payload / status the store expects.
 */
function reviewToEvent(r: ManualReviewRow): PersonaEvent {
  const status: EventStatus =
    r.status === "approved" || r.status === "resolved"
      ? "processed"
      : r.status === "rejected"
        ? "failed"
        : "pending";
  return {
    id: r.id,
    projectId: "default",
    eventType: "manual_review",
    sourceType: "manual_review",
    sourceId: r.execution_id,
    targetPersonaId: r.persona_id,
    payload: JSON.stringify({
      title: r.title,
      description: r.description ?? "",
      severity: r.severity,
      reviewerNotes: r.reviewer_notes ?? null,
    }),
    status,
    errorMessage: null,
    processedAt: r.resolved_at,
    useCaseId: null,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export const supabaseApi: ApiClient = {
  listPersonas: async () => {
    const r = await rows<PersonaRow>(
      getSupabase().from("synced_personas").select("*").order("updated_at", { ascending: false }),
    );
    return r.map(mapPersona);
  },

  getPersona: async (id: string) => {
    const r = await rows<PersonaRow>(
      getSupabase().from("synced_personas").select("*").eq("id", id).limit(1),
    );
    if (r.length === 0) throw new ApiError(404, "Persona not found");
    return mapPersona(r[0]);
  },

  deletePersona: async () => readOnly(),

  listExecutions: async (opts?: ExecFilterOpts) => {
    let q = getSupabase()
      .from("synced_executions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(opts?.limit ?? 50);
    if (opts?.personaId) q = q.eq("persona_id", opts.personaId);
    if (opts?.status) q = q.eq("status", opts.status);
    const r = await rows<ExecutionRow>(q);
    return r.map(mapExecution);
  },

  getExecution: async (id: string): Promise<ExecutionDetail> => {
    const r = await rows<ExecutionRow>(
      getSupabase().from("synced_executions").select("*").eq("id", id).limit(1),
    );
    if (r.length === 0) throw new ApiError(404, "Execution not found");
    const e = r[0];
    const output = e.output_data ? e.output_data.split("\n") : [];
    return {
      executionId: e.id,
      status: mapStatus(e.status),
      outputLines: output.length,
      output,
      durationMs: e.duration_ms ?? undefined,
      sessionId: e.claude_session_id ?? undefined,
      totalCostUsd: e.cost_usd ?? undefined,
    };
  },

  cancelExecution: async () => readOnly(),

  // Phase 2: a run from the dashboard is a *request*, not a direct execution.
  // Insert a pending_commands row targeting the most-recently-active device;
  // the desktop surfaces an approval prompt and runs it locally on approval.
  // Returns the command id as the handle (status "queued" = awaiting approval).
  executePersona: async (personaId: string, prompt: string) => {
    const sb = getSupabase();
    const devices = await rows<{ device_id: string }>(
      sb
        .from("synced_devices")
        .select("device_id")
        .order("last_seen_at", { ascending: false, nullsFirst: false })
        .limit(1),
    );
    if (devices.length === 0) {
      throw new ApiError(
        409,
        "No synced device is available. Open the desktop app and turn on cloud sync to run from the dashboard.",
      );
    }
    const inserted = await rows<{ id: string }>(
      sb
        .from("pending_commands")
        .insert({
          command_type: "run_persona",
          persona_id: personaId,
          prompt,
          target_device_id: devices[0].device_id,
          requested_from: "web",
          status: "pending",
        })
        .select("id"),
    );
    const id = inserted[0]?.id;
    if (!id) throw new ApiError(500, "Failed to queue the run request.");
    return { executionId: id, status: "queued" as PersonaExecutionStatus };
  },

  listEvents: async (opts?: { eventType?: string; status?: string; limit?: number }) => {
    // Reviews live in their own synced table, not the event bus — adapt them
    // into the manual_review event shape reviewStore consumes.
    if (opts?.eventType === "manual_review") {
      const r = await rows<ManualReviewRow>(
        getSupabase()
          .from("synced_manual_reviews")
          .select(
            "id, execution_id, persona_id, title, description, severity, status, reviewer_notes, resolved_at, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(opts?.limit ?? 100),
      );
      return r.map(reviewToEvent);
    }

    let q = getSupabase()
      .from("synced_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(opts?.limit ?? 100);
    if (opts?.eventType) q = q.eq("event_type", opts.eventType);
    if (opts?.status) q = q.eq("status", opts.status);
    const r = await rows<EventRow>(q);
    return r.map(mapEvent);
  },

  publishEvent: async (_input: CreateEventInput) => readOnly(),
  updateEvent: async () => readOnly(),

  // Subscriptions and triggers are not part of the Phase-1 sync set yet.
  listSubscriptions: async (): Promise<PersonaEventSubscription[]> => [],
  listAllSubscriptions: async (): Promise<PersonaEventSubscription[]> => [],
  createSubscription: async () => readOnly(),
  updateSubscription: async () => readOnly(),
  deleteSubscription: async () => readOnly(),
  listTriggers: async (): Promise<PersonaTrigger[]> => [],

  getHealth: async (): Promise<HealthResponse> => {
    const r = await rows<{ last_seen_at: string | null }>(
      getSupabase().from("synced_devices").select("last_seen_at"),
    );
    const cutoff = Date.now() - 5 * 60_000;
    const online = r.filter(
      (d) => d.last_seen_at && new Date(d.last_seen_at).getTime() > cutoff,
    ).length;
    return {
      status: online > 0 ? "healthy" : "offline",
      workers: { total: r.length, idle: online, executing: 0 },
      hasSubscription: true,
      timestamp: Date.now(),
    };
  },

  getStatus: async (): Promise<StatusResponse> => {
    const r = await rows<{ last_seen_at: string | null }>(
      getSupabase().from("synced_devices").select("last_seen_at"),
    );
    const cutoff = Date.now() - 5 * 60_000;
    const online = r.filter(
      (d) => d.last_seen_at && new Date(d.last_seen_at).getTime() > cutoff,
    ).length;
    return {
      workers: [],
      workerCounts: { total: r.length, idle: online, executing: 0 },
      queueLength: 0,
      activeExecutions: [],
      hasClaudeToken: true,
      oauth: { connected: online > 0, scopes: [], expiresAt: null },
    };
  },

  getObservabilityDaily: async (): Promise<DailyMetric[]> => {
    const r = await rows<{
      date: string;
      cost: number;
      executions: number;
      successes: number;
      failures: number;
    }>(getSupabase().from("synced_observability_daily").select("*").order("date"));
    return r.map((d) => ({
      date: d.date,
      cost: d.cost ?? 0,
      executions: d.executions ?? 0,
      successes: d.successes ?? 0,
      failures: d.failures ?? 0,
    }));
  },

  getObservabilityPersonaSpend: async (): Promise<PersonaSpend[]> => {
    const r = await rows<{
      persona_id: string;
      persona_name: string | null;
      persona_color: string | null;
      total_cost: number;
      execution_count: number;
      budget_usd: number | null;
    }>(getSupabase().from("synced_persona_spend").select("*"));
    return r.map((p) => ({
      personaId: p.persona_id,
      personaName: p.persona_name ?? p.persona_id,
      personaColor: p.persona_color ?? "#888888",
      totalCost: p.total_cost ?? 0,
      executionCount: p.execution_count ?? 0,
      budgetUsd: p.budget_usd,
    }));
  },

  // Health issues aren't synced yet.
  getObservabilityHealthIssues: async (): Promise<HealthIssue[]> => [],

  getObservabilityMetrics: async (): Promise<ObservabilityMetrics> => {
    const daily = await supabaseApi.getObservabilityDaily();
    const totalExecutions = daily.reduce((a, d) => a + d.executions, 0);
    const totalSuccesses = daily.reduce((a, d) => a + d.successes, 0);
    const totalCost = daily.reduce((a, d) => a + d.cost, 0);
    const activePersonas = (
      await rows<{ id: string }>(
        getSupabase().from("synced_personas").select("id").eq("enabled", true),
      )
    ).length;
    // Period-over-period trend: compare the recent half of the daily series
    // against the prior half (% change). Falls back to 0 with no baseline.
    const mid = Math.floor(daily.length / 2);
    const prior = daily.slice(0, mid);
    const recent = daily.slice(mid);
    const sum = (arr: DailyMetric[], f: (d: DailyMetric) => number) =>
      arr.reduce((a, d) => a + f(d), 0);
    const priorExec = sum(prior, (d) => d.executions);
    const recentExec = sum(recent, (d) => d.executions);
    const priorRate = priorExec > 0 ? sum(prior, (d) => d.successes) / priorExec : 0;
    const recentRate = recentExec > 0 ? sum(recent, (d) => d.successes) / recentExec : 0;

    return {
      totalCost,
      totalExecutions,
      successRate: totalExecutions > 0 ? totalSuccesses / totalExecutions : 0,
      activePersonas,
      costTrend: pctChange(sum(recent, (d) => d.cost), sum(prior, (d) => d.cost)),
      execTrend: pctChange(recentExec, priorExec),
      successTrend: pctChange(recentRate, priorRate),
    };
  },

  getObservability: async () => {
    const [metrics, dailyMetrics, personaSpend, healthIssues] = await Promise.all([
      supabaseApi.getObservabilityMetrics(),
      supabaseApi.getObservabilityDaily(),
      supabaseApi.getObservabilityPersonaSpend(),
      supabaseApi.getObservabilityHealthIssues(),
    ]);
    return { metrics, dailyMetrics, personaSpend, healthIssues };
  },

  getUsageAnalytics: async () => {
    const r = await rows<{
      persona_id: string;
      tool_name: string;
      invocation_count: number;
      created_at: string;
    }>(
      getSupabase()
        .from("synced_tool_usage")
        .select("persona_id, tool_name, invocation_count, created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
    );

    const personas = await supabaseApi.listPersonas();
    const pById = new Map(personas.map((p) => [p.id, p]));

    const byTool = new Map<string, number>();
    const byDate = new Map<string, Record<string, number>>();
    const byPersona = new Map<string, Record<string, number>>();

    for (const u of r) {
      const n = u.invocation_count ?? 1;
      byTool.set(u.tool_name, (byTool.get(u.tool_name) ?? 0) + n);

      const date = u.created_at.slice(0, 10);
      const dayTools = byDate.get(date) ?? {};
      dayTools[u.tool_name] = (dayTools[u.tool_name] ?? 0) + n;
      byDate.set(date, dayTools);

      const pTools = byPersona.get(u.persona_id) ?? {};
      pTools[u.tool_name] = (pTools[u.tool_name] ?? 0) + n;
      byPersona.set(u.persona_id, pTools);
    }

    const toolUsage: ToolUsageSummary[] = [...byTool.entries()].map(
      ([toolName, invocations]) => ({
        toolName,
        invocations,
        // Duration / success aren't captured in the synced tool-usage table.
        avgDurationMs: 0,
        successRate: 1,
      }),
    );

    const toolUsageOverTime: ToolUsageOverTime[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, tools]) => ({ date, tools }));

    const toolUsageByPersona: ToolUsageByPersona[] = [...byPersona.entries()].map(
      ([personaId, tools]) => {
        const p = pById.get(personaId);
        return {
          personaId,
          personaName: p?.name ?? personaId,
          personaColor: p?.color ?? "#888888",
          tools,
        };
      },
    );

    return { toolUsage, toolUsageOverTime, toolUsageByPersona };
  },
};

// ---------------------------------------------------------------------------
// Knowledge reads — standalone (not part of ApiClient). The desktop syncs
// persona memories + learned execution patterns into these tables; the
// knowledge dashboard module consumes these once its page is wired off mocks.
// ---------------------------------------------------------------------------

export interface SyncedMemory {
  id: string;
  personaId: string;
  title: string;
  content: string;
  category: string | null;
  sourceExecutionId: string | null;
  importance: number | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncedKnowledgePattern {
  id: string;
  personaId: string;
  useCaseId: string | null;
  knowledgeType: string;
  patternKey: string;
  patternData: string;
  successCount: number;
  failureCount: number;
  avgCostUsd: number;
  avgDurationMs: number;
  confidence: number;
  lastExecutionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getSyncedMemories = async (): Promise<SyncedMemory[]> => {
  const r = await rows<{
    id: string;
    persona_id: string;
    title: string;
    content: string;
    category: string | null;
    source_execution_id: string | null;
    importance: number | null;
    tags: string | null;
    created_at: string;
    updated_at: string;
  }>(getSupabase().from("synced_memories").select("*").order("updated_at", { ascending: false }));
  return r.map((m) => ({
    id: m.id,
    personaId: m.persona_id,
    title: m.title,
    content: m.content,
    category: m.category,
    sourceExecutionId: m.source_execution_id,
    importance: m.importance,
    tags: m.tags,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }));
};

export const getSyncedKnowledgePatterns = async (): Promise<SyncedKnowledgePattern[]> => {
  const r = await rows<{
    id: string;
    persona_id: string;
    use_case_id: string | null;
    knowledge_type: string;
    pattern_key: string;
    pattern_data: string;
    success_count: number;
    failure_count: number;
    avg_cost_usd: number;
    avg_duration_ms: number;
    confidence: number;
    last_execution_id: string | null;
    created_at: string;
    updated_at: string;
  }>(
    getSupabase()
      .from("synced_knowledge_patterns")
      .select("*")
      .order("confidence", { ascending: false }),
  );
  return r.map((k) => ({
    id: k.id,
    personaId: k.persona_id,
    useCaseId: k.use_case_id,
    knowledgeType: k.knowledge_type,
    patternKey: k.pattern_key,
    patternData: k.pattern_data,
    successCount: k.success_count,
    failureCount: k.failure_count,
    avgCostUsd: k.avg_cost_usd,
    avgDurationMs: k.avg_duration_ms,
    confidence: k.confidence,
    lastExecutionId: k.last_execution_id,
    createdAt: k.created_at,
    updatedAt: k.updated_at,
  }));
};
