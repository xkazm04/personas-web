import type { LucideIcon } from "lucide-react";
import { GitBranch, ShieldCheck, Cpu, Dna } from "lucide-react";

export interface FeaturePageData {
  slug: string;
  title: string;
  headline: string;
  headlineGradient: string;
  description: string;
  icon: LucideIcon;
  color: string;
  benefits: { title: string; description: string }[];
  useCases: { title: string; scenario: string; outcome: string }[];
  faq: { question: string; answer: string }[];
  ctaText: string;
}

export const FEATURE_PAGES: FeaturePageData[] = [
  /* ── 1. Multi-Agent Orchestration ────────────────────────────────────── */
  {
    slug: "orchestration",
    title: "Multi-Agent Orchestration",
    headline: "Agents that work together",
    headlineGradient: "together",
    description:
      "Build visual pipelines where multiple agents collaborate on complex tasks. One agent's output feeds into the next — no glue code, no manual steps, no limits on what you can orchestrate.",
    icon: GitBranch,
    color: "#06b6d4",
    benefits: [
      {
        title: "Visual Pipeline Builder",
        description:
          "Drag agents onto a canvas, draw connections between them, and watch data flow through your pipeline in real time. No coding required.",
      },
      {
        title: "Automatic Data Flow",
        description:
          "When one agent finishes, its output automatically becomes the next agent's input. Chain as many agents as you need.",
      },
      {
        title: "Real-Time Monitoring",
        description:
          "Watch every agent in your pipeline work. See which step is active, what data is flowing, and where bottlenecks happen.",
      },
      {
        title: "Team Collaboration",
        description:
          "Share pipelines with your team. Multiple people can build and monitor the same workflow.",
      },
    ],
    useCases: [
      {
        title: "DevOps Pipeline",
        scenario: "A pull request is opened on GitHub",
        outcome:
          "PR Reviewer agent analyzes the code, Test Runner verifies it passes, Release Notes agent drafts the changelog, and Slack Notifier tells the team — all automatically.",
      },
      {
        title: "Content Workflow",
        scenario: "You need to publish a blog post",
        outcome:
          "Research agent gathers sources, Writer agent creates a draft, Editor agent polishes it, and Publisher formats it for your platform.",
      },
      {
        title: "Customer Support",
        scenario: "A support ticket arrives",
        outcome:
          "Classifier agent determines urgency, Knowledge agent finds relevant docs, Drafter writes a response, and Router escalates if needed.",
      },
    ],
    faq: [
      {
        question: "How many agents can I connect?",
        answer:
          "There's no limit. You can chain 2 agents or 20 — whatever your workflow needs.",
      },
      {
        question: "Do I need to write code?",
        answer:
          "No. The visual canvas lets you build pipelines by dragging and connecting agents. Everything is point-and-click.",
      },
      {
        question: "Can pipelines run automatically?",
        answer:
          "Yes. Combine pipelines with triggers (schedules, webhooks, file watchers) to run your entire workflow hands-free.",
      },
    ],
    ctaText: "Build your first pipeline",
  },

  /* ── 2. Security Vault ───────────────────────────────────────────────── */
  {
    slug: "security",
    title: "Security Vault",
    headline: "Your secrets stay yours",
    headlineGradient: "yours",
    description:
      "Every password, API key, and access token is encrypted on your device using bank-grade AES-256 encryption. Your credentials are stored in your operating system's own secure vault — nothing is ever sent to the cloud.",
    icon: ShieldCheck,
    color: "#a855f7",
    benefits: [
      {
        title: "Bank-Grade Encryption",
        description:
          "AES-256-GCM — the same encryption standard used by governments and financial institutions — protects every credential on your device.",
      },
      {
        title: "OS-Native Protection",
        description:
          "Your secrets are stored in Windows Credential Manager, macOS Keychain, or Linux Secret Service — the same vault your operating system trusts.",
      },
      {
        title: "Zero Cloud Storage",
        description:
          "No cloud sync, no telemetry, no third-party access. Your credentials exist only on your machine, period.",
      },
      {
        title: "Automatic Health Checks",
        description:
          "Personas monitors your credentials and alerts you when tokens expire or permissions change — before your agents break.",
      },
    ],
    useCases: [
      {
        title: "Team API Management",
        scenario: "Your team uses 15 different services",
        outcome:
          "Each team member stores their own credentials locally. Agents use them without ever exposing secrets in logs, code, or chat.",
      },
      {
        title: "Credential Rotation",
        scenario: "An API token expires",
        outcome:
          "Personas detects the expiry, alerts you, and can automatically refresh OAuth tokens — no manual work needed.",
      },
      {
        title: "Multi-Service Workflows",
        scenario: "An agent needs access to Slack, GitHub, and Jira",
        outcome:
          "Each credential is stored separately, encrypted independently, and injected only when the agent needs it.",
      },
    ],
    faq: [
      {
        question: "Can anyone else see my credentials?",
        answer:
          "No. Your secrets are encrypted on your device and never leave it. Not even Personas can read them — they're decrypted only when an agent needs them.",
      },
      {
        question: "What happens if I lose my computer?",
        answer:
          "Your credentials are protected by your OS login. Without your system password, the encrypted vault is unreadable.",
      },
      {
        question: "Do credentials sync to the cloud?",
        answer:
          "Never. Cloud execution uses separate, purpose-limited tokens — your master credentials stay on your device.",
      },
    ],
    ctaText: "Secure your connections",
  },

  /* ── 3. Multi-Provider AI ────────────────────────────────────────────── */
  {
    slug: "multi-provider",
    title: "Multi-Provider AI",
    headline: "Not locked to one AI",
    headlineGradient: "one AI",
    description:
      "Use Claude, OpenAI, Gemini, or run models locally with Ollama. Switch between providers freely, assign different models to different agents, and if one provider goes down — your agents automatically switch to another.",
    icon: Cpu,
    color: "#34d399",
    benefits: [
      {
        title: "Freedom of Choice",
        description:
          "Every AI provider has strengths. Use Claude for reasoning, GPT for speed, Gemini for multimodal tasks, or Ollama for complete privacy — all in one platform.",
      },
      {
        title: "Automatic Failover",
        description:
          "If a provider goes down, your agents seamlessly switch to a backup. No interruption, no manual intervention, no lost work.",
      },
      {
        title: "Cost Optimization",
        description:
          "Use powerful models for complex tasks and lighter models for simple ones. Track exactly what each agent costs per provider.",
      },
      {
        title: "Local Models",
        description:
          "Run Ollama or any local model for complete privacy. Your data never touches an external server.",
      },
    ],
    useCases: [
      {
        title: "Model-Per-Agent Strategy",
        scenario: "You have agents with different needs",
        outcome:
          "Code review agent uses Claude (best at reasoning), email summarizer uses GPT-4o-mini (fast and cheap), and your private data agent runs on Ollama locally.",
      },
      {
        title: "Provider Outage Recovery",
        scenario: "OpenAI goes down during a critical batch",
        outcome:
          "Your agents automatically switch to Claude, finish the batch, and switch back when OpenAI recovers. Zero manual intervention.",
      },
      {
        title: "Cost Control",
        scenario: "Monthly AI costs are climbing",
        outcome:
          "The cost dashboard shows which agents spend the most. You reassign expensive agents to cheaper models and cut costs by 40%.",
      },
    ],
    faq: [
      {
        question: "Which AI providers are supported?",
        answer:
          "Claude (Anthropic), OpenAI (GPT-4, GPT-4o), Google Gemini, Ollama (any local model), LiteLLM, and custom API endpoints.",
      },
      {
        question: "Can different agents use different models?",
        answer:
          "Yes. Each agent can be assigned its own model. A reasoning agent can use Claude while a simple helper uses a lighter model.",
      },
      {
        question: "How does failover work?",
        answer:
          "Each provider has a health score. When it drops below the threshold, agents automatically switch to the next healthy provider in your priority list.",
      },
    ],
    ctaText: "Choose your AI",
  },

  /* ── 4. Genome Evolution ─────────────────────────────────────────────── */
  {
    slug: "genome",
    title: "Genome Evolution",
    headline: "Your agents get smarter automatically",
    headlineGradient: "smarter",
    description:
      "Instead of manually tweaking prompts for hours, let the Genome system do it for you. It tests variations, keeps what works, and discards the rest — like natural selection for your AI agents.",
    icon: Dna,
    color: "#fbbf24",
    benefits: [
      {
        title: "Automatic Optimization",
        description:
          "The system generates prompt variations, tests them against your criteria, and promotes the best performers — all without you writing a single line.",
      },
      {
        title: "Measurable Improvement",
        description:
          "Every generation comes with fitness scores so you can see exactly how much your agents improved. No guessing, just data.",
      },
      {
        title: "Safe Experimentation",
        description:
          "Variations are tested in a sandbox. Your production agent keeps running unchanged until you approve a better version.",
      },
      {
        title: "Continuous Learning",
        description:
          "Run evolution cycles on a schedule. Your agents get better every week, every month — continuously adapting to your changing needs.",
      },
    ],
    useCases: [
      {
        title: "Prompt Optimization",
        scenario: "Your email triage agent miscategorizes 15% of emails",
        outcome:
          "Genome runs 5 generations of variations, finds a prompt that reduces errors to 3%, and you approve it with one click.",
      },
      {
        title: "A/B Testing at Scale",
        scenario: "You're not sure which instruction style works better",
        outcome:
          "Genome tests 10 variations simultaneously, scores each on accuracy and speed, and shows you a clear winner.",
      },
      {
        title: "Adapting to Change",
        scenario: "Your customers start asking different types of questions",
        outcome:
          "Schedule monthly evolution cycles. Your support agent's prompt automatically evolves to handle the new patterns.",
      },
    ],
    faq: [
      {
        question: "Do I need to understand genetics?",
        answer:
          "Not at all. Just tell the system what 'good' looks like (fast responses, accurate results, etc.) and it handles the rest.",
      },
      {
        question: "How long does evolution take?",
        answer:
          "A typical cycle with 5 generations takes 10-30 minutes depending on your test data size. You can run it in the background.",
      },
      {
        question: "Can I undo a bad evolution?",
        answer:
          "Always. Every generation is versioned. Roll back to any previous version with one click.",
      },
    ],
    ctaText: "Evolve your agents",
  },
];
