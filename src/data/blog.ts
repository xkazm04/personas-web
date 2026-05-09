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
  {
    slug: "email-triage-agent-tutorial",
    title: "Build an Email Triage Agent in 5 Minutes",
    description:
      "Step-by-step tutorial: create an AI agent that reads your inbox, classifies messages by priority, and drafts replies — all running locally.",
    category: "tutorial",
    author: "Personas Team",
    date: "2026-04-11",
    readingTime: 6,
    content: `Your inbox is a firehose. Important messages hide between newsletters, automated alerts, and FYI threads. An AI agent can sort through the noise in seconds — and it never gets tired.

## What You'll Build

An agent that:
1. Reads your latest emails via the Gmail or Outlook connector
2. Classifies each message: urgent, needs-reply, informational, or spam
3. Drafts a reply for urgent messages
4. Summarizes the rest into a daily digest

The whole setup takes about five minutes. Zero code required.

## Step 1: Create the Agent

Open Personas and click \`Create Agent\`. Write your instructions in plain language:

*"Check my inbox for new emails. Classify each as urgent, needs-reply, informational, or spam. For urgent emails, draft a short professional reply. For everything else, create a one-line summary grouped by category."*

Choose Claude as your model — it handles nuanced email classification exceptionally well.

## Step 2: Connect Email

Go to the Credential Vault and add your email connector. Personas walks you through the OAuth flow — you'll authorize read-only access to your inbox. Your credentials are AES-256 encrypted and stored in your OS keyring.

The agent only reads messages — it won't send anything unless you add write permission and explicitly approve the draft.

## Step 3: Set Up the Trigger

Switch to the Triggers tab. For email triage, two trigger types work well:

- **Scheduled (recommended)**: Run every 15 minutes during work hours. Set a cron expression like \`*/15 9-17 * * 1-5\` for weekdays only.
- **Manual**: Click \`Run\` whenever you want a fresh triage. Great while you're still tuning the classification.

## Step 4: Review and Refine

Hit \`Run Once\` to test with your last 20 emails. Review the classifications:

- Are urgent items actually urgent? Adjust the prompt: *"Urgent means: financial deadlines, security issues, or direct requests from my manager."*
- Are drafted replies appropriate? Add style guidance: *"Match my tone — concise, friendly, no exclamation marks."*

Each refinement takes seconds. Run again, compare, and iterate until the output matches your expectations.

## Why This Works Locally

Your emails contain some of the most sensitive content you handle — financial data, legal discussions, personal information. Running this agent locally means your email content never leaves your machine. The AI model processes it, but the data stays on your device.

Compare this to cloud-based email assistants that upload your inbox to third-party servers. With Personas, you get the automation without the privacy tradeoff.`,
  },
  {
    slug: "desktop-first-vs-cloud-agents",
    title: "Desktop-First vs Cloud-First: Choosing Your AI Agent Platform",
    description:
      "An honest comparison of desktop-first (Personas) and cloud-first (CrewAI, LangChain) approaches to AI agent orchestration. When each makes sense.",
    category: "engineering",
    author: "Personas Team",
    date: "2026-04-11",
    readingTime: 8,
    content: `The AI agent landscape splits into two camps: cloud-first platforms that run everything on remote servers, and desktop-first tools that run locally with optional cloud scaling. Neither is universally better — the right choice depends on your constraints.

## The Cloud-First Model

Platforms like CrewAI Cloud, LangChain's LangSmith, and Relevance AI follow the SaaS playbook: sign up, configure agents in a web UI, and execution happens on their infrastructure.

**Strengths:**
- Zero setup — works from any browser
- Built-in scaling — no resource management
- Team collaboration is native
- Always-on execution without keeping a machine running

**Trade-offs:**
- Your data transits their servers
- Monthly subscription costs scale with usage
- Vendor lock-in on proprietary frameworks
- Limited customization of the execution environment

## The Desktop-First Model

Personas and a few newer tools flip this model: the orchestration engine runs on your machine. Cloud execution is optional, added when you need 24/7 availability.

**Strengths:**
- Complete data privacy — nothing leaves your device
- Zero recurring cost for local execution
- Full control over the execution environment
- Works offline and in air-gapped networks
- No vendor lock-in — your agents are files on disk

**Trade-offs:**
- Requires a machine running for scheduled tasks (unless using cloud mode)
- Initial setup is slightly more involved than a web signup
- Team collaboration requires the cloud tier

## When Desktop-First Wins

Choose desktop-first when:
- **You handle sensitive data** — credentials, source code, financial records, customer PII. The risk of a cloud breach outweighs the convenience.
- **You want zero recurring cost** — Personas is free forever for local use. You only pay for your own AI provider API calls.
- **You need environment control** — custom model endpoints, local databases, internal APIs that can't be exposed to a cloud platform.
- **Compliance matters** — GDPR, HIPAA, SOC2 requirements are simpler when data doesn't leave your infrastructure.

## When Cloud-First Wins

Choose cloud-first when:
- **You need always-on agents** without managing infrastructure — cloud platforms handle uptime, scaling, and monitoring.
- **Your team is distributed** and needs real-time collaboration on agent configurations from day one.
- **Data sensitivity is low** — the agents process public data or non-sensitive content.

## The Hybrid Path

Personas offers both. Build and test agents locally — your data stays private, iteration is instant, and there's no cost. When you need 24/7 execution, deploy specific agents to the cloud. Your credentials stay local; only the execution happens remotely.

This hybrid model means you don't have to choose upfront. Start local, add cloud when the use case demands it.`,
  },
  {
    slug: "multi-agent-pipeline-tutorial",
    title: "Building Your First Multi-Agent Pipeline: A Visual Guide",
    description:
      "Step-by-step tutorial for creating a multi-agent pipeline where agents collaborate on complex tasks. Visual canvas, data flow, and real-time execution.",
    category: "tutorial",
    author: "Personas Team",
    date: "2026-04-11",
    readingTime: 7,
    content: `A single agent can handle simple tasks. But real-world workflows are rarely simple. You need one agent to gather data, another to analyze it, and a third to take action on the results. That's where pipelines come in.

## What Is a Multi-Agent Pipeline?

A pipeline is an assembly line of agents. Each agent handles one step and passes its output to the next. Think of it like a relay race — each runner has a specialized skill, and the baton passes seamlessly.

In Personas, you build pipelines on a visual canvas. Drag agents into position, draw connections between them, and watch data flow through the chain in real time.

## What You'll Build

A three-agent research pipeline:
1. **Researcher** — searches the web for information on a topic
2. **Analyzer** — reads the research and extracts key findings
3. **Writer** — turns the findings into a polished summary

The whole pipeline runs with one click.

## Step 1: Create the Agents

You need three agents. Create each one from the home screen:

**Researcher Agent:**
*"Search the web for recent information about [topic]. Return the top 5 most relevant articles with titles, URLs, and a 2-sentence summary of each."*

**Analyzer Agent:**
*"Read the research results. Identify the 3 most important findings, any contradictions between sources, and gaps where more research is needed."*

**Writer Agent:**
*"Take the analysis and write a professional 500-word summary. Include key findings, cite sources, and end with recommendations."*

## Step 2: Open the Pipeline Canvas

Navigate to Pipelines in the sidebar. Click \`New Pipeline\`. The canvas opens — a blank workspace where you'll wire your agents together.

Drag all three agents from the sidebar onto the canvas. Arrange them left to right: Researcher → Analyzer → Writer.

## Step 3: Connect the Data Flow

Click the output port on the Researcher agent and drag a connection to the Analyzer's input port. Then connect the Analyzer's output to the Writer's input.

Each connection represents data flowing between agents. The Researcher's output (article summaries) becomes the Analyzer's input. The Analyzer's output (key findings) becomes the Writer's input.

## Step 4: Run the Pipeline

Click \`Run Pipeline\` and enter your topic: "AI agent orchestration trends 2026."

Watch the canvas light up as each agent processes its step. The Researcher glows first, then the Analyzer, then the Writer. Within a minute or two, you have a polished research summary that would have taken an hour to write manually.

## Step 5: Add Conditional Logic (Optional)

Pipelines can branch. Add a condition after the Analyzer: if the confidence score is below 70%, route back to the Researcher for a deeper search. If it's above 70%, proceed to the Writer.

This turns your linear pipeline into an intelligent workflow that self-corrects based on data quality.

## Why Pipelines Matter

Single agents hit a ceiling quickly. They try to do everything in one prompt, leading to confused outputs and high token costs. Pipelines decompose complex tasks into focused steps where each agent excels at one thing.

The result: better quality, lower cost per task, and workflows that are easier to debug because you can inspect each step independently.`,
  },
  {
    slug: "no-code-ai-agents-for-teams",
    title: "Zero-Code AI Agents for Non-Technical Teams",
    description:
      "How marketing, sales, and operations teams use Personas to automate workflows without writing a single line of code.",
    category: "use-case",
    author: "Personas Team",
    date: "2026-04-11",
    readingTime: 6,
    content: `AI agents aren't just for developers. Some of the most impactful automation happens in teams that have never written code — marketing, sales, customer success, and operations.

Personas is designed for exactly this. You describe what you want in plain English, and the system figures out the rest. No Python, no APIs, no terminal commands.

## Marketing: Content Repurposing Agent

**The problem**: Your team writes one blog post a week. But you need LinkedIn posts, Twitter threads, email newsletters, and Slack announcements — all derived from the same content.

**The agent**: Feed it a blog post URL. It generates:
- 3 LinkedIn posts with different hooks
- A Twitter thread with key takeaways
- A newsletter intro paragraph
- A Slack announcement for the team channel

**How to set it up**: Create an agent with these instructions: *"Read the blog post at the URL I provide. Generate social media content in my brand voice: professional but approachable, data-driven, no jargon."* Add a file watcher trigger on your blog drafts folder — when a new post lands, the agent runs automatically.

## Sales: Lead Research Agent

**The problem**: Before every sales call, your team spends 20 minutes researching the prospect — checking LinkedIn, reading their company blog, reviewing recent news.

**The agent**: Give it a company name and it returns:
- Company overview (size, industry, recent funding)
- Key decision-makers and their backgrounds
- Recent news and press mentions
- Potential pain points based on their industry

**How to set it up**: Create the agent and connect the web search tool. Instructions: *"Research [company name]. Focus on information that helps a sales conversation: their challenges, recent changes, and what they might need from an AI automation platform."*

## Operations: Report Generator Agent

**The problem**: Every Monday, someone spends two hours pulling data from three tools and assembling a weekly status report.

**The agent**: Connects to your project management tool, analytics dashboard, and team chat. Generates a formatted report with:
- Tasks completed vs. planned
- Key metrics and trends
- Blockers and risks
- Highlights worth celebrating

**How to set it up**: Connect your Jira/Linear, Google Sheets, and Slack credentials. Set a Monday 8 AM schedule trigger. The report lands in your inbox before your first meeting.

## Customer Success: Feedback Analyzer Agent

**The problem**: Customer feedback arrives in support tickets, NPS surveys, app store reviews, and social mentions. Nobody has time to read it all.

**The agent**: Monitors all feedback channels and produces a weekly digest:
- Top 5 themes across all channels
- Sentiment trend (improving, stable, declining)
- Specific feature requests with frequency counts
- Urgent issues that need immediate attention

## The Pattern

Notice what all these agents have in common: they take unstructured input from multiple sources, apply judgment, and produce structured output. That's exactly what AI agents do best — and exactly what takes humans the most time.

None of these require code. You describe the task, connect the tools, and set a trigger. The agent handles the rest, running quietly on your machine without sending your data anywhere.`,
  },
  {
    slug: "why-local-first-ai-matters",
    title: "Why Local-First AI Matters: Privacy, Speed, and Control",
    description:
      "The case for running AI agents on your own machine. How local-first architecture gives you privacy without sacrificing capability.",
    category: "engineering",
    author: "Personas Team",
    date: "2026-04-11",
    readingTime: 7,
    content: `Every major AI agent platform runs in the cloud. Your prompts, your data, your credentials — they all flow through someone else's servers. For many use cases, that's fine. But for a growing number of users, it's a dealbreaker.

## The Privacy Problem Is Real

When you use a cloud agent platform, your data makes at least four hops:

1. Your machine → platform's API
2. Platform's API → AI provider (OpenAI, Anthropic, etc.)
3. AI provider → platform's API
4. Platform's API → your machine

At each hop, your data is in transit and potentially stored. The platform's privacy policy covers their servers, but most explicitly retain the right to log inputs and outputs for "service improvement."

This creates a compound risk: your data is exposed to both the platform vendor AND the AI provider. Two attack surfaces instead of one. Two privacy policies to trust instead of one.

## Local-First: One Hop, Not Four

With Personas, the path is simpler:

1. Your machine → AI provider

That's it. Your prompts go directly to the AI model you've chosen. No intermediate platform touches your data. Your credentials are encrypted in your OS keyring. Your agent configurations are files on your local disk.

## Speed: Instant Iteration

Cloud platforms add latency at every step — network round-trips, queue processing, cold starts. When you're iterating on a prompt, waiting 3-5 seconds per test adds up fast.

Local execution eliminates the platform overhead. The only latency is the AI provider's response time. For development and testing, this means 2-3x faster iteration cycles.

## Control: Your Environment, Your Rules

Cloud platforms constrain what you can do. Need a custom model endpoint? Check if it's supported. Want to connect to an internal API? Configure a firewall exception. Need to process files from a local directory? Upload them first.

Local execution removes these constraints. Your agents can:
- Access local files and databases directly
- Connect to internal services on your network
- Use custom model endpoints (Ollama, vLLM, local fine-tunes)
- Process sensitive documents that can't leave your device
- Run in air-gapped environments with no internet

## Cost: Free Forever, By Design

Cloud agent platforms charge for execution. It starts small — a few dollars a month — but scales with usage. Run 50 agents on hourly schedules and you're looking at hundreds per month.

Personas desktop is free. Not freemium, not time-limited — free forever. You bring your own AI provider key and pay them directly for model usage. There's no markup, no per-agent pricing, no execution caps.

Cloud execution is available when you need 24/7 availability, but it's optional. Most users find that local execution covers 90% of their use cases.

## When Cloud Still Makes Sense

Local-first isn't dogma. There are genuine reasons to use cloud execution:

- **Always-on scheduling** — if your machine sleeps, scheduled agents pause. Cloud execution keeps them running.
- **Team collaboration** — shared agent libraries and pipeline editing require a synchronized backend.
- **Scale** — if you need 10+ concurrent agents processing high-volume data streams, cloud workers distribute the load.

The key difference: with Personas, cloud is an opt-in addition. With cloud-first platforms, it's the only option.

## The Future Is Hybrid

We believe the best architecture gives you both options without forcing a choice. Build and iterate locally — fast, private, free. Deploy to cloud when the use case demands it — specific agents, specific schedules, specific data that's already non-sensitive.

Your data, your infrastructure, your choice.`,
  },
];
