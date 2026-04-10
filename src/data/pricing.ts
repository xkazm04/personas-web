/* ── Feature comparison: Personas (OpenClaw) vs n8n ─────────────────── */

export interface ComparisonCategory {
  name: string;
  features: ComparisonRow[];
}

export interface ComparisonRow {
  label: string;
  personas: string | boolean;
  n8n: string | boolean;
  highlight?: boolean;
}

export const COMPARISON_DATA: ComparisonCategory[] = [
  {
    name: "Pricing",
    features: [
      { label: "Desktop app cost", personas: "Free forever", n8n: "Free (self-hosted)", highlight: true },
      { label: "Cloud execution", personas: "You pay only for Claude Code usage", n8n: "From €20/mo", highlight: true },
      { label: "Orchestration cost", personas: "Free — no markup", n8n: "Per-workflow pricing" },
    ],
  },
  {
    name: "AI Agent Capabilities",
    features: [
      { label: "Natural language agent creation", personas: true, n8n: false, highlight: true },
      { label: "Multi-provider AI (Claude, GPT, Gemini)", personas: true, n8n: "Via plugins" },
      { label: "Version-controlled prompts with diffs", personas: true, n8n: false },
      { label: "Automatic failover between models", personas: true, n8n: false },
      { label: "Self-healing execution engine", personas: true, n8n: false, highlight: true },
      { label: "Prompt performance benchmarking", personas: true, n8n: false },
    ],
  },
  {
    name: "Triggers & Integrations",
    features: [
      { label: "40+ built-in connectors", personas: true, n8n: true },
      { label: "Webhook triggers", personas: true, n8n: true },
      { label: "Cron / scheduled execution", personas: true, n8n: true },
      { label: "Clipboard & file-watcher triggers", personas: true, n8n: false },
      { label: "Chain events between agents", personas: true, n8n: "Limited" },
      { label: "Visual pipeline canvas", personas: true, n8n: true },
    ],
  },
  {
    name: "Security & Credentials",
    features: [
      { label: "AES-256 encrypted credential vault", personas: true, n8n: true },
      { label: "OS-native keyring integration", personas: true, n8n: false, highlight: true },
      { label: "AI-assisted OAuth browser flow", personas: true, n8n: false },
      { label: "Auto health checks & token refresh", personas: true, n8n: false },
    ],
  },
  {
    name: "Observability",
    features: [
      { label: "Real-time event bus visualization", personas: true, n8n: false, highlight: true },
      { label: "OpenTelemetry-style tracing", personas: true, n8n: "Basic" },
      { label: "Per-execution cost attribution", personas: true, n8n: false },
      { label: "Budget enforcement & alerts", personas: true, n8n: false },
    ],
  },
  {
    name: "Developer Experience",
    features: [
      { label: "Desktop-native app (macOS, Windows, Linux)", personas: true, n8n: "Web only", highlight: true },
      { label: "Built-in codebase scanner", personas: true, n8n: false },
      { label: "Context generator for AI agents", personas: true, n8n: false },
      { label: "Database query debugger", personas: true, n8n: false },
      { label: "Zero telemetry / fully private", personas: true, n8n: "Self-hosted only" },
    ],
  },
];

/* ── Legacy exports kept for JSON-LD / SEO compatibility ─────────── */

export type PricingAccent = "cyan" | "purple" | "amber";

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  accent: PricingAccent;
  cta: string;
  bestFor: string;
  capacity: number;
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
  href?: string;
  ctaStyle: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Local",
    price: "$0",
    period: "forever",
    accent: "cyan",
    cta: "Download Free",
    href: "#download",
    bestFor: "Solo builders getting started",
    capacity: 10,
    ctaStyle:
      "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Unlimited local agents",
      "Local event bus & scheduler",
      "Full observability dashboard",
      "Design engine",
      "Team canvas (local)",
    ],
  },
];

export interface ComparisonFeature {
  label: string;
  free: boolean;
  pro: boolean;
  enterprise: boolean;
}

export const COMPARISON_FEATURES: ComparisonFeature[] = [];

export interface TierColumn {
  key: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  period: string;
  accent: string;
}

export const TIER_COLUMNS: TierColumn[] = [];
