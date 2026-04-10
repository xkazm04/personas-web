/* ── Blog post data ─────────────────────────────────────────────────── */

export type BlogCategory = "announcement" | "tutorial" | "use-case" | "engineering";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: string;
  date: string;
  readingTime: number;
  content: string;
  featured?: boolean;
}

export const BLOG_CATEGORIES: { id: BlogCategory; label: string; color: string }[] = [
  { id: "announcement", label: "Announcements", color: "#06b6d4" },
  { id: "tutorial", label: "Tutorials", color: "#a855f7" },
  { id: "use-case", label: "Use Cases", color: "#34d399" },
  { id: "engineering", label: "Engineering", color: "#fbbf24" },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "introducing-personas",
    title: "Introducing Personas — Free Desktop AI Agent Orchestration",
    description:
      "Build, orchestrate, and monitor multi-agent AI pipelines from your desktop. Free forever, fully private, zero telemetry.",
    category: "announcement",
    author: "Personas Team",
    date: "2026-03-15",
    readingTime: 5,
    featured: true,
    content: `Personas is a desktop application for building and orchestrating AI agent pipelines. Unlike cloud platforms that process your data on remote servers, Personas runs entirely on your machine — your prompts, credentials, and outputs never leave your device.

## Why Desktop-First?

The AI agent ecosystem has exploded with cloud platforms: CrewAI, LangChain, Relevance AI, and dozens more. They all share one fundamental limitation — your data flows through their servers. For developers working with proprietary code, sensitive credentials, or regulated data, that's a non-starter.

Personas takes a different approach. The entire orchestration engine runs locally. Your AES-256 encrypted credential vault uses OS-native keyring integration. There's no telemetry, no analytics, no phone-home behavior.

## What You Can Build

- **Multi-agent pipelines** — Chain agents together on a visual canvas. One agent's output feeds the next.
- **Automated triggers** — Cron schedules, webhooks, clipboard monitoring, file watchers, and custom event chains.
- **Self-healing execution** — Automatic failure detection with model failover and circuit-breaker patterns.
- **40+ integrations** — Slack, GitHub, Jira, PostgreSQL, MongoDB, AWS, and more — all authenticated through the encrypted vault.

## Getting Started

Download Personas for Windows, macOS, or Linux. Create your first agent in natural language, assign tools, set a trigger, and watch it run. No signup, no credit card, no cloud account required.`,
  },
  {
    slug: "self-healing-execution-engine",
    title: "How Personas Self-Healing Engine Keeps Your Agents Running",
    description:
      "Deep dive into automatic failure detection, model failover, and circuit-breaker patterns that make agent pipelines resilient.",
    category: "engineering",
    author: "Personas Team",
    date: "2026-03-22",
    readingTime: 8,
    content: `Production AI agent pipelines fail. Models go down, rate limits hit, APIs return errors, and context windows overflow. The question isn't whether your agents will fail — it's how fast they recover.

## The Problem with Brittle Pipelines

Most agent frameworks treat execution as a linear process: prompt goes in, response comes out. When something breaks, the entire pipeline stops. You get an error log and a retry button.

In production, this means waking up to dozens of failed executions, manually restarting pipelines, and hoping the same transient error doesn't happen again.

## How Self-Healing Works

Personas implements a three-layer resilience system:

### Layer 1: Automatic Retry with Backoff

Transient failures (network timeouts, 429 rate limits, 503 service unavailable) trigger automatic retries with exponential backoff. Each provider has independent retry budgets — a failing Claude endpoint doesn't exhaust your GPT retry budget.

### Layer 2: Model Failover

When a provider is consistently failing, Personas automatically routes to the next available model in your provider chain. If Claude is down, your agents seamlessly switch to GPT or Gemini — without changing prompts or losing context.

### Layer 3: Circuit Breaker

Persistent failures trip the circuit breaker, preventing cascade failures. The breaker monitors error rates per provider and opens when the threshold is exceeded. It periodically tests recovery with half-open probes, automatically restoring the provider when it's healthy again.

## Real-World Impact

In our testing, self-healing reduced manual intervention on agent pipelines by 94%. The median recovery time dropped from "whenever someone notices" to under 30 seconds.`,
  },
  {
    slug: "building-slack-triage-bot",
    title: "Build a Slack Triage Bot in 5 Minutes with Personas",
    description:
      "Step-by-step tutorial: create an AI agent that monitors Slack channels, categorizes messages, and routes urgent items to the right team.",
    category: "tutorial",
    author: "Personas Team",
    date: "2026-03-29",
    readingTime: 6,
    content: `One of the most common Personas use cases is automated message triage. In this tutorial, you'll build a Slack bot that monitors channels, categorizes incoming messages by urgency, and routes them to the appropriate team.

## What You'll Build

An agent that:
1. Monitors a Slack channel for new messages
2. Classifies each message as urgent, normal, or informational
3. Routes urgent messages to a #critical channel with a summary
4. Logs everything to a Google Sheet for weekly review

## Prerequisites

- Personas installed on your machine
- A Slack workspace with a bot token (we'll walk through creating one)
- A Google Sheets API key (optional, for logging)

## Step 1: Create the Agent

Open Personas and click "New Agent." Describe what you want in natural language:

*"Monitor the #support channel in Slack. For each new message, classify it as urgent (system down, data loss, security issue), normal (feature request, bug report, question), or informational (status update, announcement). Forward urgent messages to #critical with a one-line summary."*

Personas generates the system prompt, selects the right tools (Slack read, Slack write), and configures the output format.

## Step 2: Connect Slack

Navigate to the Credential Vault. Click "Add Connector" and select Slack. Personas opens a browser window for the OAuth flow — the AI assistant guides you through the permission scopes you need.

Your Slack token is encrypted with AES-256 and stored in your OS keyring. It never leaves your machine.

## Step 3: Set the Trigger

Switch to the Triggers tab. Select "Scheduled" and set a 5-minute cron interval. Your agent will check for new messages every 5 minutes.

Alternatively, use a Webhook trigger if you have Slack Events API configured — this gives you real-time processing.

## Step 4: Test and Deploy

Click "Run Once" to test with the last 10 messages. Review the classifications. If the urgency threshold feels off, adjust the system prompt and run again.

Once you're satisfied, toggle the schedule to Active. Your triage bot is now running locally, 24/7, with zero cloud costs.`,
  },
  {
    slug: "credential-vault-security",
    title: "Credential Vault: How Personas Secures Your API Keys",
    description:
      "AES-256 encryption, OS-native keyring, AI-assisted OAuth — how Personas protects your integrations without touching the cloud.",
    category: "engineering",
    author: "Personas Team",
    date: "2026-04-05",
    readingTime: 7,
    content: `Every AI agent platform needs access to external services — Slack, GitHub, databases, cloud APIs. That means storing credentials. The question is: where and how?

## The Cloud Credential Problem

Cloud agent platforms store your credentials on their servers. They promise encryption-at-rest and access controls, but your tokens still transit through their infrastructure. A breach at the platform level exposes every customer's credentials.

Data Processing Agreements help legally, but they don't change the physics: your secrets are on someone else's computer.

## Personas: Local-Only Credential Storage

Personas takes a fundamentally different approach. Your credentials never leave your machine.

### AES-256-GCM Encryption

Every credential is encrypted using AES-256-GCM before being written to disk. The encryption key is derived from your OS-native keyring:

- **Windows**: Windows Credential Manager (DPAPI-protected)
- **macOS**: Keychain Access (Secure Enclave on Apple Silicon)
- **Linux**: libsecret (GNOME Keyring / KDE Wallet)

This means your credentials are protected by the same security infrastructure your OS uses for its own secrets.

### AI-Assisted OAuth

Adding a new integration doesn't mean copy-pasting tokens from a developer portal. Personas opens a browser window and uses an AI assistant to guide you through the OAuth flow. It detects the required scopes, handles the redirect, and stores the token — all without you manually touching a client secret.

### Health Checks and Rotation

The vault periodically validates your credentials with non-destructive health checks (e.g., a lightweight API call). If a token is expired or revoked, you get a notification before your next agent execution fails.

## 40+ Pre-Built Connectors

Personas ships with connectors for Slack, Discord, GitHub, GitLab, Jira, Linear, Notion, Google Sheets, PostgreSQL, MongoDB, AWS, Azure, Stripe, Twilio, SendGrid, and 25+ more. Each connector knows its service's auth pattern — OAuth, API key, basic auth, or custom headers.`,
  },
  {
    slug: "devops-automation-agents",
    title: "3 DevOps Workflows You Can Automate with AI Agents",
    description:
      "Real-world examples: PR review summarizer, deployment monitor, and incident triage — running locally on your machine.",
    category: "use-case",
    author: "Personas Team",
    date: "2026-04-10",
    readingTime: 6,
    content: `AI agents aren't just for chatbots. Some of the highest-value use cases are in DevOps — automating the repetitive, context-heavy tasks that slow down engineering teams.

Here are three workflows we've seen Personas users build in under 30 minutes each.

## 1. PR Review Summarizer

**The problem**: Your team opens 20+ pull requests a week. Reviewing each one takes 15-30 minutes. Half of that time is just understanding what changed and why.

**The agent**: Monitors your GitHub repository for new PRs. For each one, it reads the diff, understands the intent from the PR description and commit messages, and posts a structured summary as a comment:

- **What changed**: 2-3 sentence overview
- **Risk assessment**: Low / Medium / High based on files touched, test coverage, and complexity
- **Review focus**: Which files deserve the most attention

**Trigger**: Webhook from GitHub (or 5-minute poll)
**Connectors**: GitHub (read PRs, post comments)

## 2. Deployment Monitor

**The problem**: After deploying to production, someone has to watch the dashboards for 30 minutes to catch regressions. Nobody wants to do this.

**The agent**: After a deployment event, it monitors your error tracking (Sentry), metrics (Datadog/Grafana), and logs for anomalies. If error rates spike above baseline, it creates a Slack alert with context:

- What errors are new since deployment
- Which endpoints are affected
- A suggested rollback command

**Trigger**: Webhook from CI/CD pipeline
**Connectors**: Sentry, Slack, GitHub (for rollback commands)

## 3. Incident Triage

**The problem**: When an incident hits, the first 10 minutes are spent figuring out what's broken, who owns it, and what the blast radius is.

**The agent**: Monitors your alerting channel. When an alert fires, it correlates the alert with:

- Recent deployments (was something just shipped?)
- Service ownership (who should be paged?)
- Historical incidents (has this happened before?)

It posts a triage summary to your incident channel with recommended actions and pages the right team via PagerDuty.

**Trigger**: Event listener on alerting webhook
**Connectors**: Slack, GitHub, PagerDuty

## The Common Thread

All three workflows share a pattern: high-context, time-sensitive tasks that require pulling data from multiple sources. They're perfect for AI agents because:

1. The inputs are structured (diffs, metrics, alerts)
2. The outputs are templated (summaries, assessments, notifications)
3. The judgment calls are consistent enough for AI but tedious for humans

And because they run on Personas locally, your code, metrics, and incidents never leave your infrastructure.`,
  },
];
