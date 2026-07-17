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
  // Optional: the synced (real-mode) projection doesn't track usage. Left
  // undefined there so the UI omits the segment rather than printing "0 uses"
  // as if it were a measured fact.
  usageCount?: number;
  acceptedAt: string; // ISO
  lastUsed?: string; // ISO
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
  /** Group key — parents store their own id; replies inherit the parent's id. */
  threadId: string;
  /** True for the first message in a thread (parent); replies set this to false. */
  isThreadParent: boolean;
  persona: string;
  personaColor: string;
  timestamp: string; // ISO
  subject: string;
  status: MessageStatus;
  payload: string; // JSON string (raw view)
  body: string; // Markdown report (rendered as the message detail)
}

/** A conversation: a parent message + ordered replies, with derived counts. */
export interface MessageThread {
  id: string;
  persona: string;
  personaColor: string;
  subject: string;
  parent: FeedbackMessage;
  replies: FeedbackMessage[];
  latestTimestamp: string;
  unreadCount: number;
}

interface MessageFacts {
  executionId: string;
  persona: string;
  durationMs: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  worker: string;
  attempt: number;
}

function fmtMsgDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// Markdown report bodies, one per subject (round-robined in the generator).
// English-only mock content (like the report copy elsewhere), interpolating
// each run's facts. Authored to stay within MarkdownReport's supported subset.
function messageReportBody(idx: number, f: MessageFacts): string {
  const dur = fmtMsgDuration(f.durationMs);
  const cost = `$${f.costUsd.toFixed(4)}`;
  const tokens = `${f.inputTokens.toLocaleString()} in / ${f.outputTokens.toLocaleString()} out`;
  switch (idx) {
    case 0:
      return `## Run summary
**${f.persona}** completed \`${f.executionId}\` on \`${f.worker}\` in **${dur}**.

| Metric | Value |
| --- | --- |
| Model | ${f.model} |
| Tokens | ${tokens} |
| Cost | ${cost} |
| Attempt | ${f.attempt} |

### Notes
- All items processed; no retries required.
- Results written to the shared output bucket.

> Next scheduled run in ~6 minutes.`;
    case 1:
      return `## Escalation required
**${f.persona}** exhausted its retry budget on \`${f.executionId}\` and is handing off for human review.

### What happened
- 3 attempts, each failing at the *publish* step.
- Last error: \`HTTP 503 from downstream\`.

### Suggested action
1. Confirm the downstream service is healthy.
2. Approve a manual retry, or skip this item.

> Paused after ${dur} on \`${f.worker}\`.`;
    case 2:
      return `## New pattern learned
\`${f.persona}\` promoted a recurring tool sequence into memory:

\`\`\`
webhook.incoming → categorize → route
\`\`\`

- Observed **17 times** over the last 7 days with a 96% success rate.
- Confidence is now high enough to apply it automatically.

This should cut median latency on inbound webhooks.`;
    case 3:
      return `## Cost spike detected
The last run of **${f.persona}** cost **${cost}** — well above its trailing average.

| Driver | Impact |
| --- | --- |
| Model | ${f.model} |
| Tokens | ${tokens} |
| Duration | ${dur} |

### Recommendation
- Route simple inputs to \`haiku-4-5\`.
- Cap context to the last 8 turns.`;
    case 4:
      return `## Tool deprecation warning
**GitHub REST v3** is being retired, and \`${f.persona}\` still calls it on \`${f.executionId}\`.

- Migrate to the GraphQL API before the cutoff.
- Affected calls: \`issues.list\`, \`pulls.get\`.

See the [migration guide](https://docs.github.com) for details.`;
    case 5:
      return `## Model downgrade recommended
For simple CSV tasks, **${f.persona}** matches quality on a cheaper model.

| Option | Quality | Cost |
| --- | --- | --- |
| sonnet-4-6 | 94% | ${cost} |
| haiku-4-5 | 92% | ~1/8 |

> Estimated savings are significant at the current volume.`;
    case 6:
      return `## Rate limit handled
Slack API returned **429** during \`${f.executionId}\`. \`${f.persona}\` applied exponential backoff and recovered.

- Backoff schedule: \`2s -> 8s -> 32s\`
- Recovered on attempt **${f.attempt}** after ${dur}.

No items were dropped.`;
    case 7:
      return `## Memory pruned
\`${f.persona}\` dropped **3 stale conversation threads** to keep its working set sharp.

- Freed context for higher-signal memories.
- No active tasks referenced the pruned threads.

Routine maintenance — no action needed.`;
    case 8:
      return `## A/B candidate ready
A new prompt candidate for **${f.persona}** is ready for testing.

1. Run baseline vs. candidate over the last 50 executions.
2. Score on reliability, cost, and latency.
3. Promote the winner.

> Open the **Lab** to start the comparison.`;
    default:
      return `## Queue drained
The rate-limit window reset and **${f.persona}** drained its backlog.

| Metric | Value |
| --- | --- |
| Cleared on | \`${f.worker}\` |
| Duration | ${dur} |
| Cost | ${cost} |

All pending items are now processed.`;
  }
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

// Reply bodies — short follow-ups from a human or another agent. Round-robined
// per reply position so threads feel like real conversations without bloating
// the mock fixture.
const REPLY_BODIES = [
  `Approved — going ahead with the suggested action.`,
  `Confirmed the upstream is healthy now. Retried successfully on **attempt {n}**.`,
  `Heads up: this might recur next batch if the rate-limit window doesn't reset on time.`,
  `Filed a ticket for the deprecation; the GraphQL migration is on the next sprint.`,
  `Promoted the candidate — \`prompt_v3\` is now the live config.`,
];

function messageReplyBody(replyIdx: number, n: number): string {
  const tmpl = REPLY_BODIES[replyIdx % REPLY_BODIES.length];
  return tmpl.replace("{n}", String(n));
}

// Thread shapes: a list of reply counts. 14 threads total → ~42 messages.
// Mix singletons with multi-reply threads so the list shows real variety.
const THREAD_REPLY_COUNTS = [0, 2, 1, 3, 0, 1, 0, 0, 2, 0, 0, 1, 0, 4, 0, 1, 0, 0, 2, 0];

const messageThreadFixtures = (() => {
  const rng = seededRandom(711);
  const threads: MessageThread[] = [];
  const flat: FeedbackMessage[] = [];
  let cursor = 0;
  for (let t = 0; t < THREAD_REPLY_COUNTS.length; t++) {
    const persona = MESSAGE_PERSONAS[t % MESSAGE_PERSONAS.length];
    const subjectIdx = t % MESSAGE_SUBJECTS.length;
    const subject = MESSAGE_SUBJECTS[subjectIdx];
    const parentMinutesAgo = Math.floor(t * 73 + rng() * 60);
    const parentTimestamp = new Date(Date.now() - parentMinutesAgo * 60_000).toISOString();
    const facts: MessageFacts = {
      executionId: `exec_${String(40000 + cursor).padStart(6, "0")}`,
      persona: persona.name,
      durationMs: Math.floor(400 + rng() * 9500),
      model: rng() < 0.4 ? "haiku-4-5" : "sonnet-4-6",
      inputTokens: Math.floor(200 + rng() * 2200),
      outputTokens: Math.floor(80 + rng() * 1200),
      costUsd: +(0.001 + rng() * 0.18).toFixed(4),
      worker: "worker-" + (Math.floor(rng() * 8) + 1),
      attempt: Math.floor(rng() * 3) + 1,
    };
    const payload = JSON.stringify(
      {
        executionId: facts.executionId,
        persona: facts.persona,
        durationMs: facts.durationMs,
        model: facts.model,
        tokens: { input: facts.inputTokens, output: facts.outputTokens },
        costUsd: facts.costUsd,
        tags: rng() < 0.5 ? ["scheduled", "batch"] : ["ad-hoc"],
        metadata: { ranOn: facts.worker, attempt: facts.attempt },
      },
      null,
      0,
    );
    const threadId = `thr_${t + 1}`;
    const parentId = `msg_${cursor + 1}`;
    cursor++;
    const parent: FeedbackMessage = {
      id: parentId,
      threadId,
      isThreadParent: true,
      persona: persona.name,
      personaColor: persona.color,
      timestamp: parentTimestamp,
      subject,
      status: t < 3 ? "unread" : "read",
      payload,
      body: messageReportBody(subjectIdx, facts),
    };
    const replies: FeedbackMessage[] = [];
    const replyCount = THREAD_REPLY_COUNTS[t];
    for (let r = 0; r < replyCount; r++) {
      const replyMinutesAgo = parentMinutesAgo - (r + 1) * Math.floor(8 + rng() * 22);
      const replyTimestamp = new Date(Date.now() - Math.max(1, replyMinutesAgo) * 60_000).toISOString();
      replies.push({
        id: `msg_${cursor + 1}`,
        threadId,
        isThreadParent: false,
        persona: persona.name,
        personaColor: persona.color,
        timestamp: replyTimestamp,
        subject: `Re: ${subject}`,
        status: t === 1 && r === 1 ? "unread" : "read",
        payload,
        body: messageReplyBody(r, facts.attempt),
      });
      cursor++;
    }
    flat.push(parent, ...replies);
    const latestTimestamp = replies.length > 0
      ? replies[replies.length - 1].timestamp
      : parentTimestamp;
    const unreadCount = [parent, ...replies].filter((m) => m.status === "unread").length;
    threads.push({
      id: threadId,
      persona: persona.name,
      personaColor: persona.color,
      subject,
      parent,
      replies,
      latestTimestamp,
      unreadCount,
    });
  }
  return { threads, flat };
})();

export const MOCK_MESSAGE_THREADS: MessageThread[] = messageThreadFixtures.threads;

/**
 * Flat list of all messages (parents + replies in thread order). Kept for
 * legacy consumers; new code should prefer MOCK_MESSAGE_THREADS.
 */
export const MOCK_MESSAGES: FeedbackMessage[] = messageThreadFixtures.flat;

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

// ── Execution heatmap (home: per-agent activity, last 7 days) ────────
// Mirrors the desktop ExecutionHeatmap as a compact agent × day grid:
// one row per persona, one cell per day (oldest → newest). Counts are
// seeded so the grid is deterministic across renders.

export const HEATMAP_DAYS = 7;

export interface HeatmapRow {
  persona: string;
  color: string;
  /** Execution counts, one per day, oldest → newest (length HEATMAP_DAYS). */
  days: number[];
}

export const MOCK_EXECUTION_HEATMAP: HeatmapRow[] = (() => {
  const rng = seededRandom(7);
  return MOCK_HEALTH_DIGEST.agents.map((agent, idx) => ({
    persona: agent.name,
    color: agent.color,
    days: Array.from({ length: HEATMAP_DAYS }, (_, d) =>
      Math.round(Math.max(0, agent.score / 9 + Math.sin((d + idx) * 0.8) * 4 + rng() * 7)),
    ),
  }));
})();

// ── Upcoming scheduled routines (home) ──────────────────────────────
// Mirrors the desktop UpcomingRoutinesCard: the next scheduled runs across
// the fleet. `eta` is a pre-computed, demo-static label (no live clock).

export type RoutineTrigger = "schedule" | "polling" | "webhook" | "event";

export interface UpcomingRoutine {
  id: string;
  persona: string;
  color: string;
  trigger: RoutineTrigger;
  /** Time until the next run, e.g. "6m", "1h", "1d" (demo-static). */
  eta: string;
}

export const MOCK_UPCOMING_ROUTINES: UpcomingRoutine[] = [
  { id: "ur_1", persona: "ResearchAgent", color: "#06b6d4", trigger: "schedule", eta: "6m" },
  { id: "ur_2", persona: "NotifyBot", color: "#a855f7", trigger: "polling", eta: "23m" },
  { id: "ur_3", persona: "DataProcessor", color: "#fbbf24", trigger: "schedule", eta: "1h" },
  { id: "ur_4", persona: "CodeReviewer", color: "#34d399", trigger: "webhook", eta: "3h" },
  { id: "ur_5", persona: "ReportGen", color: "#f43f5e", trigger: "schedule", eta: "1d" },
];

// ── Credential vault recent changes (home) ──────────────────────────
// Mirrors the desktop VaultRecentChangesCard. `secret` names are technical
// identifiers shown verbatim; `ago` is a pre-computed, demo-static label.

export type VaultAction = "rotated" | "added" | "revoked" | "synced";

export interface VaultChange {
  id: string;
  /** Credential identifier — shown verbatim (not translated). */
  secret: string;
  action: VaultAction;
  /** How long ago the change happened, e.g. "4m", "2h" (demo-static). */
  ago: string;
}

export const MOCK_VAULT_CHANGES: VaultChange[] = [
  { id: "vc_1", secret: "GITHUB_OAUTH_TOKEN", action: "rotated", ago: "4m" },
  { id: "vc_2", secret: "SLACK_WEBHOOK_URL", action: "synced", ago: "31m" },
  { id: "vc_3", secret: "OPENAI_API_KEY", action: "added", ago: "2h" },
  { id: "vc_4", secret: "STRIPE_SECRET_KEY", action: "revoked", ago: "5h" },
  { id: "vc_5", secret: "GCAL_REFRESH_TOKEN", action: "rotated", ago: "1d" },
];

// ── Settings: model providers (BYOM policy) ─────────────────────────
// Which model providers the fleet may use, with rough usage. Provider/model
// names are proper nouns shown verbatim (not translated).

export interface ModelProvider {
  id: string;
  name: string;
  model: string;
  allowed: boolean;
  requests: number;
  costUsd: number;
}

export const MOCK_MODEL_PROVIDERS: ModelProvider[] = [
  { id: "claude-sonnet", name: "Anthropic Claude", model: "sonnet-4-6", allowed: true, requests: 8421, costUsd: 142.18 },
  { id: "claude-haiku", name: "Anthropic Haiku", model: "haiku-4-5", allowed: true, requests: 3120, costUsd: 11.4 },
  { id: "openai", name: "OpenAI", model: "gpt-4o", allowed: true, requests: 1894, costUsd: 63.72 },
  { id: "gemini", name: "Google Gemini", model: "gemini-2.0", allowed: false, requests: 0, costUsd: 0 },
  { id: "llama", name: "Meta Llama", model: "llama-3.3-70b", allowed: false, requests: 0, costUsd: 0 },
];

// ── Incidents Inbox (audit-log incidents across the fleet) ──────────
// Mirrors the desktop overview's Incidents Inbox (sub_incidents): the
// HealthIssue model promoted to a richer AuditIncident with an originating
// audit-log table (source), a status lifecycle (open/resolved/ignored/
// escalated), and a recommended action shown in the detail modal. Demo-only —
// no synced source. Dates are stamped once at module load (deterministic).

export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "resolved" | "ignored" | "escalated";
export type IncidentSource =
  | "executions"
  | "events"
  | "triggers"
  | "vault"
  | "messages"
  | "reviews";

export interface AuditIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  /** Originating audit-log table (source_table on the desktop). */
  source: IncidentSource;
  persona: string;
  personaColor: string;
  detectedAt: string; // ISO
  resolvedAt: string | null; // null unless status is resolved
  category: string;
  /** Suggested remediation, shown in the detail modal. */
  recommendation: string;
  isCircuitBreaker?: boolean;
  autoFixApplied?: string;
}

export const INCIDENT_SEVERITIES: IncidentSeverity[] = ["critical", "high", "medium", "low"];
export const INCIDENT_STATUSES: IncidentStatus[] = ["open", "resolved", "ignored", "escalated"];
export const INCIDENT_SOURCES: IncidentSource[] = [
  "executions",
  "events",
  "triggers",
  "vault",
  "messages",
  "reviews",
];

const INCIDENT_MIN = 60_000;
const INCIDENT_HOUR = 3_600_000;

export const MOCK_AUDIT_INCIDENTS: AuditIncident[] = [
  {
    id: "inc_1",
    title: "Slack webhook circuit-broken",
    description:
      "NotifyBot's Slack delivery tripped the circuit breaker after 3 consecutive 5xx responses; outbound notifications are paused.",
    severity: "critical",
    status: "escalated",
    source: "events",
    persona: "NotifyBot",
    personaColor: "#a855f7",
    detectedAt: new Date(Date.now() - 42 * INCIDENT_MIN).toISOString(),
    resolvedAt: null,
    category: "delivery",
    recommendation: "Verify the Slack incoming-webhook URL in the vault and reset the breaker once upstream recovers.",
    isCircuitBreaker: true,
  },
  {
    id: "inc_2",
    title: "P95 latency sustained above SLO",
    description:
      "ReportGen P95 held at 34.8s against a 30s objective for over an hour, driven by nested-schema CSV parsing.",
    severity: "high",
    status: "open",
    source: "executions",
    persona: "ReportGen",
    personaColor: "#f43f5e",
    detectedAt: new Date(Date.now() - 3 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "performance",
    recommendation: "Route nested-schema inputs to the streaming parser and cap concurrency at 4.",
  },
  {
    id: "inc_3",
    title: "Working-set memory trending up",
    description:
      "DataProcessor RSS grew 38% over 24h without a matching drop, suggesting a retained-buffer leak in the CSV path.",
    severity: "medium",
    status: "open",
    source: "executions",
    persona: "DataProcessor",
    personaColor: "#fbbf24",
    detectedAt: new Date(Date.now() - 5 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "resource",
    recommendation: "Profile the parser heap and release row buffers after each batch flush.",
  },
  {
    id: "inc_4",
    title: "Credential rotated past policy window",
    description:
      "ResearchAgent's search-API key exceeded its 90-day rotation window; auto-rotation re-issued and synced a fresh key.",
    severity: "low",
    status: "resolved",
    source: "vault",
    persona: "ResearchAgent",
    personaColor: "#06b6d4",
    detectedAt: new Date(Date.now() - 26 * INCIDENT_HOUR).toISOString(),
    resolvedAt: new Date(Date.now() - 25 * INCIDENT_HOUR).toISOString(),
    category: "security",
    recommendation: "No action needed — rotation policy handled this automatically.",
    autoFixApplied: "Rotated SEARCH_API_KEY and synced to all consumers.",
  },
  {
    id: "inc_5",
    title: "Referenced secret missing from vault",
    description:
      "DataProcessor referenced STRIPE_SECRET_KEY, which was revoked 5h ago; dependent runs fail fast at startup.",
    severity: "critical",
    status: "open",
    source: "vault",
    persona: "DataProcessor",
    personaColor: "#fbbf24",
    detectedAt: new Date(Date.now() - 70 * INCIDENT_MIN).toISOString(),
    resolvedAt: null,
    category: "security",
    recommendation: "Re-add STRIPE_SECRET_KEY or update the persona config to drop the revoked dependency.",
  },
  {
    id: "inc_6",
    title: "Execution timed out at turn cap",
    description:
      "CodeReviewer hit its 20-turn cap on a large diff and was terminated before producing a verdict.",
    severity: "high",
    status: "resolved",
    source: "executions",
    persona: "CodeReviewer",
    personaColor: "#34d399",
    detectedAt: new Date(Date.now() - 9 * INCIDENT_HOUR).toISOString(),
    resolvedAt: new Date(Date.now() - 8 * INCIDENT_HOUR).toISOString(),
    category: "performance",
    recommendation: "Raise maxTurns for review tasks over 400 changed lines, or chunk the diff.",
  },
  {
    id: "inc_7",
    title: "Duplicate notifications detected",
    description:
      "NotifyBot emitted the same digest twice within 90s after a retry raced the success ack.",
    severity: "medium",
    status: "ignored",
    source: "messages",
    persona: "NotifyBot",
    personaColor: "#a855f7",
    detectedAt: new Date(Date.now() - 14 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "delivery",
    recommendation: "Add an idempotency key on the digest send; low impact, deferred by the operator.",
  },
  {
    id: "inc_8",
    title: "Cron drift corrected",
    description:
      "ResearchAgent's hourly poll drifted 11 minutes after a DST transition; the scheduler re-anchored the next run.",
    severity: "low",
    status: "resolved",
    source: "triggers",
    persona: "ResearchAgent",
    personaColor: "#06b6d4",
    detectedAt: new Date(Date.now() - 30 * INCIDENT_HOUR).toISOString(),
    resolvedAt: new Date(Date.now() - 30 * INCIDENT_HOUR + 20 * INCIDENT_MIN).toISOString(),
    category: "scheduling",
    recommendation: "No action needed — the scheduler self-corrected on the next tick.",
    autoFixApplied: "Re-anchored the cron schedule to UTC.",
  },
  {
    id: "inc_9",
    title: "Review SLA breached",
    description:
      "A critical manual review for ReportGen sat unactioned past its 30-minute SLA and was auto-escalated.",
    severity: "high",
    status: "escalated",
    source: "reviews",
    persona: "ReportGen",
    personaColor: "#f43f5e",
    detectedAt: new Date(Date.now() - 55 * INCIDENT_MIN).toISOString(),
    resolvedAt: null,
    category: "oversight",
    recommendation: "Assign a second reviewer or widen the critical-severity SLA in the escalation policy.",
  },
  {
    id: "inc_10",
    title: "Repeated tool failure",
    description:
      "DataProcessor's `http.fetch` tool failed 7 times in 10 minutes against the same host (connection reset).",
    severity: "critical",
    status: "open",
    source: "executions",
    persona: "DataProcessor",
    personaColor: "#fbbf24",
    detectedAt: new Date(Date.now() - 2 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "reliability",
    recommendation: "Add exponential backoff to http.fetch and a per-host circuit breaker.",
  },
  {
    id: "inc_11",
    title: "Event backlog building",
    description:
      "CodeReviewer's inbound `pull_request.opened` queue grew to 24 unprocessed events during a traffic spike.",
    severity: "medium",
    status: "open",
    source: "events",
    persona: "CodeReviewer",
    personaColor: "#34d399",
    detectedAt: new Date(Date.now() - 4 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "throughput",
    recommendation: "Raise maxConcurrent for CodeReviewer or shed low-priority draft PRs.",
  },
  {
    id: "inc_12",
    title: "Low-confidence pattern flagged",
    description:
      "ResearchAgent surfaced a cost-quality pattern at 0.41 confidence; below the 0.6 acceptance threshold.",
    severity: "low",
    status: "ignored",
    source: "events",
    persona: "ResearchAgent",
    personaColor: "#06b6d4",
    detectedAt: new Date(Date.now() - 40 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "learning",
    recommendation: "Informational only — gather more samples before promoting the pattern.",
  },
  {
    id: "inc_13",
    title: "Webhook signature mismatch",
    description:
      "NotifyBot rejected 3 inbound webhooks with an invalid HMAC signature, likely a rotated signing secret upstream.",
    severity: "high",
    status: "open",
    source: "triggers",
    persona: "NotifyBot",
    personaColor: "#a855f7",
    detectedAt: new Date(Date.now() - 80 * INCIDENT_MIN).toISOString(),
    resolvedAt: null,
    category: "security",
    recommendation: "Sync the new signing secret into the vault and re-enable the trigger.",
  },
  {
    id: "inc_14",
    title: "Token rate limit throttled",
    description:
      "ResearchAgent hit the provider per-minute token limit during a burst; requests were throttled and retried.",
    severity: "medium",
    status: "resolved",
    source: "executions",
    persona: "ResearchAgent",
    personaColor: "#06b6d4",
    detectedAt: new Date(Date.now() - 12 * INCIDENT_HOUR).toISOString(),
    resolvedAt: new Date(Date.now() - 12 * INCIDENT_HOUR + 8 * INCIDENT_MIN).toISOString(),
    category: "rate-limit",
    recommendation: "No action needed — adaptive backoff cleared the burst.",
    autoFixApplied: "Throttled to 60% and retried with jitter.",
  },
  {
    id: "inc_15",
    title: "Pending review aging",
    description:
      "A warning-severity review for CodeReviewer has been pending for 3h, approaching its 4h SLA.",
    severity: "low",
    status: "open",
    source: "reviews",
    persona: "CodeReviewer",
    personaColor: "#34d399",
    detectedAt: new Date(Date.now() - 3 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "oversight",
    recommendation: "Action the review before the SLA expires to avoid auto-escalation.",
  },
  {
    id: "inc_16",
    title: "Credential rotation overdue",
    description:
      "ReportGen's GCAL_REFRESH_TOKEN is 4 days past its rotation window with auto-rotation disabled for this secret.",
    severity: "medium",
    status: "escalated",
    source: "vault",
    persona: "ReportGen",
    personaColor: "#f43f5e",
    detectedAt: new Date(Date.now() - 20 * INCIDENT_HOUR).toISOString(),
    resolvedAt: null,
    category: "security",
    recommendation: "Enable auto-rotation for GCAL_REFRESH_TOKEN or rotate it manually now.",
  },
];

/**
 * Unresolved-incident count for the nav badge (mirrors MOCK_UNREAD_MESSAGES).
 * "Unresolved" = open + escalated, matching the Incidents KPI header's headline
 * so the badge and the page agree.
 */
export const MOCK_OPEN_INCIDENTS = MOCK_AUDIT_INCIDENTS.filter(
  (incident) => incident.status === "open" || incident.status === "escalated",
).length;

// ── System Health Panel (runtime / services / resources / integrations) ──
// Mirrors the desktop overview's System Health Panel (components/health): four
// section cards of status-dotted checks, a disk-usage bar, and illustrative
// install/configure actions (demo no-ops). Item names + details are technical
// identifiers shown verbatim (not translated). Demo-only.

export type HealthCheckStatus = "ok" | "warn" | "error" | "info";
export type HealthSectionKey = "runtime" | "services" | "resources" | "integrations";
export type HealthActionKind = "install" | "configure";

export interface HealthCheckItem {
  id: string;
  /** Technical name shown verbatim. */
  name: string;
  status: HealthCheckStatus;
  /** Short status line shown verbatim. */
  detail: string;
  /** When set, the row shows a demo action button (no-op → toast). */
  action?: HealthActionKind;
  /** Optional version/identifier suffix. */
  meta?: string;
}

export interface HealthCheckSection {
  key: HealthSectionKey;
  items: HealthCheckItem[];
}

export const HEALTH_SECTION_ORDER: HealthSectionKey[] = [
  "runtime",
  "services",
  "resources",
  "integrations",
];

export const MOCK_HEALTH_CHECKS: HealthCheckSection[] = [
  {
    key: "runtime",
    items: [
      { id: "rt_node", name: "Node.js runtime", status: "ok", detail: "Healthy", meta: "v22.3.0" },
      { id: "rt_cli", name: "Claude Code CLI", status: "ok", detail: "Connected", meta: "v1.4.2" },
      { id: "rt_daemon", name: "Orchestrator daemon", status: "ok", detail: "Running · uptime 6d 4h" },
      { id: "rt_gpu", name: "GPU acceleration", status: "warn", detail: "Not detected — falling back to CPU", action: "configure" },
    ],
  },
  {
    key: "services",
    items: [
      { id: "sv_api", name: "Local API", status: "ok", detail: "200 OK · 12ms" },
      { id: "sv_ws", name: "WebSocket bridge", status: "ok", detail: "Connected · 5 subscribers" },
      { id: "sv_sched", name: "Scheduler", status: "ok", detail: "Next tick in 6m" },
      { id: "sv_vector", name: "Vector store", status: "warn", detail: "High memory — 82% of cache" },
    ],
  },
  {
    key: "resources",
    items: [
      { id: "rs_cpu", name: "CPU", status: "ok", detail: "28% avg · 8 cores" },
      { id: "rs_mem", name: "Memory", status: "warn", detail: "12.4 / 16 GB · 78%" },
      { id: "rs_net", name: "Network", status: "ok", detail: "↓ 1.2 MB/s · ↑ 0.3 MB/s" },
    ],
  },
  {
    key: "integrations",
    items: [
      { id: "in_github", name: "GitHub", status: "ok", detail: "Authorized · 3 repos" },
      { id: "in_slack", name: "Slack", status: "error", detail: "Webhook circuit-broken", action: "configure" },
      { id: "in_gcal", name: "Google Calendar", status: "ok", detail: "Authorized" },
      { id: "in_openai", name: "OpenAI", status: "ok", detail: "Key valid" },
      { id: "in_stripe", name: "Stripe", status: "info", detail: "Not configured", action: "configure" },
      { id: "in_gemini", name: "Google Gemini", status: "info", detail: "Available — not enabled", action: "install" },
    ],
  },
];

/** Disk-usage gauge for the Resources card. */
export const MOCK_DISK_USAGE = { usedGb: 142, totalGb: 256 };

/** Non-ok health-check count, for the nav badge. */
export const MOCK_HEALTH_ALERTS = MOCK_HEALTH_CHECKS.reduce(
  (n, section) => n + section.items.filter((i) => i.status === "error").length,
  0,
);

// ── Activity Metrics: Athena usage + Value Rollup ───────────────────
// Mirrors the desktop overview's Activity Metrics: the Companion (Athena)
// cost-by-action stacked area (invoke / recall / fallback) and a value-
// delivered rollup. Demo-only; deterministic (seeded at module load).

export interface AthenaUsagePoint {
  date: string; // MM-DD
  invoke: number; // USD cost
  recall: number;
  fallback: number;
  /** Previous-period total cost, for the compare overlay. */
  prevTotal: number;
}

export const MOCK_ATHENA_USAGE: AthenaUsagePoint[] = (() => {
  const rng = seededRandom(321);
  const days = 14;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const date = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const invoke = Number((0.9 + Math.sin(i * 0.5) * 0.25 + rng() * 0.3).toFixed(2));
    const recall = Number((0.45 + Math.sin(i * 0.7) * 0.12 + rng() * 0.15).toFixed(2));
    const fallback = Number((0.18 + rng() * 0.12).toFixed(2));
    const total = invoke + recall + fallback;
    // Previous period ran ~12–24% cheaper, so compare shows a rising trend.
    const prevTotal = Number((total * (0.76 + rng() * 0.12)).toFixed(2));
    return { date, invoke, recall, fallback, prevTotal };
  });
})();

export interface ValueRollup {
  /** Outcome counts over the period. */
  delivered: number;
  partial: number;
  blocked: number;
  /** Total Companion cost over the period (USD). */
  costUsd: number;
  /** Previous-period value-delivered rate (0–1), for compare. */
  prevDeliveredRate: number;
  /** Previous-period cost per delivered outcome (USD), for compare. */
  prevCostPerValue: number;
}

export const MOCK_VALUE_ROLLUP: ValueRollup = {
  delivered: 412,
  partial: 78,
  blocked: 31,
  costUsd: 34.6,
  prevDeliveredRate: 0.74,
  prevCostPerValue: 0.092,
};

// ── Rotation Overview (credential rotation status) ──────────────────
// Mirrors the desktop overview's Rotation Overview: per-credential rotation
// policy / auto-rotation / anomaly / next-rotation status. Secret names are
// technical identifiers shown verbatim. Demo-only (vault is local-by-design).

export interface CredentialRotation {
  id: string;
  /** Credential identifier — shown verbatim (not translated). */
  secret: string;
  /** A rotation policy is configured for this credential. */
  hasPolicy: boolean;
  /** Auto-rotation is enabled (vs. manual). */
  enabled: boolean;
  /** An access/usage anomaly was detected against this credential. */
  anomaly: boolean;
  /** Past its rotation window. */
  overdue: boolean;
  /** Time until the next rotation, e.g. "12d" (demo-static). */
  nextRotation: string;
  intervalDays: number;
}

export const MOCK_CREDENTIAL_ROTATIONS: CredentialRotation[] = [
  { id: "cr_github", secret: "GITHUB_OAUTH_TOKEN", hasPolicy: true, enabled: true, anomaly: false, overdue: false, nextRotation: "12d", intervalDays: 90 },
  { id: "cr_slack", secret: "SLACK_WEBHOOK_URL", hasPolicy: true, enabled: true, anomaly: true, overdue: false, nextRotation: "3d", intervalDays: 30 },
  { id: "cr_openai", secret: "OPENAI_API_KEY", hasPolicy: true, enabled: false, anomaly: false, overdue: false, nextRotation: "21d", intervalDays: 90 },
  { id: "cr_stripe", secret: "STRIPE_SECRET_KEY", hasPolicy: false, enabled: false, anomaly: false, overdue: false, nextRotation: "—", intervalDays: 0 },
  { id: "cr_gcal", secret: "GCAL_REFRESH_TOKEN", hasPolicy: true, enabled: false, anomaly: false, overdue: true, nextRotation: "—", intervalDays: 60 },
];

