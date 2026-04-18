// ── Mock data for dashboard visualizations ──────────────────────────
// Generates realistic-looking data for maximum visitor impression.

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTimeSeries(
  days: number,
  baseFn: (i: number, total: number) => number,
  noise: number,
  seed = 42,
): number[] {
  const rng = seededRandom(seed);
  return Array.from({ length: days }, (_, i) =>
    Math.max(0, baseFn(i, days) + (rng() - 0.5) * noise),
  );
}

// ── Sparkline data for metric cards ─────────────────────────────────

export const SPARKLINE_COST = generateTimeSeries(14, (i) => 12 + i * 0.8 + Math.sin(i * 0.5) * 3, 4, 10);
export const SPARKLINE_EXECUTIONS = generateTimeSeries(14, (i) => 40 + i * 2.5 + Math.sin(i * 0.7) * 8, 10, 20);
export const SPARKLINE_SUCCESS = generateTimeSeries(14, (i) => 94 + Math.sin(i * 0.4) * 3, 2, 30);
export const SPARKLINE_AGENTS = generateTimeSeries(14, (i) => 5 + Math.floor(i / 4), 1, 40);

// ── Latency percentile data ─────────────────────────────────────────

export interface LatencyPoint {
  date: string;
  p50: number;
  p95: number;
  p99: number;
}

export const MOCK_LATENCY_DATA: LatencyPoint[] = (() => {
  const rng = seededRandom(77);
  const days = 14;
  const result: LatencyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const base = 180 + Math.sin(i * 0.6) * 40 + rng() * 30;
    result.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      p50: Math.round(base),
      p95: Math.round(base * 2.2 + rng() * 60),
      p99: Math.round(base * 4.5 + rng() * 120),
    });
  }
  return result;
})();

// ── Period comparison mock data ─────────────────────────────────────

export interface ComparePoint {
  date: string;
  current: number;
  previous: number;
}

export const MOCK_COST_COMPARE: ComparePoint[] = (() => {
  const rng = seededRandom(88);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      current: +(8 + i * 0.6 + Math.sin(i * 0.5) * 3 + rng() * 4).toFixed(2),
      previous: +(6 + i * 0.4 + Math.sin(i * 0.5) * 2 + rng() * 3).toFixed(2),
    };
  });
})();

export const MOCK_EXEC_COMPARE: ComparePoint[] = (() => {
  const rng = seededRandom(99);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      current: Math.round(30 + i * 2 + Math.sin(i * 0.7) * 8 + rng() * 10),
      previous: Math.round(22 + i * 1.5 + Math.sin(i * 0.7) * 6 + rng() * 8),
    };
  });
})();

// ── Cost anomaly data ───────────────────────────────────────────────

export interface CostAnomaly {
  date: string;
  cost: number;
  deviation: number; // sigma
  topExecutionId: string;
}

export const MOCK_COST_ANOMALIES: CostAnomaly[] = [
  { date: "2026-03-04", cost: 34.82, deviation: 2.7, topExecutionId: "exec_a9f3e2" },
  { date: "2026-03-07", cost: 41.15, deviation: 3.1, topExecutionId: "exec_b7c1d4" },
];

// ── Health issues with auto-healing ─────────────────────────────────

export interface MockHealthIssue {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "auto_fixed" | "resolved";
  personaName: string;
  detectedAt: string;
  category: string;
  isCircuitBreaker?: boolean;
  autoFixApplied?: string;
}

export const MOCK_HEALTH_ISSUES: MockHealthIssue[] = [
  {
    id: "hi_1",
    title: "Token rate limit exceeded",
    description: "Claude API rate limit hit 3 times in 5 minutes for ResearchAgent. Automatic backoff applied with exponential retry.",
    severity: "high",
    status: "auto_fixed",
    personaName: "ResearchAgent",
    detectedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    category: "rate_limit",
    autoFixApplied: "Exponential backoff (2s → 8s → 32s)",
  },
  {
    id: "hi_2",
    title: "Circuit breaker tripped — Slack API",
    description: "5 consecutive failures to Slack webhook. Circuit breaker activated, requests paused for 60s cooldown.",
    severity: "critical",
    status: "open",
    personaName: "NotifyBot",
    detectedAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    category: "circuit_breaker",
    isCircuitBreaker: true,
  },
  {
    id: "hi_3",
    title: "Memory usage above threshold",
    description: "DataProcessor agent using 847MB of 1GB allocation. Consider pruning conversation history or increasing limit.",
    severity: "medium",
    status: "open",
    personaName: "DataProcessor",
    detectedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    category: "resource",
  },
  {
    id: "hi_4",
    title: "Stale tool credentials",
    description: "GitHub OAuth token expires in 2 hours. Auto-refreshed using stored refresh token.",
    severity: "low",
    status: "auto_fixed",
    personaName: "CodeReviewer",
    detectedAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    category: "credentials",
    autoFixApplied: "Token auto-refreshed via OAuth flow",
  },
  {
    id: "hi_5",
    title: "Execution timeout exceeded",
    description: "ReportGen took 145s (limit: 120s). Task was gracefully terminated and partial results saved.",
    severity: "high",
    status: "resolved",
    personaName: "ReportGen",
    detectedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    category: "timeout",
  },
];

// ── Knowledge graph patterns ────────────────────────────────────────

export interface KnowledgePattern {
  id: string;
  personaName: string;
  knowledgeType: "tool_sequence" | "failure_pattern" | "cost_quality" | "model_performance" | "data_flow";
  patternKey: string;
  successCount: number;
  failureCount: number;
  confidence: number; // 0-1
  avgCostUsd: number;
  avgDurationMs: number;
  description: string;
  lastSeen: string;
}

export const MOCK_KNOWLEDGE_PATTERNS: KnowledgePattern[] = [
  {
    id: "kp_1",
    personaName: "ResearchAgent",
    knowledgeType: "tool_sequence",
    patternKey: "web_search → summarize → email",
    successCount: 142,
    failureCount: 3,
    confidence: 0.97,
    avgCostUsd: 0.023,
    avgDurationMs: 4200,
    description: "Optimal research pipeline: search web first, then summarize findings, and deliver via email. 97% success rate with average cost $0.023.",
    lastSeen: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: "kp_2",
    personaName: "CodeReviewer",
    knowledgeType: "failure_pattern",
    patternKey: "large_diff_timeout",
    successCount: 0,
    failureCount: 12,
    confidence: 0.85,
    avgCostUsd: 0.089,
    avgDurationMs: 120_000,
    description: "Diffs exceeding 500 lines consistently cause timeout failures. Recommend splitting into smaller review chunks.",
    lastSeen: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "kp_3",
    personaName: "DataProcessor",
    knowledgeType: "cost_quality",
    patternKey: "haiku_vs_sonnet_csv",
    successCount: 89,
    failureCount: 7,
    confidence: 0.72,
    avgCostUsd: 0.004,
    avgDurationMs: 1800,
    description: "CSV parsing tasks achieve 92% accuracy with Haiku at 1/8th the cost of Sonnet. Quality tradeoff acceptable for structured data.",
    lastSeen: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "kp_4",
    personaName: "NotifyBot",
    knowledgeType: "data_flow",
    patternKey: "event → filter → route → deliver",
    successCount: 1247,
    failureCount: 18,
    confidence: 0.98,
    avgCostUsd: 0.001,
    avgDurationMs: 340,
    description: "Event-driven notification pipeline processes events through content filter, routes by severity, delivers to appropriate channel.",
    lastSeen: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    id: "kp_5",
    personaName: "ReportGen",
    knowledgeType: "model_performance",
    patternKey: "opus_complex_analysis",
    successCount: 34,
    failureCount: 1,
    confidence: 0.94,
    avgCostUsd: 0.145,
    avgDurationMs: 28_000,
    description: "Complex multi-source analysis tasks perform best with Opus model. 97% accuracy vs 71% for Sonnet on the same task type.",
    lastSeen: new Date(Date.now() - 14400_000).toISOString(),
  },
  {
    id: "kp_6",
    personaName: "ResearchAgent",
    knowledgeType: "tool_sequence",
    patternKey: "api_call → validate → transform",
    successCount: 234,
    failureCount: 8,
    confidence: 0.91,
    avgCostUsd: 0.012,
    avgDurationMs: 2100,
    description: "REST API integration pattern: call endpoint, validate response schema, transform to target format. Consistent 96% success rate.",
    lastSeen: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    id: "kp_7",
    personaName: "CodeReviewer",
    knowledgeType: "cost_quality",
    patternKey: "sonnet_code_review_optimal",
    successCount: 167,
    failureCount: 5,
    confidence: 0.88,
    avgCostUsd: 0.034,
    avgDurationMs: 8500,
    description: "Sonnet 4.5 provides optimal cost/quality ratio for code reviews under 200 lines. Quality comparable to Opus at 25% of the cost.",
    lastSeen: new Date(Date.now() - 5400_000).toISOString(),
  },
  {
    id: "kp_8",
    personaName: "DataProcessor",
    knowledgeType: "failure_pattern",
    patternKey: "json_nested_depth_limit",
    successCount: 0,
    failureCount: 6,
    confidence: 0.65,
    avgCostUsd: 0.018,
    avgDurationMs: 5200,
    description: "JSON objects nested deeper than 8 levels cause parsing failures. Flatten before processing or increase depth limit.",
    lastSeen: new Date(Date.now() - 86400_000).toISOString(),
  },
];

// ── Event bus visualization mock data ───────────────────────────────

export interface SwarmNode {
  id: string;
  label: string;
  type: "persona" | "source";
  color: string;
  icon?: string;
  volume: number; // 0-1 traffic volume factor
}

export interface EventFlow {
  id: string;
  sourceId: string;
  targetId: string;
  eventType: string;
  timestamp: number;
  durationMs: number;
  status: "success" | "failure" | "processing";
}

export const SWARM_PERSONAS: SwarmNode[] = [
  { id: "p_research", label: "ResearchAgent", type: "persona", color: "#06b6d4", icon: "🔍", volume: 0.85 },
  { id: "p_notify", label: "NotifyBot", type: "persona", color: "#a855f7", icon: "🔔", volume: 0.7 },
  { id: "p_code", label: "CodeReviewer", type: "persona", color: "#34d399", icon: "🔧", volume: 0.6 },
  { id: "p_data", label: "DataProcessor", type: "persona", color: "#fbbf24", icon: "📊", volume: 0.9 },
  { id: "p_report", label: "ReportGen", type: "persona", color: "#f43f5e", icon: "📝", volume: 0.45 },
];

export const SWARM_SOURCES: SwarmNode[] = [
  { id: "s_github", label: "GitHub", type: "source", color: "#8b949e", volume: 0.9 },
  { id: "s_slack", label: "Slack", type: "source", color: "#e01e5a", volume: 0.75 },
  { id: "s_webhook", label: "Webhooks", type: "source", color: "#06b6d4", volume: 0.5 },
  { id: "s_cron", label: "Scheduler", type: "source", color: "#a855f7", volume: 0.6 },
  { id: "s_api", label: "REST API", type: "source", color: "#34d399", volume: 0.4 },
  { id: "s_email", label: "Email", type: "source", color: "#fbbf24", volume: 0.3 },
];

export const EVENT_TYPES = [
  "pull_request.opened",
  "message.received",
  "cron.triggered",
  "webhook.incoming",
  "api.request",
  "email.received",
  "review.requested",
  "build.completed",
  "deploy.success",
  "alert.fired",
];

// ── Chart annotation marks ──────────────────────────────────────────

export interface ChartAnnotation {
  date: string;
  label: string;
  type: "deployment" | "incident" | "milestone";
}

export const MOCK_ANNOTATIONS: ChartAnnotation[] = [
  { date: "03-03", label: "v2.1 deployed", type: "deployment" },
  { date: "03-05", label: "Slack outage", type: "incident" },
  { date: "03-07", label: "1k executions", type: "milestone" },
];

// ── Memory actions for home page ────────────────────────────────────

export interface MemoryAction {
  id: string;
  type: "throttle" | "schedule" | "alert" | "config" | "routing";
  title: string;
  description: string;
  persona: string;
  score: number;
}

export const MOCK_MEMORY_ACTIONS: MemoryAction[] = [
  {
    id: "ma_1",
    type: "throttle",
    title: "Reduce ResearchAgent frequency",
    description: "ResearchAgent runs 3x more than needed during weekends. Consider throttling to hourly schedule on Sat/Sun.",
    persona: "ResearchAgent",
    score: 9,
  },
  {
    id: "ma_2",
    type: "alert",
    title: "Set up cost alert for DataProcessor",
    description: "DataProcessor cost increased 40% this week. Recommend setting a $5/day budget alert threshold.",
    persona: "DataProcessor",
    score: 8,
  },
  {
    id: "ma_3",
    type: "routing",
    title: "Route low-priority reviews to Haiku",
    description: "72% of CodeReviewer tasks are simple lint checks. Route these to Haiku to save ~$12/week.",
    persona: "CodeReviewer",
    score: 8,
  },
];

// ── Memory library (dashboard/memories route) ───────────────────────
// Richer than MOCK_MEMORY_ACTIONS: stores persistent, accepted-or-pending
// patterns the fleet has learned over time. Mirrors desktop's sub_memories.

export type MemoryStatus = "active" | "pending" | "archived";

export interface MemoryItem {
  id: string;
  type: MemoryAction["type"];
  title: string;
  description: string;
  persona: string;
  score: number; // 1-10
  status: MemoryStatus;
  usageCount: number;
  acceptedAt: string; // ISO
  lastUsed: string; // ISO
  hasConflict: boolean;
  conflictReason?: string;
}

const CONFLICT_REASONS = [
  "Contradicts an older throttle policy that is still active",
  "Overlaps scope with a more specific routing rule",
  "Disagrees with a user-pinned config from last week",
  "Same trigger window as a scheduled memory",
];

const MEMORY_PERSONAS = [
  "ResearchAgent",
  "NotifyBot",
  "CodeReviewer",
  "DataProcessor",
  "ReportGen",
];

const MEMORY_TYPES: MemoryAction["type"][] = [
  "throttle",
  "schedule",
  "alert",
  "config",
  "routing",
];

const MEMORY_TITLE_POOL: Record<MemoryAction["type"], string[]> = {
  throttle: [
    "Back off after 3 rapid failures",
    "Weekend cadence drop to hourly",
    "Peak-hour rate limit awareness",
    "Circuit break on 5xx spike",
  ],
  schedule: [
    "Pre-warm cache at 06:00 UTC",
    "Nightly snapshot window 02:00-04:00",
    "Shift load to off-peak EU hours",
    "Delay non-critical runs during deploys",
  ],
  alert: [
    "Page on cost deviation > 2σ",
    "Escalate after 30min unresolved critical",
    "Notify when token budget reaches 80%",
    "Silence known flaky dependency alerts",
  ],
  config: [
    "Trim system prompt for simple tasks",
    "Increase max_tokens for long-form output",
    "Enable structured-output mode for API calls",
    "Pin model version for reproducibility",
  ],
  routing: [
    "Route lint checks to Haiku",
    "Fall back to Sonnet on Opus timeout",
    "Prefer streaming for latency-sensitive requests",
    "Split large payloads across 2 workers",
  ],
};

function pickTitle(
  type: MemoryAction["type"],
  seed: number,
): string {
  const pool = MEMORY_TITLE_POOL[type];
  return pool[seed % pool.length];
}

export const MOCK_MEMORIES: MemoryItem[] = (() => {
  const rng = seededRandom(555);
  const items: MemoryItem[] = [];
  const total = 60;
  for (let i = 0; i < total; i++) {
    const type = MEMORY_TYPES[i % MEMORY_TYPES.length];
    const persona = MEMORY_PERSONAS[i % MEMORY_PERSONAS.length];
    const statusRoll = rng();
    const status: MemoryStatus =
      statusRoll < 0.65
        ? "active"
        : statusRoll < 0.88
          ? "pending"
          : "archived";
    const score = 4 + Math.floor(rng() * 7); // 4-10
    const usageCount = status === "archived" ? Math.floor(rng() * 50) : Math.floor(rng() * 900) + 20;
    const ageDays = Math.floor(rng() * 120) + 1;
    const acceptedAt = new Date(
      Date.now() - ageDays * 86_400_000,
    ).toISOString();
    const lastUsedHours = Math.floor(rng() * Math.min(ageDays * 24, 480)) + 1;
    const lastUsed = new Date(
      Date.now() - lastUsedHours * 3_600_000,
    ).toISOString();
    const hasConflict = rng() < 0.12;
    items.push({
      id: `mem_${i + 1}`,
      type,
      title: pickTitle(type, i),
      description: `Learned from ${usageCount} ${persona} executions. Confidence ${score}/10 with consistent positive outcomes across the observed window.`,
      persona,
      score,
      status,
      usageCount,
      acceptedAt,
      lastUsed,
      hasConflict,
      conflictReason: hasConflict
        ? CONFLICT_REASONS[Math.floor(rng() * CONFLICT_REASONS.length)]
        : undefined,
    });
  }
  return items;
})();

// ── Leaderboard scores ──────────────────────────────────────────────
// Composite score + 5-axis metrics profile per persona for radar chart.

export type LeaderboardTrend = "up" | "down" | "flat";

export interface LeaderboardPersona {
  id: string;
  name: string;
  color: string;
  metrics: {
    reliability: number; // 0-100
    cost: number;
    speed: number;
    quality: number;
    volume: number;
  };
  composite: number; // derived average, also exposed
  trend: LeaderboardTrend;
  delta: number; // +/- vs last period
}

function computeComposite(m: LeaderboardPersona["metrics"]): number {
  const avg =
    (m.reliability + m.cost + m.speed + m.quality + m.volume) / 5;
  return Math.round(avg);
}

export const MOCK_LEADERBOARD: LeaderboardPersona[] = (() => {
  const base: Omit<LeaderboardPersona, "composite">[] = [
    {
      id: "research",
      name: "ResearchAgent",
      color: "#06b6d4",
      metrics: { reliability: 95, cost: 82, speed: 78, quality: 92, volume: 88 },
      trend: "up",
      delta: 4,
    },
    {
      id: "code",
      name: "CodeReviewer",
      color: "#34d399",
      metrics: { reliability: 91, cost: 88, speed: 72, quality: 94, volume: 66 },
      trend: "up",
      delta: 2,
    },
    {
      id: "report",
      name: "ReportGen",
      color: "#f43f5e",
      metrics: { reliability: 88, cost: 74, speed: 54, quality: 90, volume: 48 },
      trend: "flat",
      delta: 0,
    },
    {
      id: "data",
      name: "DataProcessor",
      color: "#fbbf24",
      metrics: { reliability: 68, cost: 78, speed: 84, quality: 72, volume: 94 },
      trend: "down",
      delta: -6,
    },
    {
      id: "notify",
      name: "NotifyBot",
      color: "#a855f7",
      metrics: { reliability: 42, cost: 90, speed: 96, quality: 64, volume: 82 },
      trend: "down",
      delta: -12,
    },
  ];
  return base
    .map((p) => ({ ...p, composite: computeComposite(p.metrics) }))
    .sort((a, b) => b.composite - a.composite);
})();

// ── SLA monitoring ──────────────────────────────────────────────────

export type SLAMetricType = "availability" | "latency" | "successRate";
export type SLASeverity = "minor" | "major" | "critical";

export interface SLATarget {
  id: string;
  persona: string;
  personaColor: string;
  metric: SLAMetricType;
  target: number;
  current: number;
  unit: string; // "%" | "ms"
  timeInSLA: number; // 0-1
  direction: "higher" | "lower"; // "higher is better" vs "lower is better"
  activeBreach: boolean;
}

export const MOCK_SLA_TARGETS: SLATarget[] = [
  {
    id: "sla_1",
    persona: "ResearchAgent",
    personaColor: "#06b6d4",
    metric: "availability",
    target: 99.9,
    current: 99.97,
    unit: "%",
    timeInSLA: 0.9987,
    direction: "higher",
    activeBreach: false,
  },
  {
    id: "sla_2",
    persona: "CodeReviewer",
    personaColor: "#34d399",
    metric: "latency",
    target: 500,
    current: 312,
    unit: "ms",
    timeInSLA: 0.998,
    direction: "lower",
    activeBreach: false,
  },
  {
    id: "sla_3",
    persona: "DataProcessor",
    personaColor: "#fbbf24",
    metric: "successRate",
    target: 98,
    current: 96.4,
    unit: "%",
    timeInSLA: 0.943,
    direction: "higher",
    activeBreach: true,
  },
  {
    id: "sla_4",
    persona: "ReportGen",
    personaColor: "#f43f5e",
    metric: "latency",
    target: 30_000,
    current: 34_800,
    unit: "ms",
    timeInSLA: 0.882,
    direction: "lower",
    activeBreach: true,
  },
  {
    id: "sla_5",
    persona: "NotifyBot",
    personaColor: "#a855f7",
    metric: "availability",
    target: 99.5,
    current: 97.1,
    unit: "%",
    timeInSLA: 0.915,
    direction: "higher",
    activeBreach: true,
  },
];

export interface SLABreach {
  id: string;
  persona: string;
  metric: SLAMetricType;
  startedAt: string; // ISO
  resolvedAt: string | null; // null = ongoing
  durationMinutes: number;
  severity: SLASeverity;
  summary: string;
}

export const MOCK_SLA_BREACHES: SLABreach[] = [
  {
    id: "br_1",
    persona: "NotifyBot",
    metric: "availability",
    startedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    resolvedAt: null,
    durationMinutes: 45,
    severity: "critical",
    summary: "Slack webhook circuit-broken; 3 retries exhausted.",
  },
  {
    id: "br_2",
    persona: "ReportGen",
    metric: "latency",
    startedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    resolvedAt: null,
    durationMinutes: 180,
    severity: "major",
    summary: "P95 latency sustained above 30s target.",
  },
  {
    id: "br_3",
    persona: "DataProcessor",
    metric: "successRate",
    startedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    resolvedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    durationMinutes: 120,
    severity: "major",
    summary: "Success rate fell to 94% during CSV parser regression.",
  },
  {
    id: "br_4",
    persona: "ResearchAgent",
    metric: "latency",
    startedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    resolvedAt: new Date(Date.now() - 23 * 3600_000).toISOString(),
    durationMinutes: 60,
    severity: "minor",
    summary: "Upstream search-API latency spike, recovered autonomously.",
  },
];

// ── Async feedback messages ─────────────────────────────────────────
// Mirrors desktop sub_messages: persisted async feedback from personas
// (user-directed reports, prompts, prompts-to-review). Includes JSON payload.

export type MessageStatus = "unread" | "read";

export interface FeedbackMessage {
  id: string;
  persona: string;
  personaColor: string;
  timestamp: string; // ISO
  subject: string;
  status: MessageStatus;
  payload: string; // JSON string (for JsonViewer)
}

const MESSAGE_SUBJECTS = [
  "Execution completed — batch #4821",
  "Retry budget exceeded, escalating to human",
  "Learned new pattern: webhook.incoming → categorize → route",
  "Cost spike detected on last run",
  "Tool deprecation warning for GitHub REST v3",
  "Model downgrade recommended for simple CSV tasks",
  "Slack API returned 429 — backoff applied",
  "Memory pruned: 3 stale conversation threads dropped",
  "New prompt candidate ready for A/B testing",
  "Rate limit window reset; queue drained",
];

const MESSAGE_PERSONAS = [
  { name: "ResearchAgent", color: "#06b6d4" },
  { name: "CodeReviewer", color: "#34d399" },
  { name: "DataProcessor", color: "#fbbf24" },
  { name: "ReportGen", color: "#f43f5e" },
  { name: "NotifyBot", color: "#a855f7" },
];

export const MOCK_MESSAGES: FeedbackMessage[] = (() => {
  const rng = seededRandom(711);
  const items: FeedbackMessage[] = [];
  const total = 42;
  for (let i = 0; i < total; i++) {
    const persona = MESSAGE_PERSONAS[i % MESSAGE_PERSONAS.length];
    const minutesAgo = Math.floor(i * 37 + rng() * 90);
    const timestamp = new Date(
      Date.now() - minutesAgo * 60_000,
    ).toISOString();
    const subject = MESSAGE_SUBJECTS[i % MESSAGE_SUBJECTS.length];
    const payload = JSON.stringify(
      {
        executionId: `exec_${String(40000 + i).padStart(6, "0")}`,
        persona: persona.name,
        durationMs: Math.floor(400 + rng() * 9500),
        model: rng() < 0.4 ? "haiku-4-5" : "sonnet-4-6",
        tokens: {
          input: Math.floor(200 + rng() * 2200),
          output: Math.floor(80 + rng() * 1200),
        },
        costUsd: +(0.001 + rng() * 0.18).toFixed(4),
        tags: rng() < 0.5 ? ["scheduled", "batch"] : ["ad-hoc"],
        metadata: {
          ranOn: "worker-" + (Math.floor(rng() * 8) + 1),
          attempt: Math.floor(rng() * 3) + 1,
        },
      },
      null,
      0,
    );
    items.push({
      id: `msg_${i + 1}`,
      persona: persona.name,
      personaColor: persona.color,
      timestamp,
      subject,
      status: i < 7 ? "unread" : "read",
      payload,
    });
  }
  return items;
})();

// ── Event swim-lane ─────────────────────────────────────────────────
// Time-ordered per-persona trace rendered on the Events page.

export interface SwimlaneEvent {
  id: string;
  personaId: string; // matches SWARM_PERSONAS id
  timestamp: number; // epoch ms
  eventType: string;
  status: "success" | "failure" | "processing";
}

export const SWIMLANE_WINDOW_MS = 15 * 60_000;

export const MOCK_SWIMLANE_EVENTS: SwimlaneEvent[] = (() => {
  const rng = seededRandom(909);
  const events: SwimlaneEvent[] = [];
  const windowStart = Date.now() - SWIMLANE_WINDOW_MS;
  const total = 38;
  for (let i = 0; i < total; i++) {
    const persona = SWARM_PERSONAS[i % SWARM_PERSONAS.length];
    const roll = rng();
    const status: SwimlaneEvent["status"] =
      roll < 0.82 ? "success" : roll < 0.95 ? "failure" : "processing";
    events.push({
      id: `sw_${i + 1}`,
      personaId: persona.id,
      timestamp: windowStart + Math.floor(rng() * SWIMLANE_WINDOW_MS),
      eventType: EVENT_TYPES[Math.floor(rng() * EVENT_TYPES.length)],
      status,
    });
  }
  return events.sort((a, b) => a.timestamp - b.timestamp);
})();

// ── Health digest for home page ─────────────────────────────────────

export interface HealthDigest {
  overallScore: number; // 0-100
  agents: {
    name: string;
    score: number;
    issues: number;
    lastRun: string;
    color: string;
  }[];
}

// ── Home badge metrics (desktop parity) ─────────────────────────────

export const MOCK_UNREAD_MESSAGES = 7;

// Cumulative global execution count (larger than the loaded list).
export const MOCK_GLOBAL_EXECUTIONS = 12_847;

// ── Fleet optimization recommendation ───────────────────────────────
// Mirrors desktop's single-top-recommendation panel. Surfaced on /dashboard/home.

export type FleetRecommendationSeverity = "urgent" | "suggested" | "insight";
export type FleetRecommendationCategory =
  | "cost"
  | "reliability"
  | "retry"
  | "model";

export interface FleetRecommendation {
  id: string;
  severity: FleetRecommendationSeverity;
  category: FleetRecommendationCategory;
  title: string;
  summary: string;
  detail: string;
  impact: string;
  personaName?: string;
  actionLabel: string;
  actionHref?: string;
}

export const MOCK_FLEET_RECOMMENDATION: FleetRecommendation = {
  id: "fr_1",
  severity: "suggested",
  category: "cost",
  title: "Downgrade DataProcessor to Haiku for CSV tasks",
  summary:
    "72% of DataProcessor runs are simple CSV parses — Haiku matches Sonnet quality at 1/8th the cost.",
  detail:
    "Observed 89 CSV-parsing executions over the last 30 days. Haiku achieved 92% task success vs Sonnet's 94% on the same prompts, while using 12% of the token spend. Recommended to route `knowledge_type=cost_quality` patterns tagged `haiku_vs_sonnet_csv` through Haiku by default, with Sonnet reserved for nested-schema fallbacks.",
  impact: "≈ $48/month saved",
  personaName: "DataProcessor",
  actionLabel: "Review routing policy",
  actionHref: "/dashboard/agents",
};

export const MOCK_HEALTH_DIGEST: HealthDigest = {
  overallScore: 87,
  agents: [
    { name: "ResearchAgent", score: 95, issues: 0, lastRun: new Date(Date.now() - 300_000).toISOString(), color: "#06b6d4" },
    { name: "NotifyBot", score: 72, issues: 2, lastRun: new Date(Date.now() - 180_000).toISOString(), color: "#a855f7" },
    { name: "CodeReviewer", score: 91, issues: 0, lastRun: new Date(Date.now() - 600_000).toISOString(), color: "#34d399" },
    { name: "DataProcessor", score: 84, issues: 1, lastRun: new Date(Date.now() - 120_000).toISOString(), color: "#fbbf24" },
    { name: "ReportGen", score: 88, issues: 0, lastRun: new Date(Date.now() - 3600_000).toISOString(), color: "#f43f5e" },
  ],
};
