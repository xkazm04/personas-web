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
  status: PersonaExecutionStatus;
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
  status: EventStatus;
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
  status: PersonaExecutionStatus;
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
  severity: ReviewSeverity;
  status: ReviewStatus;
  reviewerNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  escalatedAt: string | null;
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

export type ReviewSeverity = "critical" | "warning" | "info";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type EscalationAction = "auto_approve" | "escalate" | "none";

export interface EscalationRule {
  slaMinutes: number;
  action: EscalationAction;
}

export type EscalationPolicy = Record<ReviewSeverity, EscalationRule>;

/** All status values the StatusBadge component can render. */
export type BadgeStatus =
  | PersonaExecutionStatus
  | EventStatus
  | ReviewStatus;

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

// ---------------------------------------------------------------------------
// Observability types
// ---------------------------------------------------------------------------

export interface ObservabilityMetrics {
  totalCost: number;
  totalExecutions: number;
  successRate: number;
  activePersonas: number;
  costTrend: number; // percentage change vs prior period
  execTrend: number;
  successTrend: number;
}

export interface DailyMetric {
  date: string;
  cost: number;
  executions: number;
  successes: number;
  failures: number;
}

export interface PersonaSpend {
  personaId: string;
  personaName: string;
  personaColor: string;
  totalCost: number;
  executionCount: number;
  budgetUsd: number | null;
}

export interface HealthIssue {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  personaId: string | null;
  personaName: string | null;
  detectedAt: string;
  status: "open" | "auto_fixed" | "resolved";
  category: string;
}

// ---------------------------------------------------------------------------
// Usage analytics types
// ---------------------------------------------------------------------------

export interface ToolUsageSummary {
  toolName: string;
  invocations: number;
  avgDurationMs: number;
  successRate: number;
}

export interface ToolUsageOverTime {
  date: string;
  tools: Record<string, number>;
}

export interface ToolUsageByPersona {
  personaId: string;
  personaName: string;
  personaColor: string;
  tools: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Dashboard tab type (expanded)
// ---------------------------------------------------------------------------

export type DashboardTab =
  | "home"
  | "agents"
  | "executions"
  | "events"
  | "reviews"
  | "observability"
  | "usage"
  | "settings";

// ---------------------------------------------------------------------------
// UI types
// ---------------------------------------------------------------------------

export interface ScrollMapItem {
  label: string;
  href: string;
}
