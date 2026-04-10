import type { GuideCategory } from "./types";

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Install Personas, create your first agent, and learn the basics in under 10 minutes.",
    icon: "Rocket",
    color: "#06b6d4",
  },
  {
    id: "agents-prompts",
    name: "Agents & Prompts",
    description: "Create, configure, and fine-tune your AI agents. Master simple and structured prompt modes.",
    icon: "Bot",
    color: "#a855f7",
  },
  {
    id: "triggers",
    name: "Triggers & Scheduling",
    description: "Set up when and how your agents run — schedules, webhooks, file watchers, and more.",
    icon: "Zap",
    color: "#fbbf24",
  },
  {
    id: "credentials",
    name: "Credentials & Security",
    description: "Connect to services securely. Understand the encrypted vault and how your data stays safe.",
    icon: "ShieldCheck",
    color: "#f43f5e",
  },
  {
    id: "pipelines",
    name: "Pipelines & Teams",
    description: "Wire agents together into visual pipelines. Build multi-agent workflows on the team canvas.",
    icon: "GitBranch",
    color: "#34d399",
  },
  {
    id: "testing",
    name: "Testing & Optimization",
    description: "Run arena tests, A/B comparisons, and let the genome system evolve your best prompts.",
    icon: "FlaskConical",
    color: "#3b82f6",
  },
  {
    id: "memories",
    name: "Memories & Knowledge",
    description: "Your agents learn and remember. Manage what they know and how they use past experience.",
    icon: "Brain",
    color: "#8b5cf6",
  },
  {
    id: "monitoring",
    name: "Monitoring & Costs",
    description: "Track every execution in real time. See what your agents do, how well they perform, and what they cost.",
    icon: "BarChart3",
    color: "#10b981",
  },
  {
    id: "deployment",
    name: "Deployment & Integrations",
    description: "Deploy agents to the cloud, connect to GitHub Actions, GitLab CI, and n8n workflows.",
    icon: "Cloud",
    color: "#0ea5e9",
  },
  {
    id: "troubleshooting",
    name: "Troubleshooting",
    description: "Fix common issues, understand error messages, and get your agents back on track.",
    icon: "Wrench",
    color: "#f97316",
  },
];
