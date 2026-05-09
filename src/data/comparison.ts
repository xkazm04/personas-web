/* ── Multi-competitor comparison data ────────────────────────────────── */

export type CompetitorId = "personas" | "crewai" | "langchain" | "n8n" | "autogen";

export interface Competitor {
  id: CompetitorId;
  name: string;
  tagline: string;
  color: string;
  pricing: string;
  url: string;
  type: string;
}

export interface ComparisonRow {
  label: string;
  values: Record<CompetitorId, string | boolean>;
  highlight?: boolean;
}

export interface ComparisonCategory {
  name: string;
  features: ComparisonRow[];
}

/* Accent colors per category — drives theme-based section headers */
export const CATEGORY_ACCENTS: Record<string, string> = {
  "Architecture": "#a855f7",
  "Pricing & Licensing": "#06b6d4",
  "Agent Creation": "#a855f7",
  "Execution Engine": "#34d399",
  "Triggers & Scheduling": "#fbbf24",
  "Security & Credentials": "#f43f5e",
  "Observability": "#60a5fa",
  "Deployment": "#ec4899",
  "Developer Experience": "#14b8a6",
};

export const COMPETITORS: Competitor[] = [
  {
    id: "personas",
    name: "Personas",
    tagline: "Desktop-first AI agent orchestration",
    color: "#06b6d4",
    pricing: "Free forever",
    url: "/",
    type: "Desktop App",
  },
  {
    id: "crewai",
    name: "CrewAI",
    tagline: "AI agent teams for enterprise",
    color: "#f97316",
    pricing: "Free tier / Enterprise",
    url: "https://crewai.com",
    type: "Cloud Platform",
  },
  {
    id: "langchain",
    name: "LangChain",
    tagline: "LLM application framework",
    color: "#2dd4bf",
    pricing: "Open-source / LangSmith paid",
    url: "https://langchain.com",
    type: "Framework",
  },
  {
    id: "n8n",
    name: "n8n",
    tagline: "Workflow automation platform",
    color: "#ea4b83",
    pricing: "Self-hosted free / Cloud from \u20AC20/mo",
    url: "https://n8n.io",
    type: "Workflow Tool",
  },
  {
    id: "autogen",
    name: "AutoGen",
    tagline: "Microsoft multi-agent framework",
    color: "#3b82f6",
    pricing: "Open-source",
    url: "https://github.com/microsoft/autogen",
    type: "Framework",
  },
];

export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    name: "Architecture",
    features: [
      {
        label: "Persona = identity + composable capabilities",
        values: {
          personas: true,
          crewai: "Agent swarms",
          langchain: "Framework primitives",
          n8n: "Linear workflows",
          autogen: "Agent conversations",
        },
        highlight: true,
      },
      {
        label: "Stable identity across every job",
        values: {
          personas: true,
          crewai: "Fragmented per agent",
          langchain: "You assemble it",
          n8n: "No identity",
          autogen: "Fragmented per agent",
        },
        highlight: true,
      },
      {
        label: "Toggle a capability without rebuilding",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Capabilities share memory, tools, and voice",
        values: {
          personas: true,
          crewai: "Memory is per-agent",
          langchain: "You wire it yourself",
          n8n: "No agent memory",
          autogen: "Memory is per-agent",
        },
        highlight: true,
      },
      {
        label: "New job = new capability, not a new agent",
        values: {
          personas: true,
          crewai: "Spawn a new agent",
          langchain: "Write a new chain",
          n8n: "Build a new workflow",
          autogen: "Spawn a new agent",
        },
        highlight: true,
      },
      {
        label: "Per-capability triggers, delivery, model",
        values: { personas: true, crewai: false, langchain: false, n8n: "Per-workflow only", autogen: false },
        highlight: true,
      },
    ],
  },
  {
    name: "Pricing & Licensing",
    features: [
      {
        label: "Core platform cost",
        values: { personas: "Free forever", crewai: "Free tier / paid plans", langchain: "Open-source", n8n: "Free (self-hosted) / \u20AC20+/mo cloud", autogen: "Open-source" },
        highlight: true,
      },
      {
        label: "Orchestration markup",
        values: { personas: "None \u2014 zero markup", crewai: "Per-execution pricing", langchain: "None (framework)", n8n: "Per-workflow pricing", autogen: "None (framework)" },
        highlight: true,
      },
      {
        label: "Self-hosted option",
        values: { personas: true, crewai: false, langchain: true, n8n: true, autogen: true },
      },
      {
        label: "No vendor lock-in",
        values: { personas: true, crewai: false, langchain: true, n8n: "Partial", autogen: true },
      },
    ],
  },
  {
    name: "Agent Creation",
    features: [
      {
        label: "Natural language agent creation",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Visual agent builder",
        values: { personas: true, crewai: false, langchain: false, n8n: true, autogen: "AutoGen Studio" },
      },
      {
        label: "Version-controlled prompts with diffs",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Prompt performance benchmarking",
        values: { personas: true, crewai: false, langchain: "Via LangSmith", n8n: false, autogen: false },
      },
      {
        label: "No-code configuration",
        values: { personas: true, crewai: "YAML + Python", langchain: "Python / JS", n8n: true, autogen: "Python" },
      },
      {
        label: "Template library",
        values: { personas: "40+ templates", crewai: "Limited", langchain: "Hub templates", n8n: "1000+ workflows", autogen: "Examples" },
      },
    ],
  },
  {
    name: "Execution Engine",
    features: [
      {
        label: "Multi-provider AI (Claude, Ollama)",
        values: { personas: true, crewai: true, langchain: true, n8n: "Via plugins", autogen: true },
      },
      {
        label: "Automatic model failover",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Self-healing execution",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Multi-agent pipelines",
        values: { personas: true, crewai: true, langchain: "Via LangGraph", n8n: "Limited", autogen: true },
      },
      {
        label: "Visual pipeline canvas",
        values: { personas: true, crewai: false, langchain: "LangGraph Studio", n8n: true, autogen: "AutoGen Studio" },
      },
      {
        label: "Budget enforcement & cost limits",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
    ],
  },
  {
    name: "Triggers & Scheduling",
    features: [
      {
        label: "Cron / scheduled execution",
        values: { personas: true, crewai: false, langchain: false, n8n: true, autogen: false },
      },
      {
        label: "Webhook triggers",
        values: { personas: true, crewai: false, langchain: false, n8n: true, autogen: false },
      },
      {
        label: "Clipboard monitor trigger",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "File watcher trigger",
        values: { personas: true, crewai: false, langchain: false, n8n: true, autogen: false },
        highlight: true,
      },
      {
        label: "Chain events between agents",
        values: { personas: true, crewai: "Sequential only", langchain: "Via LangGraph", n8n: "Limited", autogen: "Conversation-based" },
      },
      {
        label: "Custom event bus",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
    ],
  },
  {
    name: "Security & Credentials",
    features: [
      {
        label: "Data stays on your machine",
        values: { personas: true, crewai: false, langchain: true, n8n: "Self-hosted only", autogen: true },
        highlight: true,
      },
      {
        label: "AES-256 encrypted credential vault",
        values: { personas: true, crewai: "Cloud-managed", langchain: false, n8n: true, autogen: false },
        highlight: true,
      },
      {
        label: "OS-native keyring integration",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "AI-assisted OAuth browser flow",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
      },
      {
        label: "Zero telemetry / fully private",
        values: { personas: true, crewai: false, langchain: "Opt-out", n8n: "Self-hosted only", autogen: true },
      },
      {
        label: "40+ built-in connectors",
        values: { personas: true, crewai: "Tools ecosystem", langchain: "700+ integrations", n8n: "400+ nodes", autogen: "Limited" },
      },
    ],
  },
  {
    name: "Observability",
    features: [
      {
        label: "Real-time event bus visualization",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "OpenTelemetry-style tracing",
        values: { personas: true, crewai: "Basic", langchain: "LangSmith", n8n: "Basic", autogen: false },
      },
      {
        label: "Per-execution cost attribution",
        values: { personas: true, crewai: false, langchain: "LangSmith", n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Budget alerts & enforcement",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
      },
      {
        label: "Execution history & replay",
        values: { personas: true, crewai: true, langchain: "LangSmith", n8n: true, autogen: false },
      },
    ],
  },
  {
    name: "Deployment",
    features: [
      {
        label: "Desktop-native app",
        values: { personas: "Windows (Mac + Linux soon)", crewai: false, langchain: false, n8n: false, autogen: "AutoGen Studio (web)" },
        highlight: true,
      },
      {
        label: "Works offline",
        values: { personas: true, crewai: false, langchain: true, n8n: "Self-hosted", autogen: true },
        highlight: true,
      },
      {
        label: "Cloud deployment option",
        values: { personas: "Coming soon", crewai: true, langchain: "LangServe", n8n: true, autogen: false },
      },
      {
        label: "GitHub Actions integration",
        values: { personas: true, crewai: false, langchain: false, n8n: true, autogen: false },
      },
      {
        label: "GitLab CI/CD integration",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
      },
    ],
  },
  {
    name: "Developer Experience",
    features: [
      {
        label: "Built-in codebase scanner",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Context generator for AI agents",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
      },
      {
        label: "Database query debugger",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
      },
      {
        label: "Design review & quality gates",
        values: { personas: true, crewai: false, langchain: false, n8n: false, autogen: false },
        highlight: true,
      },
      {
        label: "Agent memory system",
        values: { personas: true, crewai: true, langchain: "Via integration", n8n: false, autogen: "Teachability" },
      },
      {
        label: "Testing lab with mock tools",
        values: { personas: true, crewai: false, langchain: "LangSmith", n8n: false, autogen: false },
      },
    ],
  },
];

/* ── Verdict highlights for the summary section ────────────────────── */

export interface VerdictPoint {
  title: string;
  description: string;
  color: string;
}

export const VERDICT_POINTS: VerdictPoint[] = [
  {
    title: "Your data never leaves your machine",
    description:
      "Unlike cloud platforms, Personas runs entirely on your desktop. AES-256 encryption, OS-native keyring, zero telemetry. Privacy by architecture, not by policy.",
    color: "#34d399",
  },
  {
    title: "Free forever \u2014 no orchestration markup",
    description:
      "You pay only for your own AI provider usage. No per-seat pricing, no per-execution fees, no workflow limits. The orchestration layer is completely free.",
    color: "#06b6d4",
  },
  {
    title: "Self-healing execution engine",
    description:
      "Automatic failure detection, model failover, and recovery. No other platform offers built-in self-healing with circuit-breaker patterns for agent pipelines.",
    color: "#a855f7",
  },
  {
    title: "No code required",
    description:
      "Create agents in natural language, configure triggers visually, build pipelines on a canvas. From first download to running agents in minutes, not days.",
    color: "#fbbf24",
  },
];
