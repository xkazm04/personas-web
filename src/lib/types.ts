// ---------------------------------------------------------------------------
// Domain types — mirrors personas-cloud/packages/shared/src/types.ts
// ---------------------------------------------------------------------------

export interface Persona {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  structuredPrompt: string | null;
  icon: string | null;
  color: string | null;
  enabled: boolean;
  maxConcurrent: number;
  timeoutMs: number;
  modelProfile: string | null;
  maxBudgetUsd: number | null;
  maxTurns: number | null;
  designContext: string | null;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaExecution {
  id: string;
  projectId?: string;
  personaId: string;
  triggerId: string | null;
  useCaseId: string | null;
  status: string;
  inputData: string | null;
  outputData: string | null;
  claudeSessionId: string | null;
  modelUsed: string | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  errorMessage: string | null;
  durationMs: number | null;
  retryOfExecutionId: string | null;
  retryCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PersonaEvent {
  id: string;
  projectId: string;
  eventType: string;
  sourceType: string;
  sourceId: string | null;
  targetPersonaId: string | null;
  payload: string | null;
  status: string;
  errorMessage: string | null;
  processedAt: string | null;
  useCaseId: string | null;
  createdAt: string;
}

export interface PersonaEventSubscription {
  id: string;
  personaId: string;
  eventType: string;
  sourceFilter: string | null;
  enabled: boolean;
  useCaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaTrigger {
  id: string;
  personaId: string;
  triggerType: string;
  config: string | null;
  enabled: boolean;
  lastTriggeredAt: string | null;
  nextTriggerAt: string | null;
  useCaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInfo {
  workerId: string;
  status: "connecting" | "idle" | "executing" | "disconnected";
  version: string;
  capabilities: string[];
  currentExecutionId?: string;
  connectedAt: number;
  lastHeartbeat: number;
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export interface ExecutionDetail {
  executionId: string;
  status: string;
  outputLines: number;
  output: string[];
  durationMs?: number;
  sessionId?: string;
  totalCostUsd?: number;
}

export interface HealthResponse {
  status: string;
  workers: { total: number; idle: number; executing: number };
  hasSubscription: boolean;
  timestamp: number;
}

export interface StatusResponse {
  workers: WorkerInfo[];
  workerCounts: { total: number; idle: number; executing: number };
  queueLength: number;
  activeExecutions: Array<{
    executionId: string;
    workerId: string;
    startedAt: number;
  }>;
  hasClaudeToken: boolean;
  oauth: {
    connected: boolean;
    scopes: string[];
    expiresAt: string | null;
  };
}

// ---------------------------------------------------------------------------
// Frontend enrichment types (from desktop patterns)
// ---------------------------------------------------------------------------

export interface WithPersonaInfo {
  personaName?: string;
  personaIcon?: string;
  personaColor?: string;
}

export type GlobalExecution = PersonaExecution & WithPersonaInfo;

export interface ManualReviewItem extends WithPersonaInfo {
  id: string;
  personaId: string;
  executionId: string;
  eventType: string;
  content: string;
  severity: string;
  status: string;
  reviewerNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

// ---------------------------------------------------------------------------
// Status literal types
// ---------------------------------------------------------------------------

export type PersonaExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type EventStatus = "pending" | "processed" | "failed";

export type DashboardTab =
  | "agents"
  | "executions"
  | "events"
  | "reviews"
  | "settings";

// ---------------------------------------------------------------------------
// API input types
// ---------------------------------------------------------------------------

export interface CreateEventInput {
  eventType: string;
  sourceType: string;
  sourceId?: string;
  targetPersonaId?: string;
  payload?: string;
}

export interface ExecFilterOpts {
  personaId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
