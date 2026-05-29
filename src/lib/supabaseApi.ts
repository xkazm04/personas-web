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
import type {
  FeedbackMessage,
  MessageThread,
  LeaderboardPersona,
  LeaderboardTrend,
  SLATarget,
  SLABreach,
} from "./mock-dashboard-data";

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
  // Sanitized event body synced by the desktop (v2): decrypted locally,
  // secret-scrubbed, size-bounded. Null when omitted or not structured JSON.
  payload: string | null;
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
    payload: r.payload ?? null,
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

interface HealingRow {
  id: string;
  persona_id: string;
  title: string;
  description: string | null;
  severity: string;
  category: string;
  auto_fixed: boolean;
  status: string;
  created_at: string;
}

const HEALTH_SEVERITIES = new Set(["critical", "high", "medium", "low"]);

/** Map a synced healing-issue row to the web HealthIssue shape, coercing the
 *  desktop's free-text severity/status into the dashboard's enums. */
function mapHealingIssue(h: HealingRow, meta: Map<string, PersonaMeta>): HealthIssue {
  const persona = meta.get(h.persona_id);
  const severity = HEALTH_SEVERITIES.has(h.severity)
    ? (h.severity as HealthIssue["severity"])
    : "low";
  const status: HealthIssue["status"] = h.auto_fixed
    ? "auto_fixed"
    : h.status === "resolved"
      ? "resolved"
      : "open";
  return {
    id: h.id,
    severity,
    title: h.title,
    description: h.description ?? "",
    personaId: h.persona_id,
    personaName: persona?.name ?? null,
    detectedAt: h.created_at,
    status,
    category: h.category,
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

  getObservabilityHealthIssues: async (): Promise<HealthIssue[]> => {
    const [r, meta] = await Promise.all([
      rows<HealingRow>(
        getSupabase()
          .from("synced_healing_issues")
          .select(
            "id, persona_id, title, description, severity, category, auto_fixed, status, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(200),
      ),
      loadPersonaMeta(),
    ]);
    return r.map((h) => mapHealingIssue(h, meta));
  },

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

// ---------------------------------------------------------------------------
// Persona name/color lookup — several of the dashboard display shapes below
// surface a human persona name + its accent color, but the source tables only
// carry persona_id. Resolve once per call against synced_personas.
// ---------------------------------------------------------------------------

const FALLBACK_PERSONA_COLOR = "#888888";


// ---------------------------------------------------------------------------
// Leaderboard — composite score + a 5-axis radar profile per persona. There is
// no desktop-side "leaderboard" table; we read the `synced_leaderboard` view
// (see scripts/setup-sync-db.sql) which aggregates per-persona execution stats.
//
// Radar axes (all 0-100, higher = better) are derived from real signals:
//   - reliability: success rate (% of completed vs total).
//   - cost:        inverse of relative spend-per-execution (cheaper → higher).
//   - speed:       inverse of relative avg duration (faster → higher).
//   - quality:     PROXY — no explicit quality metric is synced, so we reuse a
//                  blend of success rate and (1 - retry rate). Documented proxy.
//   - volume:      relative execution count vs the busiest persona.
// composite is the mean of the five axes; rank/trend/delta derived from it.
// ---------------------------------------------------------------------------

interface LeaderboardViewRow {
  persona_id: string;
  persona_name: string | null;
  persona_color: string | null;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  total_retries: number;
  total_cost_usd: number;
  avg_duration_ms: number;
}

function clamp100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const getSyncedLeaderboard = async (): Promise<LeaderboardPersona[]> => {
  const r = await rows<LeaderboardViewRow>(
    getSupabase().from("synced_leaderboard").select("*"),
  );
  if (r.length === 0) return [];

  // Normalization baselines across the cohort: cost-per-exec and duration are
  // scored relative to the cohort max (so the worst performer anchors 0-ish and
  // everyone else scores higher), volume relative to the busiest persona.
  const perExecCost = r.map((p) =>
    p.total_executions > 0 ? p.total_cost_usd / p.total_executions : 0,
  );
  const maxPerExecCost = Math.max(...perExecCost, 0.0001);
  const maxDuration = Math.max(...r.map((p) => p.avg_duration_ms || 0), 1);
  const maxVolume = Math.max(...r.map((p) => p.total_executions || 0), 1);

  const scored = r.map((p, i) => {
    const total = p.total_executions || 0;
    const successRate = total > 0 ? p.successful_executions / total : 0;
    const retryRate = total > 0 ? Math.min(1, (p.total_retries || 0) / total) : 0;

    const reliability = clamp100(successRate * 100);
    // Cheaper-per-execution → closer to 100. Worst case anchors near 0.
    const cost = clamp100((1 - perExecCost[i] / maxPerExecCost) * 100);
    // Faster avg duration → closer to 100.
    const speed = clamp100((1 - (p.avg_duration_ms || 0) / maxDuration) * 100);
    // PROXY: blend success rate with the inverse retry rate (no quality metric
    // is synced from the desktop; this approximates "got it right" quality).
    const quality = clamp100((successRate * 0.7 + (1 - retryRate) * 0.3) * 100);
    const volume = clamp100((total / maxVolume) * 100);

    const metrics = { reliability, cost, speed, quality, volume };
    const composite = clamp100(
      (reliability + cost + speed + quality + volume) / 5,
    );
    return {
      id: p.persona_id,
      name: p.persona_name ?? p.persona_id,
      color: p.persona_color ?? FALLBACK_PERSONA_COLOR,
      metrics,
      composite,
    };
  });

  scored.sort((a, b) => b.composite - a.composite);

  // No prior-period snapshot is available in the view, so trend/delta cannot be
  // computed from real data yet — surface a neutral "flat / 0" rather than a
  // fabricated movement. (PROXY: trend/delta are placeholders until a period
  // comparison is synced.)
  return scored.map<LeaderboardPersona>((p) => ({
    ...p,
    trend: "flat" as LeaderboardTrend,
    delta: 0,
  }));
};

// ---------------------------------------------------------------------------
// SLA — there is no desktop-side SLA configuration, so the targets below are
// APP-DEFINED DEFAULTS (success rate ≥ 95%, avg latency ≤ 30s). Per-persona
// current values are computed from synced_executions; breaches are synthesized
// for any persona currently outside its target. Documented as app defaults.
// ---------------------------------------------------------------------------

// App-defined default objectives (no desktop SLA config exists).
const SLA_SUCCESS_RATE_TARGET = 95; // percent
const SLA_LATENCY_TARGET_MS = 30_000; // avg duration ceiling

interface SlaAggRow {
  persona_id: string;
  persona_name: string | null;
  persona_color: string | null;
  total_executions: number;
  successful_executions: number;
  avg_duration_ms: number;
}

export const getSyncedSla = async (): Promise<{
  targets: SLATarget[];
  breaches: SLABreach[];
}> => {
  // Reuse the leaderboard view's per-persona aggregates (success + duration).
  const r = await rows<SlaAggRow>(
    getSupabase()
      .from("synced_leaderboard")
      .select(
        "persona_id, persona_name, persona_color, total_executions, successful_executions, avg_duration_ms",
      ),
  );

  const targets: SLATarget[] = [];
  const breaches: SLABreach[] = [];

  for (const p of r) {
    const total = p.total_executions || 0;
    if (total === 0) continue;
    const name = p.persona_name ?? p.persona_id;
    const color = p.persona_color ?? FALLBACK_PERSONA_COLOR;

    // Success-rate objective.
    const successRate = (p.successful_executions / total) * 100;
    const successBreach = successRate < SLA_SUCCESS_RATE_TARGET;
    targets.push({
      id: `sla_success_${p.persona_id}`,
      persona: name,
      personaColor: color,
      metric: "successRate",
      target: SLA_SUCCESS_RATE_TARGET,
      current: +successRate.toFixed(1),
      unit: "%",
      // timeInSLA approximated by the success rate itself (fraction in range).
      timeInSLA: Math.max(0, Math.min(1, successRate / 100)),
      direction: "higher",
      activeBreach: successBreach,
    });
    if (successBreach) {
      breaches.push({
        id: `br_success_${p.persona_id}`,
        persona: name,
        metric: "successRate",
        startedAt: new Date().toISOString(),
        resolvedAt: null,
        durationMinutes: 0,
        severity: successRate < 80 ? "critical" : "major",
        summary: `Success rate ${successRate.toFixed(1)}% is below the ${SLA_SUCCESS_RATE_TARGET}% objective.`,
      });
    }

    // Latency objective.
    const avgMs = p.avg_duration_ms || 0;
    const latencyBreach = avgMs > SLA_LATENCY_TARGET_MS;
    targets.push({
      id: `sla_latency_${p.persona_id}`,
      persona: name,
      personaColor: color,
      metric: "latency",
      target: SLA_LATENCY_TARGET_MS,
      current: Math.round(avgMs),
      unit: "ms",
      // Fraction of the budget remaining (clamped) as a stand-in for time-in-SLA.
      timeInSLA: Math.max(0, Math.min(1, 1 - avgMs / (SLA_LATENCY_TARGET_MS * 2))),
      direction: "lower",
      activeBreach: latencyBreach,
    });
    if (latencyBreach) {
      breaches.push({
        id: `br_latency_${p.persona_id}`,
        persona: name,
        metric: "latency",
        startedAt: new Date().toISOString(),
        resolvedAt: null,
        durationMinutes: 0,
        severity: avgMs > SLA_LATENCY_TARGET_MS * 2 ? "critical" : "major",
        summary: `Average duration ${(avgMs / 1000).toFixed(1)}s exceeds the ${(SLA_LATENCY_TARGET_MS / 1000).toFixed(0)}s objective.`,
      });
    }
  }

  return { targets, breaches };
};

// ---------------------------------------------------------------------------
// Messages — group synced_messages into MessageThread[]. The desktop writes one
// row per message with a thread_id (NULL for standalone messages → grouped by
// their own id). metadata carries the raw JSON payload the detail view shows.
// ---------------------------------------------------------------------------

interface PersonaMeta {
  name: string;
  color: string;
}

async function loadPersonaMeta(): Promise<Map<string, PersonaMeta>> {
  const r = await rows<{ id: string; name: string | null; color: string | null }>(
    getSupabase().from("synced_personas").select("id, name, color"),
  );
  return new Map(
    r.map((p) => [p.id, { name: p.name ?? p.id, color: p.color ?? FALLBACK_PERSONA_COLOR }]),
  );
}

function loadMeta(meta: Map<string, PersonaMeta>, personaId: string): PersonaMeta {
  return meta.get(personaId) ?? { name: personaId, color: FALLBACK_PERSONA_COLOR };
}

interface MessageRowShape {
  id: string;
  persona_id: string;
  execution_id: string | null;
  title: string | null;
  content: string;
  content_type: string;
  priority: string;
  is_read: boolean;
  metadata: string | null;
  thread_id: string | null;
  created_at: string;
  read_at: string | null;
}

function mapFeedbackMessage(
  row: MessageRowShape,
  threadId: string,
  isParent: boolean,
  meta: PersonaMeta,
): FeedbackMessage {
  return {
    id: row.id,
    threadId,
    isThreadParent: isParent,
    persona: meta.name,
    personaColor: meta.color,
    timestamp: row.created_at,
    subject: row.title ?? meta.name,
    status: row.is_read ? "read" : "unread",
    payload: row.metadata ?? "{}",
    body: row.content,
  };
}

export const getSyncedMessageThreads = async (): Promise<MessageThread[]> => {
  const [r, meta] = await Promise.all([
    rows<MessageRowShape>(
      getSupabase()
        .from("synced_messages")
        .select(
          "id, persona_id, execution_id, title, content, content_type, priority, is_read, metadata, thread_id, created_at, read_at",
        )
        .order("created_at", { ascending: true }),
    ),
    loadPersonaMeta(),
  ]);

  const groups = new Map<string, MessageRowShape[]>();
  for (const row of r) {
    const key = row.thread_id ?? row.id;
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }

  const threads: MessageThread[] = [];
  for (const [threadId, rowsInThread] of groups) {
    const sorted = [...rowsInThread].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const parentRow = sorted[0];
    const personaMeta = loadMeta(meta, parentRow.persona_id);
    const parent = mapFeedbackMessage(parentRow, threadId, true, personaMeta);
    const replies = sorted
      .slice(1)
      .map((row) => mapFeedbackMessage(row, threadId, false, loadMeta(meta, row.persona_id)));
    const all = [parent, ...replies];
    const latestTimestamp = all.reduce(
      (latest, m) => (m.timestamp > latest ? m.timestamp : latest),
      parent.timestamp,
    );
    const unreadCount = all.filter((m) => m.status === "unread").length;
    threads.push({
      id: threadId,
      persona: personaMeta.name,
      personaColor: personaMeta.color,
      subject: parent.subject,
      parent,
      replies,
      latestTimestamp,
      unreadCount,
    });
  }

  threads.sort(
    (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
  );
  return threads;
};

// ---------------------------------------------------------------------------
// Triggers — "upcoming routines" (standalone read; not part of ApiClient).
// The desktop projects schedule timing only (no `config` — secret-free).
// ---------------------------------------------------------------------------

export interface SyncedTrigger {
  id: string;
  personaId: string;
  personaName: string;
  personaColor: string;
  triggerType: string;
  enabled: boolean;
  lastTriggeredAt: string | null;
  nextTriggerAt: string | null;
}

export const getSyncedTriggers = async (): Promise<SyncedTrigger[]> => {
  const [r, meta] = await Promise.all([
    rows<{
      id: string;
      persona_id: string;
      trigger_type: string;
      enabled: boolean;
      last_triggered_at: string | null;
      next_trigger_at: string | null;
    }>(
      getSupabase()
        .from("synced_triggers")
        .select("id, persona_id, trigger_type, enabled, last_triggered_at, next_trigger_at"),
    ),
    loadPersonaMeta(),
  ]);
  return r.map((t) => {
    const persona = loadMeta(meta, t.persona_id);
    return {
      id: t.id,
      personaId: t.persona_id,
      personaName: persona.name,
      personaColor: persona.color,
      triggerType: t.trigger_type,
      enabled: t.enabled,
      lastTriggeredAt: t.last_triggered_at,
      nextTriggerAt: t.next_trigger_at,
    };
  });
};
