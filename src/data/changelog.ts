/* ── Desktop app changelog / release history ───────────────────────── */

import type { BrandKey } from "@/lib/brand-theme";

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

// Single source of truth for change-type styling. `brand` keys into the
// brand-theme token system (the timeline resolves it to colors); per-type icons
// stay component-side (keyed by ChangeType) since they carry a React dependency.
export const CHANGE_TYPE_META: Record<ChangeType, { label: string; brand: BrandKey }> = {
  feature: { label: "New", brand: "emerald" },
  improvement: { label: "Improved", brand: "cyan" },
  fix: { label: "Fixed", brand: "amber" },
  breaking: { label: "Breaking", brand: "rose" },
};

export const RELEASES: Release[] = [
  {
    version: "1.1.0",
    date: "2026-08-07",
    summary: "Cross-device Athena, conversational fleet dispatch, and portable workspaces",
    changes: [
      { text: "Pair two machines and let your Athena hand work to the other device's Athena, with progress streamed back", type: "feature" },
      { text: "Digital twins and Athena's memory export in encrypted workspace bundles and move to another machine", type: "feature" },
      { text: "Ask Athena for a fleet plan in chat — editable session rows, confirm once to launch up to eight sessions", type: "feature" },
      { text: "Athena steers the Mastermind canvas — camera travel, island framing, and on-surface improvement popovers", type: "feature" },
      { text: "Approved-work dispatch panel shows what you approved and whether it was actually sent", type: "feature" },
      { text: "Finished fleet sessions announce completion instead of waiting to be noticed", type: "improvement" },
      { text: "Dev merges verify content landed on HEAD before pruning — a refused merge no longer strands work", type: "fix" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-04",
    summary: "Mastermind command canvas and consolidated scan sweeps",
    changes: [
      { text: "Mastermind hex canvas is the primary channel into the dev-tools layers, with Ship milestone chips and Factory deep links", type: "feature" },
      { text: "Athena reads, annotates, and composes panels on the Mastermind canvas", type: "feature" },
      { text: "scan-sweep — one scan reads a context once and every matched lens judges it, with findings landing in the backlog", type: "feature" },
      { text: "Run a Ship milestone as a Claude Code skill and ingest its results through one validated door", type: "feature" },
      { text: "Dev projects and workspace knowledge travel with workspace exports", type: "feature" },
      { text: "Staggered island hydration — the canvas opens instantly and data ripples in without freezing", type: "improvement" },
      { text: "The 22 single-lens scan skills are retired — scan-sweep is the only scan entry point", type: "breaking" },
    ],
  },
  {
    version: "0.16.0",
    date: "2026-07-29",
    summary: "Factory passports, Ship forecasts, and one-click project populate",
    changes: [
      { text: "Populate project data — context map, feature inventory, and a KPI set you approve one proposal at a time", type: "feature" },
      { text: "Ship forecasts the next milestone's landing date from your own median cut-to-ship history", type: "feature" },
      { text: "New Scope-frozen exit criterion — a milestone that kept growing can't certify shipped without the creep being seen", type: "feature" },
      { text: "Passport actions explain their impact, steps, and boundaries before they run", type: "improvement" },
      { text: "KPI proposals now measure the product, not the repository", type: "improvement" },
      { text: "Milestones created active get their cut baseline stamped, so scope-creep detection actually fires", type: "fix" },
    ],
  },
  {
    version: "0.15.0",
    date: "2026-07-16",
    summary: "Fleet at scale, honest health scoring, and sharper knowledge retrieval",
    changes: [
      { text: "Fleet live-slot scheduler caps concurrent sessions and hibernates idle ones oldest-first", type: "feature" },
      { text: "Headless background fleet sessions with near-zero idle CPU", type: "feature" },
      { text: "SLA breach events — reliability breaches notify once, with hysteresis so an episode never flaps", type: "feature" },
      { text: "Knowledge base supersedes changed documents on re-ingest and gains a Rebuild index action", type: "improvement" },
      { text: "One health formula everywhere — composite scoring stops double-counting success rate", type: "improvement" },
      { text: "Cascade chains show measured co-failure correlation instead of a hardcoded strength", type: "fix" },
    ],
  },
  {
    version: "0.14.0",
    date: "2026-07-10",
    summary: "Memory that reflects — consolidation, recall by value, and graceful forgetting",
    changes: [
      { text: "Memory reflection consolidates related memories into durable insights with full provenance, applied only on your approval", type: "feature" },
      { text: "Team reflection promotes lessons shared by multiple members into team-wide insights", type: "feature" },
      { text: "Reflection files product findings from memories into the dev backlog for triage", type: "feature" },
      { text: "Value-aware recall packs the most valuable memories whole into the prompt budget", type: "improvement" },
      { text: "Decay-based forgetting archives stale low-importance memories reversibly", type: "improvement" },
    ],
  },
  {
    version: "0.13.0",
    date: "2026-07-07",
    summary: "Persona Foundry and connector API intelligence",
    changes: [
      { text: "Persona Foundry — compose agents from mentality archetypes, memory strategies, and capability recipes", type: "feature" },
      { text: "Curated connector API-update events — subscribe to change feeds for connector APIs, delivered fully locally", type: "feature" },
      { text: "Composition x-ray shows a template's parts before you adopt it, and adopted capabilities can be removed again", type: "feature" },
      { text: "Illustrated empty states with traced, self-drawing glyphs across six first-run surfaces", type: "improvement" },
      { text: "Template adoption now applies authored mentality dials instead of silently dropping them", type: "fix" },
    ],
  },
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
