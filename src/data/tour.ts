/* ── Product tour step data ─────────────────────────────────────────── */

export interface TourStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  color: string;
  timeEstimate: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "download",
    number: 1,
    title: "Download & Launch",
    subtitle: "30 seconds",
    description:
      "Download Personas for your platform. No account, no signup, no email. Double-click to install, launch, and you're ready.",
    details: [
      "One-click installer for Windows, macOS, and Linux",
      "No registration or email verification required",
      "Under 100MB download, installs in seconds",
      "Auto-detects your system language from 14 supported",
    ],
    color: "#06b6d4",
    timeEstimate: "30 sec",
  },
  {
    id: "create-agent",
    number: 2,
    title: "Create Your First Agent",
    subtitle: "Describe it in plain English",
    description:
      "Click 'New Agent' and describe what you want in natural language. Personas generates the system prompt, selects tools, and configures the output format automatically.",
    details: [
      "Natural language agent creation — no code needed",
      "AI generates the optimal system prompt from your description",
      "Automatic tool selection based on your task",
      "Choose your AI model: Claude, GPT, Gemini, or Copilot",
    ],
    color: "#a855f7",
    timeEstimate: "2 min",
  },
  {
    id: "connect-tools",
    number: 3,
    title: "Connect Your Tools",
    subtitle: "40+ integrations, one vault",
    description:
      "Open the Credential Vault, pick a connector (Slack, GitHub, Jira, PostgreSQL...), and authenticate. AI guides you through OAuth flows. Everything encrypted with AES-256.",
    details: [
      "40+ pre-built connectors for popular services",
      "AI-assisted OAuth — no manual token copy-paste",
      "AES-256-GCM encryption with OS-native keyring",
      "Automatic health checks and token refresh",
    ],
    color: "#34d399",
    timeEstimate: "1 min",
  },
  {
    id: "set-trigger",
    number: 4,
    title: "Set a Trigger",
    subtitle: "When should your agent run?",
    description:
      "Schedule your agent with cron expressions, hook it to a webhook, watch your clipboard, or monitor a folder. Six trigger types cover every automation pattern.",
    details: [
      "Cron schedules with visual next-run preview",
      "Inbound webhooks with signature verification",
      "Clipboard monitor with regex pattern matching",
      "File watcher for filesystem events",
      "Chain triggers for multi-agent pipelines",
      "Manual run for testing anytime",
    ],
    color: "#fbbf24",
    timeEstimate: "1 min",
  },
  {
    id: "watch-execute",
    number: 5,
    title: "Watch It Execute",
    subtitle: "Real-time observability",
    description:
      "Your agent runs locally. Watch the execution in real-time: see the event bus light up, trace each step, and monitor token usage and costs — all in the built-in dashboard.",
    details: [
      "Live event bus visualization with particle lanes",
      "OpenTelemetry-style span tracing for each step",
      "Per-execution cost attribution by model",
      "Self-healing engine auto-recovers from failures",
    ],
    color: "#f43f5e",
    timeEstimate: "Live",
  },
  {
    id: "scale-up",
    number: 6,
    title: "Scale to Pipelines",
    subtitle: "Chain agents together",
    description:
      "Ready for more? Open the Team Canvas and drag agents onto a visual pipeline. Connect outputs to inputs. One agent's result feeds the next. Build complex workflows without code.",
    details: [
      "Visual node-based pipeline editor",
      "Data-flow connections with type validation",
      "Pipeline execution controls with status overlay",
      "Budget limits per pipeline and per agent",
    ],
    color: "#06b6d4",
    timeEstimate: "5 min",
  },
];
