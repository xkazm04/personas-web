import type {
  Persona,
  PersonaEvent,
  PersonaEventSubscription,
  PersonaTrigger,
  ExecutionDetail,
  HealthResponse,
  StatusResponse,
  GlobalExecution,
  ManualReviewItem,
  ObservabilityMetrics,
  DailyMetric,
  PersonaSpend,
  HealthIssue,
  ToolUsageSummary,
  ToolUsageOverTime,
  ToolUsageByPersona,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function id(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}-mock`;
}

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

export const MOCK_PERSONAS: Persona[] = [
  {
    id: id("p", 1),
    projectId: "mock-project",
    name: "PR Review Agent",
    description: "Automatically reviews pull requests and provides feedback on code quality, security, and best practices.",
    systemPrompt: "You are a senior code reviewer...",
    structuredPrompt: null,
    icon: null,
    color: "#06b6d4",
    enabled: true,
    maxConcurrent: 3,
    timeoutMs: 120000,
    modelProfile: null,
    maxBudgetUsd: 5.0,
    maxTurns: 10,
    designContext: null,
    groupId: null,
    createdAt: ago(7200),
    updatedAt: ago(60),
  },
  {
    id: id("p", 2),
    projectId: "mock-project",
    name: "Incident Responder",
    description: "Monitors alerts from PagerDuty and Datadog, triages incidents, and creates initial response plans.",
    systemPrompt: "You are an SRE incident responder...",
    structuredPrompt: null,
    icon: null,
    color: "#f43f5e",
    enabled: true,
    maxConcurrent: 1,
    timeoutMs: 300000,
    modelProfile: null,
    maxBudgetUsd: 10.0,
    maxTurns: 20,
    designContext: null,
    groupId: null,
    createdAt: ago(14400),
    updatedAt: ago(180),
  },
  {
    id: id("p", 3),
    projectId: "mock-project",
    name: "Daily Standup Digest",
    description: "Summarizes yesterday's activity across GitHub, Linear, and Slack into a concise standup digest.",
    systemPrompt: "You are a team productivity assistant...",
    structuredPrompt: null,
    icon: null,
    color: "#a855f7",
    enabled: true,
    maxConcurrent: 1,
    timeoutMs: 60000,
    modelProfile: null,
    maxBudgetUsd: 2.0,
    maxTurns: 5,
    designContext: null,
    groupId: null,
    createdAt: ago(43200),
    updatedAt: ago(720),
  },
  {
    id: id("p", 4),
    projectId: "mock-project",
    name: "Security Scanner",
    description: "Scans dependency updates for CVEs and generates security advisories for the team.",
    systemPrompt: "You are a security analyst...",
    structuredPrompt: null,
    icon: null,
    color: "#34d399",
    enabled: false,
    maxConcurrent: 2,
    timeoutMs: 180000,
    modelProfile: null,
    maxBudgetUsd: 3.0,
    maxTurns: 8,
    designContext: null,
    groupId: null,
    createdAt: ago(86400),
    updatedAt: ago(4320),
  },
  {
    id: id("p", 5),
    projectId: "mock-project",
    name: "Customer Feedback Analyzer",
    description: "Analyzes support tickets and NPS surveys, identifying trends and generating weekly insights.",
    systemPrompt: "You are a customer insights analyst...",
    structuredPrompt: null,
    icon: null,
    color: "#fbbf24",
    enabled: true,
    maxConcurrent: 2,
    timeoutMs: 90000,
    modelProfile: null,
    maxBudgetUsd: 4.0,
    maxTurns: 12,
    designContext: null,
    groupId: null,
    createdAt: ago(172800),
    updatedAt: ago(1440),
  },
];

// ---------------------------------------------------------------------------
// Executions
// ---------------------------------------------------------------------------

export const MOCK_EXECUTIONS: GlobalExecution[] = [
  {
    id: id("e", 1),
    personaId: id("p", 1),
    triggerId: null,
    useCaseId: null,
    status: "running",
    inputData: '{"pr_number": 342, "repo": "acme/frontend"}',
    outputData: null,
    claudeSessionId: "sess-abc123",
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 4200,
    outputTokens: 1800,
    costUsd: 0.0234,
    errorMessage: null,
    durationMs: null,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(2),
    completedAt: null,
    createdAt: ago(2),
    personaName: "PR Review Agent",
    personaIcon: undefined,
    personaColor: "#06b6d4",
  },
  {
    id: id("e", 2),
    personaId: id("p", 2),
    triggerId: null,
    useCaseId: null,
    status: "completed",
    inputData: '{"alert_id": "INC-891", "severity": "P2"}',
    outputData: "Incident triaged. Root cause: Redis connection pool exhaustion...",
    claudeSessionId: "sess-def456",
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 8400,
    outputTokens: 3200,
    costUsd: 0.0567,
    errorMessage: null,
    durationMs: 45200,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(15),
    completedAt: ago(14),
    createdAt: ago(15),
    personaName: "Incident Responder",
    personaIcon: undefined,
    personaColor: "#f43f5e",
  },
  {
    id: id("e", 3),
    personaId: id("p", 3),
    triggerId: id("t", 1),
    useCaseId: null,
    status: "completed",
    inputData: null,
    outputData: "## Standup Digest - Feb 25\n\n**Frontend Team**\n- 3 PRs merged...",
    claudeSessionId: "sess-ghi789",
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 12000,
    outputTokens: 2400,
    costUsd: 0.0312,
    errorMessage: null,
    durationMs: 18700,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(120),
    completedAt: ago(119),
    createdAt: ago(120),
    personaName: "Daily Standup Digest",
    personaIcon: undefined,
    personaColor: "#a855f7",
  },
  {
    id: id("e", 4),
    personaId: id("p", 1),
    triggerId: null,
    useCaseId: null,
    status: "failed",
    inputData: '{"pr_number": 339, "repo": "acme/api"}',
    outputData: null,
    claudeSessionId: null,
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 1200,
    outputTokens: 0,
    costUsd: 0.0018,
    errorMessage: "Context window exceeded: PR diff too large (148k tokens). Consider splitting the PR.",
    durationMs: 3400,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(240),
    completedAt: ago(240),
    createdAt: ago(240),
    personaName: "PR Review Agent",
    personaIcon: undefined,
    personaColor: "#06b6d4",
  },
  {
    id: id("e", 5),
    personaId: id("p", 5),
    triggerId: id("t", 2),
    useCaseId: null,
    status: "completed",
    inputData: '{"source": "zendesk", "period": "last_7_days"}',
    outputData: "## Weekly Customer Insights\n\nOverall sentiment: Positive (+12% WoW)...",
    claudeSessionId: "sess-jkl012",
    modelUsed: "claude-sonnet-4-5-20250929",
    inputTokens: 18500,
    outputTokens: 4100,
    costUsd: 0.0789,
    errorMessage: null,
    durationMs: 62300,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(1440),
    completedAt: ago(1439),
    createdAt: ago(1440),
    personaName: "Customer Feedback Analyzer",
    personaIcon: undefined,
    personaColor: "#fbbf24",
  },
  {
    id: id("e", 6),
    personaId: id("p", 2),
    triggerId: null,
    useCaseId: null,
    status: "cancelled",
    inputData: '{"alert_id": "INC-887"}',
    outputData: null,
    claudeSessionId: null,
    modelUsed: null,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    errorMessage: null,
    durationMs: 1200,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: ago(2880),
    completedAt: ago(2880),
    createdAt: ago(2880),
    personaName: "Incident Responder",
    personaIcon: undefined,
    personaColor: "#f43f5e",
  },
  {
    id: id("e", 7),
    personaId: id("p", 1),
    triggerId: null,
    useCaseId: null,
    status: "queued",
    inputData: '{"pr_number": 343, "repo": "acme/frontend"}',
    outputData: null,
    claudeSessionId: null,
    modelUsed: null,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    errorMessage: null,
    durationMs: null,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: null,
    completedAt: null,
    createdAt: ago(1),
    personaName: "PR Review Agent",
    personaIcon: undefined,
    personaColor: "#06b6d4",
  },
];

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const MOCK_EVENTS: PersonaEvent[] = [
  {
    id: id("ev", 1),
    projectId: "mock-project",
    eventType: "webhook_received",
    sourceType: "github",
    sourceId: "acme/frontend",
    targetPersonaId: id("p", 1),
    payload: JSON.stringify({ action: "opened", pull_request: { number: 342, title: "feat: add dark mode toggle", user: { login: "jsmith" } } }, null, 2),
    status: "processed",
    errorMessage: null,
    processedAt: ago(2),
    useCaseId: null,
    createdAt: ago(3),
  },
  {
    id: id("ev", 2),
    projectId: "mock-project",
    eventType: "alert_triggered",
    sourceType: "pagerduty",
    sourceId: "service-api-prod",
    targetPersonaId: id("p", 2),
    payload: JSON.stringify({ incident_id: "INC-891", severity: "P2", title: "High error rate on /api/checkout", service: "api-prod" }, null, 2),
    status: "processed",
    errorMessage: null,
    processedAt: ago(14),
    useCaseId: null,
    createdAt: ago(15),
  },
  {
    id: id("ev", 3),
    projectId: "mock-project",
    eventType: "scheduled_trigger",
    sourceType: "scheduler",
    sourceId: id("t", 1),
    targetPersonaId: id("p", 3),
    payload: JSON.stringify({ schedule: "0 9 * * 1-5", timezone: "America/New_York" }),
    status: "processed",
    errorMessage: null,
    processedAt: ago(119),
    useCaseId: null,
    createdAt: ago(120),
  },
  {
    id: id("ev", 4),
    projectId: "mock-project",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: id("e", 2),
    targetPersonaId: id("p", 2),
    payload: JSON.stringify({ title: "Proposed Incident Mitigation", description: "The agent wants to restart the Redis cluster pods in production. This will cause ~30s of downtime for cached sessions.\n\nAffected services:\n- api-prod (checkout flow)\n- session-service\n- rate-limiter\n\nEstimated recovery: 2 minutes", severity: "critical" }),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: ago(14),
  },
  {
    id: id("ev", 5),
    projectId: "mock-project",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: id("e", 5),
    targetPersonaId: id("p", 5),
    payload: JSON.stringify({ title: "Publish Weekly Insights to Slack", description: "Ready to post the weekly customer feedback digest to #product-insights channel.\n\nSummary includes:\n- 342 tickets analyzed\n- Sentiment score: 8.2/10 (+0.4)\n- Top 3 feature requests\n- 2 emerging issues flagged", severity: "info" }),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: ago(1440),
  },
  {
    id: id("ev", 6),
    projectId: "mock-project",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: id("e", 3),
    targetPersonaId: id("p", 3),
    payload: JSON.stringify({ title: "Send Standup Digest Email", description: "Digest ready to send to team@acme.com. Contains activity from 8 team members across 3 repositories.", severity: "warning" }),
    status: "processed",
    errorMessage: null,
    processedAt: ago(118),
    useCaseId: null,
    createdAt: ago(119),
  },
  {
    id: id("ev", 7),
    projectId: "mock-project",
    eventType: "webhook_received",
    sourceType: "github",
    sourceId: "acme/frontend",
    targetPersonaId: id("p", 1),
    payload: JSON.stringify({ action: "opened", pull_request: { number: 343, title: "fix: resolve SSR hydration mismatch", user: { login: "alee" } } }, null, 2),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: ago(1),
  },
  {
    id: id("ev", 8),
    projectId: "mock-project",
    eventType: "gitlab_merge_request",
    sourceType: "gitlab",
    sourceId: "acme/backend",
    targetPersonaId: id("p", 1),
    payload: JSON.stringify({ object_kind: "merge_request", project: { path_with_namespace: "acme/backend" }, object_attributes: { iid: 78, title: "refactor: migrate to connection pooling", state: "opened" } }, null, 2),
    status: "failed",
    errorMessage: "No subscription matched for event type gitlab_merge_request with source acme/backend",
    processedAt: ago(60),
    useCaseId: null,
    createdAt: ago(60),
  },
];

// ---------------------------------------------------------------------------
// Subscriptions & Triggers (for agent detail panels)
// ---------------------------------------------------------------------------

export const MOCK_SUBSCRIPTIONS: Record<string, PersonaEventSubscription[]> = {
  [id("p", 1)]: [
    { id: id("sub", 1), personaId: id("p", 1), eventType: "webhook_received", sourceFilter: "github", enabled: true, useCaseId: null, createdAt: ago(7200), updatedAt: ago(7200) },
    { id: id("sub", 2), personaId: id("p", 1), eventType: "gitlab_merge_request", sourceFilter: null, enabled: true, useCaseId: null, createdAt: ago(3600), updatedAt: ago(3600) },
  ],
  [id("p", 2)]: [
    { id: id("sub", 3), personaId: id("p", 2), eventType: "alert_triggered", sourceFilter: "pagerduty", enabled: true, useCaseId: null, createdAt: ago(14400), updatedAt: ago(14400) },
  ],
  [id("p", 3)]: [],
  [id("p", 4)]: [
    { id: id("sub", 4), personaId: id("p", 4), eventType: "dependency_update", sourceFilter: null, enabled: false, useCaseId: null, createdAt: ago(86400), updatedAt: ago(43200) },
  ],
  [id("p", 5)]: [
    { id: id("sub", 5), personaId: id("p", 5), eventType: "scheduled_trigger", sourceFilter: null, enabled: true, useCaseId: null, createdAt: ago(172800), updatedAt: ago(172800) },
  ],
};

export const MOCK_TRIGGERS: Record<string, PersonaTrigger[]> = {
  [id("p", 1)]: [],
  [id("p", 2)]: [],
  [id("p", 3)]: [
    { id: id("t", 1), personaId: id("p", 3), triggerType: "cron", config: '{"schedule":"0 9 * * 1-5","timezone":"America/New_York"}', enabled: true, lastTriggeredAt: ago(120), nextTriggerAt: new Date(Date.now() + 14 * 3600_000).toISOString(), useCaseId: null, createdAt: ago(43200), updatedAt: ago(120) },
  ],
  [id("p", 4)]: [],
  [id("p", 5)]: [
    { id: id("t", 2), personaId: id("p", 5), triggerType: "cron", config: '{"schedule":"0 8 * * 1","timezone":"America/New_York"}', enabled: true, lastTriggeredAt: ago(1440), nextTriggerAt: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(), useCaseId: null, createdAt: ago(172800), updatedAt: ago(1440) },
  ],
};

// ---------------------------------------------------------------------------
// Execution detail (for polling)
// ---------------------------------------------------------------------------

const MOCK_OUTPUT_LINES = [
  "Starting PR review for acme/frontend#342...",
  "Fetching diff from GitHub API...",
  "Diff contains 14 files changed, +342 -89 lines",
  "",
  "## File Analysis",
  "",
  "### src/components/ThemeToggle.tsx (new file)",
  "- Clean implementation of dark mode toggle",
  "- Uses prefers-color-scheme media query correctly",
  "- Suggestion: Add aria-label for accessibility",
  "",
  "### src/app/globals.css",
  "- CSS custom properties properly scoped to :root",
  "- Good use of color-scheme property",
  "",
  "### src/hooks/useTheme.ts (new file)",
  "- localStorage persistence looks correct",
  "- Consider using useSyncExternalStore for SSR safety",
  "",
  "## Security Check",
  "- No sensitive data exposure detected",
  "- No new dependencies added",
  "",
  "## Summary",
  "Overall: APPROVE with minor suggestions",
  "- 1 accessibility improvement recommended",
  "- 1 SSR safety suggestion",
  "- Code quality: Excellent",
];

let mockOutputOffset = 0;

export function getMockExecutionDetail(executionId: string): ExecutionDetail {
  // Simulate progressive output for the "running" execution
  const exec = MOCK_EXECUTIONS.find((e) => e.id === executionId);
  const isRunning = exec?.status === "running";

  if (isRunning) {
    const end = Math.min(mockOutputOffset + 3, MOCK_OUTPUT_LINES.length);
    const chunk = MOCK_OUTPUT_LINES.slice(mockOutputOffset, end);
    const done = end >= MOCK_OUTPUT_LINES.length;
    mockOutputOffset = end;

    return {
      executionId,
      status: done ? "completed" : "running",
      outputLines: end,
      output: chunk,
      durationMs: done ? 18400 : undefined,
      totalCostUsd: done ? 0.0234 : undefined,
    };
  }

  return {
    executionId,
    status: exec?.status ?? "completed",
    outputLines: 0,
    output: exec?.outputData ? exec.outputData.split("\n") : [],
    durationMs: exec?.durationMs ?? undefined,
    totalCostUsd: exec?.costUsd ?? undefined,
  };
}

export function resetMockOutputOffset(): void {
  mockOutputOffset = 0;
}

// ---------------------------------------------------------------------------
// System health & status
// ---------------------------------------------------------------------------

export const MOCK_HEALTH: HealthResponse = {
  status: "ok",
  workers: { total: 4, idle: 2, executing: 2 },
  hasSubscription: true,
  timestamp: Date.now(),
};

export const MOCK_STATUS: StatusResponse = {
  workers: [
    { workerId: "w-001", status: "executing", version: "0.1.0", capabilities: ["claude-code"], currentExecutionId: id("e", 1), connectedAt: Date.now() - 3600_000, lastHeartbeat: Date.now() - 5_000 },
    { workerId: "w-002", status: "idle", version: "0.1.0", capabilities: ["claude-code"], connectedAt: Date.now() - 7200_000, lastHeartbeat: Date.now() - 10_000 },
    { workerId: "w-003", status: "executing", version: "0.1.0", capabilities: ["claude-code"], currentExecutionId: id("e", 7), connectedAt: Date.now() - 1800_000, lastHeartbeat: Date.now() - 3_000 },
    { workerId: "w-004", status: "idle", version: "0.1.0", capabilities: ["claude-code"], connectedAt: Date.now() - 14400_000, lastHeartbeat: Date.now() - 8_000 },
  ],
  workerCounts: { total: 4, idle: 2, executing: 2 },
  queueLength: 1,
  activeExecutions: [
    { executionId: id("e", 1), workerId: "w-001", startedAt: Date.now() - 120_000 },
  ],
  hasClaudeToken: true,
  oauth: { connected: true, scopes: ["user:read", "repo"], expiresAt: new Date(Date.now() + 3600_000).toISOString() },
};

// ---------------------------------------------------------------------------
// Manual reviews (parsed from events)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Observability metrics
// ---------------------------------------------------------------------------

function daysAgo(d: number): string {
  const date = new Date(Date.now() - d * 86400_000);
  return date.toISOString().split("T")[0];
}

export const MOCK_OBSERVABILITY_METRICS: ObservabilityMetrics = {
  totalCost: 4.82,
  totalExecutions: 47,
  successRate: 89.4,
  activePersonas: 4,
  costTrend: 12.3,
  execTrend: 8.5,
  successTrend: -2.1,
};

export const MOCK_DAILY_METRICS: DailyMetric[] = Array.from({ length: 14 }, (_, i) => {
  const day = 13 - i;
  const base = 2 + Math.sin(i * 0.7) * 1.5;
  const execs = Math.floor(3 + Math.random() * 5);
  const fails = Math.floor(Math.random() * 2);
  return {
    date: daysAgo(day),
    cost: +(base * (0.8 + Math.random() * 0.4)).toFixed(2),
    executions: execs,
    successes: execs - fails,
    failures: fails,
  };
});

export const MOCK_PERSONA_SPEND: PersonaSpend[] = [
  { personaId: id("p", 1), personaName: "PR Review Agent", personaColor: "#06b6d4", totalCost: 1.45, executionCount: 18, budgetUsd: 5.0 },
  { personaId: id("p", 2), personaName: "Incident Responder", personaColor: "#f43f5e", totalCost: 1.89, executionCount: 8, budgetUsd: 10.0 },
  { personaId: id("p", 3), personaName: "Daily Standup Digest", personaColor: "#a855f7", totalCost: 0.62, executionCount: 10, budgetUsd: 2.0 },
  { personaId: id("p", 5), personaName: "Customer Feedback Analyzer", personaColor: "#fbbf24", totalCost: 0.86, executionCount: 11, budgetUsd: 4.0 },
];

export const MOCK_HEALTH_ISSUES: HealthIssue[] = [
  { id: "hi-1", severity: "high", title: "High error rate on PR Review Agent", description: "Error rate exceeded 25% in the last hour. 3 of 12 executions failed due to context window overflow.", personaId: id("p", 1), personaName: "PR Review Agent", detectedAt: ago(30), status: "open", category: "error_rate" },
  { id: "hi-2", severity: "medium", title: "Budget threshold warning", description: "Daily Standup Digest has used 62% of its $2.00 monthly budget with 3 weeks remaining.", personaId: id("p", 3), personaName: "Daily Standup Digest", detectedAt: ago(180), status: "open", category: "budget" },
  { id: "hi-3", severity: "low", title: "Slow execution detected", description: "Customer Feedback Analyzer took 62.3s, which is 2.1x the average duration.", personaId: id("p", 5), personaName: "Customer Feedback Analyzer", detectedAt: ago(1440), status: "auto_fixed", category: "latency" },
  { id: "hi-4", severity: "critical", title: "Worker connection lost", description: "Worker w-005 disconnected unexpectedly. Last heartbeat was 5 minutes ago.", personaId: null, personaName: null, detectedAt: ago(5), status: "resolved", category: "infrastructure" },
];

// ---------------------------------------------------------------------------
// Usage analytics
// ---------------------------------------------------------------------------

export const MOCK_TOOL_USAGE: ToolUsageSummary[] = [
  { toolName: "github_pr_review", invocations: 142, avgDurationMs: 3200, successRate: 94.2 },
  { toolName: "slack_send_message", invocations: 98, avgDurationMs: 450, successRate: 99.0 },
  { toolName: "pagerduty_get_incident", invocations: 67, avgDurationMs: 820, successRate: 97.0 },
  { toolName: "github_get_diff", invocations: 58, avgDurationMs: 1200, successRate: 96.5 },
  { toolName: "linear_create_issue", invocations: 45, avgDurationMs: 680, successRate: 100.0 },
  { toolName: "zendesk_search_tickets", invocations: 34, avgDurationMs: 2100, successRate: 91.2 },
  { toolName: "datadog_query_metrics", invocations: 29, avgDurationMs: 1800, successRate: 93.1 },
  { toolName: "email_send", invocations: 22, avgDurationMs: 350, successRate: 100.0 },
];

export const MOCK_TOOL_USAGE_OVER_TIME: ToolUsageOverTime[] = Array.from({ length: 14 }, (_, i) => {
  const day = 13 - i;
  return {
    date: daysAgo(day),
    tools: {
      github_pr_review: Math.floor(8 + Math.random() * 6),
      slack_send_message: Math.floor(5 + Math.random() * 8),
      pagerduty_get_incident: Math.floor(2 + Math.random() * 6),
      github_get_diff: Math.floor(3 + Math.random() * 4),
      linear_create_issue: Math.floor(1 + Math.random() * 5),
    },
  };
});

export const MOCK_TOOL_USAGE_BY_PERSONA: ToolUsageByPersona[] = [
  { personaId: id("p", 1), personaName: "PR Review Agent", personaColor: "#06b6d4", tools: { github_pr_review: 142, github_get_diff: 58, slack_send_message: 24 } },
  { personaId: id("p", 2), personaName: "Incident Responder", personaColor: "#f43f5e", tools: { pagerduty_get_incident: 67, datadog_query_metrics: 29, slack_send_message: 38 } },
  { personaId: id("p", 3), personaName: "Daily Standup Digest", personaColor: "#a855f7", tools: { slack_send_message: 22, email_send: 22, linear_create_issue: 10 } },
  { personaId: id("p", 5), personaName: "Customer Feedback Analyzer", personaColor: "#fbbf24", tools: { zendesk_search_tickets: 34, slack_send_message: 14, linear_create_issue: 35 } },
];

// ---------------------------------------------------------------------------
// Manual reviews (parsed from events)
// ---------------------------------------------------------------------------

export const MOCK_REVIEWS: ManualReviewItem[] = [
  {
    id: id("ev", 4),
    personaId: id("p", 2),
    executionId: id("e", 2),
    eventType: "manual_review",
    content: "Proposed Incident Mitigation\nThe agent wants to restart the Redis cluster pods in production. This will cause ~30s of downtime for cached sessions.\n\nAffected services:\n- api-prod (checkout flow)\n- session-service\n- rate-limiter\n\nEstimated recovery: 2 minutes",
    severity: "critical",
    status: "pending",
    reviewerNotes: null,
    createdAt: ago(14),
    resolvedAt: null,
    resolvedBy: null,
    escalatedAt: null,
    personaName: "Incident Responder",
    personaIcon: undefined,
    personaColor: "#f43f5e",
  },
  {
    id: id("ev", 5),
    personaId: id("p", 5),
    executionId: id("e", 5),
    eventType: "manual_review",
    content: "Publish Weekly Insights to Slack\nReady to post the weekly customer feedback digest to #product-insights channel.\n\nSummary includes:\n- 342 tickets analyzed\n- Sentiment score: 8.2/10 (+0.4)\n- Top 3 feature requests\n- 2 emerging issues flagged",
    severity: "info",
    status: "pending",
    reviewerNotes: null,
    createdAt: ago(1440),
    resolvedAt: null,
    resolvedBy: null,
    escalatedAt: null,
    personaName: "Customer Feedback Analyzer",
    personaIcon: undefined,
    personaColor: "#fbbf24",
  },
  {
    id: id("ev", 6),
    personaId: id("p", 3),
    executionId: id("e", 3),
    eventType: "manual_review",
    content: "Send Standup Digest Email\nDigest ready to send to team@acme.com. Contains activity from 8 team members across 3 repositories.",
    severity: "warning",
    status: "approved",
    reviewerNotes: "Approved - looks good, send it out.",
    createdAt: ago(119),
    resolvedAt: ago(118),
    resolvedBy: "admin",
    escalatedAt: null,
    personaName: "Daily Standup Digest",
    personaIcon: undefined,
    personaColor: "#a855f7",
  },
];
