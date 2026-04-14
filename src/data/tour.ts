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
    id: "download-launch",
    number: 1,
    title: "Download & Launch",
    subtitle: "30 seconds to your first window",
    description:
      "Grab the Personas installer, run it, and you're in. No account, no email, no cloud signup \u2014 everything runs on your machine from the first click.",
    details: [
      "One-click installer for Windows (Mac and Linux coming soon)",
      "No registration or email verification required",
      "Launches straight into the Command Center",
    ],
    color: "#06b6d4",
    timeEstimate: "30 sec",
  },
  {
    id: "connect-tools",
    number: 2,
    title: "Connect Your Tools",
    subtitle: "Open the vault, pick a connector, authenticate",
    description:
      "Personas ships with 40+ connectors. Open the Credential Vault, pick Slack, GitHub, Jira, Gmail, or any other integration and complete the guided OAuth flow. Credentials are encrypted locally.",
    details: [
      "40+ pre-built connectors out of the box",
      "AES-256-GCM vault backed by your OS keyring",
      "AI-assisted OAuth \u2014 no manual token copy-paste",
    ],
    color: "#a855f7",
    timeEstimate: "1 min",
  },
  {
    id: "create-persona",
    number: 3,
    title: "Create a Persona",
    subtitle: "Describe an agent in natural language",
    description:
      "Click New Persona and describe what you want in plain English. Personas generates the system prompt, picks the right tools, configures triggers, and drops the agent on your canvas.",
    details: [
      "Natural-language agent authoring \u2014 no code required",
      "Start from a template or from scratch",
      "Automatic tool + trigger selection based on intent",
    ],
    color: "#34d399",
    timeEstimate: "2 min",
  },
  {
    id: "let-it-work",
    number: 4,
    title: "Let it work",
    subtitle: "Triggers fire, agents run, events flow",
    description:
      "Your persona listens for triggers \u2014 schedule, webhook, file watcher, event, or manual run \u2014 and executes locally. Watch the event bus light up and monitor every step in real time.",
    details: [
      "Six trigger types cover every automation pattern",
      "Live event bus and span tracing per execution",
      "Self-healing engine recovers from transient failures",
    ],
    color: "#fbbf24",
    timeEstimate: "Live",
  },
  {
    id: "improve",
    number: 5,
    title: "Improve",
    subtitle: "Review runs, tune prompts, evolve",
    description:
      "Open the Lab to replay executions, compare prompt variants side-by-side, and let the evolution engine breed higher-performing versions of your persona overnight.",
    details: [
      "Replay any run with full trace and memory state",
      "A/B test prompt variants in the arena",
      "Evolutionary prompt optimization in the Lab",
    ],
    color: "#f43f5e",
    timeEstimate: "Ongoing",
  },
];
