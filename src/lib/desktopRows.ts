/**
 * Pure mappers for the desktop's snake_case row shape (PersonaExecution and
 * the persona columns). The sync mirror (`synced_executions`, `synced_personas`)
 * mirrors that shape, and so does the desktop's management API, so both
 * backends (`supabaseApi`, `desktopApi`) map through here.
 */
import type { ExecutionDetail, Persona, PersonaExecution, PersonaExecutionStatus } from "./types";

const EXECUTION_STATUSES: ReadonlySet<string> = new Set([
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export function mapStatus(s: string): PersonaExecutionStatus {
  // The desktop allows an `incomplete` status the web type doesn't model.
  if (s === "incomplete") return "failed";
  // Legacy desktop alias for queued.
  if (s === "pending") return "queued";
  if (EXECUTION_STATUSES.has(s)) return s as PersonaExecutionStatus;
  // Unknown desktop status (schema drift). A blind `as` cast lets the value flow
  // into status badges, success-rate math, and eq("status", …) filters that
  // silently never match it. Map to the neutral non-terminal "running" and warn.
  console.warn(`[supabaseApi] unknown execution status "${s}"; treating as "running".`);
  return "running";
}

export interface PersonaRow {
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
  device_id: string | null;
  created_at: string;
  updated_at: string;
}

export function mapPersona(r: PersonaRow): Persona {
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
    deviceId: r.device_id ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface ExecutionRow {
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

export function mapExecution(r: ExecutionRow): PersonaExecution {
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

/**
 * The orchestrator's GET /api/executions/:id?offset=N contract: `output` is only
 * the lines past the caller's cursor, `outputLines` the total. The row always
 * carries the FULL buffer, so slice it here.
 */
export function executionDetailFromRow(e: ExecutionRow, offset?: number): ExecutionDetail {
  const all = e.output_data ? e.output_data.split("\n") : [];
  const from = Math.max(0, Math.floor(offset ?? 0));
  const output = all.slice(from);
  return {
    executionId: e.id,
    status: mapStatus(e.status),
    outputLines: all.length,
    output,
    durationMs: e.duration_ms ?? undefined,
    sessionId: e.claude_session_id ?? undefined,
    totalCostUsd: e.cost_usd ?? undefined,
  };
}
