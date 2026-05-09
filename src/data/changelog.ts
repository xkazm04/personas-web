/* ── Desktop app changelog / release history ───────────────────────── */

export type ChangeType = "feature" | "improvement" | "fix" | "breaking";

export interface ChangeItem {
  text: string;
  type: ChangeType;
}

export interface Release {
  version: string;
  date: string;
  summary: string;
  changes: ChangeItem[];
}

export const CHANGE_TYPE_META: Record<ChangeType, { label: string; color: string }> = {
  feature: { label: "New", color: "#34d399" },
  improvement: { label: "Improved", color: "#06b6d4" },
  fix: { label: "Fixed", color: "#fbbf24" },
  breaking: { label: "Breaking", color: "#f43f5e" },
};

export const RELEASES: Release[] = [
  {
    version: "0.12.0",
    date: "2026-02-28",
    summary: "Cloud execution engine with live event streaming",
    changes: [
      { text: "Cloud orchestrator deployment target — run agents on remote servers", type: "feature" },
      { text: "Live event streaming dashboard with real-time execution visualization", type: "feature" },
      { text: "GitHub Actions deployment integration with repository dispatch", type: "feature" },
      { text: "Improved execution trace UI with parent-child span visualization", type: "improvement" },
      { text: "Fixed memory leak in long-running event bus connections", type: "fix" },
    ],
  },
  {
    version: "0.11.2",
    date: "2026-02-14",
    summary: "Dashboard polish — status badges, filter bar, and empty states",
    changes: [
      { text: "Agent status badges with real-time health indicators", type: "improvement" },
      { text: "Execution filter bar with date range, status, and agent selectors", type: "improvement" },
      { text: "Empty state illustrations for all dashboard sections", type: "improvement" },
      { text: "Fixed credential vault not refreshing after OAuth flow completion", type: "fix" },
    ],
  },
  {
    version: "0.11.0",
    date: "2026-01-30",
    summary: "Event bus subscriptions and webhook trigger support",
    changes: [
      { text: "Custom event bus with pub/sub subscriptions between agents", type: "feature" },
      { text: "Inbound webhook trigger on localhost:9420 with signature verification", type: "feature" },
      { text: "Event visualization with animated particle lanes", type: "feature" },
      { text: "Improved cron schedule preview with next-5-runs display", type: "improvement" },
      { text: "Fixed clipboard monitor not detecting multi-line text changes", type: "fix" },
    ],
  },
  {
    version: "0.10.0",
    date: "2026-01-15",
    summary: "Multi-provider AI with automatic model failover",
    changes: [
      { text: "Support for Claude (Anthropic), GPT (OpenAI), Gemini (Google), Copilot (GitHub)", type: "feature" },
      { text: "Automatic model failover with circuit-breaker health tracking", type: "feature" },
      { text: "Per-execution cost attribution and budget enforcement", type: "feature" },
      { text: "Token counting and usage analytics per provider", type: "improvement" },
      { text: "Provider configuration UI with connection testing", type: "improvement" },
    ],
  },
  {
    version: "0.9.0",
    date: "2025-12-20",
    summary: "Team canvas — visual multi-agent pipeline editor",
    changes: [
      { text: "Visual node-based pipeline editor using React Flow", type: "feature" },
      { text: "Data-flow connections between agents with type validation", type: "feature" },
      { text: "Pipeline execution controls with real-time status overlay", type: "feature" },
      { text: "Drag-and-drop agent placement with snap-to-grid", type: "improvement" },
    ],
  },
  {
    version: "0.8.0",
    date: "2025-12-01",
    summary: "Self-healing execution engine",
    changes: [
      { text: "Automatic transient failure detection and retry with exponential backoff", type: "feature" },
      { text: "Circuit-breaker pattern for provider health management", type: "feature" },
      { text: "Healing issue tracking with root-cause analysis", type: "feature" },
      { text: "Configurable retry budgets per provider", type: "improvement" },
      { text: "Fixed execution queue stalling when multiple agents trigger simultaneously", type: "fix" },
    ],
  },
  {
    version: "0.7.0",
    date: "2025-11-10",
    summary: "Credential vault with OS-native keyring",
    changes: [
      { text: "AES-256-GCM encrypted credential storage", type: "feature" },
      { text: "OS-native keyring integration (Windows DPAPI, macOS Keychain, Linux libsecret)", type: "feature" },
      { text: "AI-assisted OAuth browser flow with scope detection", type: "feature" },
      { text: "40+ pre-built connectors (Slack, GitHub, Jira, PostgreSQL, and more)", type: "feature" },
      { text: "Credential health checks with expiry notifications", type: "improvement" },
    ],
  },
  {
    version: "0.6.0",
    date: "2025-10-15",
    summary: "Observability dashboard with cost tracking",
    changes: [
      { text: "Real-time event bus visualization", type: "feature" },
      { text: "OpenTelemetry-style execution tracing", type: "feature" },
      { text: "Per-agent cost attribution dashboard", type: "feature" },
      { text: "Budget alerts and daily/monthly spending limits", type: "feature" },
      { text: "Execution history with search and replay", type: "improvement" },
    ],
  },
  {
    version: "0.5.0",
    date: "2025-09-20",
    summary: "Agent triggers — cron, clipboard, file watcher",
    changes: [
      { text: "Scheduled execution with 5-field cron expressions", type: "feature" },
      { text: "Clipboard monitor trigger with regex-based text detection", type: "feature" },
      { text: "File watcher trigger for filesystem event monitoring", type: "feature" },
      { text: "Chain trigger for multi-agent pipeline orchestration", type: "feature" },
      { text: "System tray with scheduler pause/resume controls", type: "improvement" },
    ],
  },
  {
    version: "0.4.0",
    date: "2025-08-25",
    summary: "Design review and quality gates",
    changes: [
      { text: "Automated design review generation for agent outputs", type: "feature" },
      { text: "Manual review queue with approval workflow", type: "feature" },
      { text: "Test suite runner with mock tools and scenario validation", type: "feature" },
      { text: "Quality scoring and prompt performance benchmarking", type: "improvement" },
    ],
  },
];
