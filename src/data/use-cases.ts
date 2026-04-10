/* ── Use case pages data ────────────────────────────────────────────── */

export interface WorkflowExample {
  title: string;
  description: string;
  trigger: string;
  connectors: string[];
  agentCount: number;
}

export interface UseCase {
  slug: string;
  title: string;
  headline: string;
  description: string;
  color: string;
  icon: string;
  benefits: string[];
  workflows: WorkflowExample[];
  triggers: string[];
  connectors: string[];
}

export const USE_CASES: UseCase[] = [
  {
    slug: "development",
    title: "Development Automation",
    headline: "Ship faster with AI-powered dev workflows",
    description:
      "Automate PR reviews, code documentation, dependency updates, and release notes. Your agents read your codebase, understand your patterns, and handle the repetitive work.",
    color: "#06b6d4",
    icon: "Code",
    benefits: [
      "Auto-generate PR summaries with risk assessment",
      "Keep documentation in sync with code changes",
      "Monitor dependencies for security vulnerabilities",
      "Generate release notes from commit history",
      "Automate code review comments for common patterns",
    ],
    workflows: [
      {
        title: "PR Review Summarizer",
        description: "Reads diffs, analyzes intent, posts structured review comments with risk ratings.",
        trigger: "Webhook (GitHub)",
        connectors: ["GitHub", "Slack"],
        agentCount: 1,
      },
      {
        title: "Dependency Auditor",
        description: "Scans package files daily, checks for CVEs, creates upgrade PRs automatically.",
        trigger: "Cron (daily)",
        connectors: ["GitHub", "npm registry"],
        agentCount: 1,
      },
      {
        title: "Release Notes Generator",
        description: "Collects merged PRs, categorizes changes, generates formatted release notes.",
        trigger: "Manual / Chain",
        connectors: ["GitHub", "Slack", "Notion"],
        agentCount: 2,
      },
    ],
    triggers: ["Webhook", "Cron", "Chain"],
    connectors: ["GitHub", "GitLab", "Slack", "Jira", "Linear"],
  },
  {
    slug: "content",
    title: "Content Pipelines",
    headline: "Scale content production without scaling headcount",
    description:
      "Build multi-stage content workflows: research, draft, review, format, distribute. Each stage is a specialized agent. Chain them into pipelines that run on schedule.",
    color: "#a855f7",
    icon: "FileText",
    benefits: [
      "Multi-stage content creation with quality gates",
      "Research agents that summarize sources before writing",
      "Automated formatting for different platforms",
      "Scheduled distribution to social media and newsletters",
      "Version-controlled prompts for consistent brand voice",
    ],
    workflows: [
      {
        title: "Blog Post Pipeline",
        description: "Research agent gathers sources, writer agent drafts, editor agent refines, formatter outputs HTML and social snippets.",
        trigger: "Cron (weekly)",
        connectors: ["Google Sheets", "Notion", "SendGrid"],
        agentCount: 4,
      },
      {
        title: "Social Media Scheduler",
        description: "Monitors RSS feeds and company updates, generates platform-specific posts, schedules distribution.",
        trigger: "Cron (daily)",
        connectors: ["Slack", "Airtable"],
        agentCount: 2,
      },
      {
        title: "Newsletter Curator",
        description: "Scans industry sources, ranks articles by relevance, compiles weekly digest with summaries.",
        trigger: "Cron (weekly)",
        connectors: ["SendGrid", "Google Sheets"],
        agentCount: 2,
      },
    ],
    triggers: ["Cron", "Chain", "Manual"],
    connectors: ["Google Sheets", "Notion", "Airtable", "SendGrid", "Slack"],
  },
  {
    slug: "research",
    title: "Research & Analysis",
    headline: "Turn information overload into actionable insights",
    description:
      "Deploy agents that continuously monitor sources, extract structured data, identify trends, and deliver summaries. From competitive intelligence to market research.",
    color: "#34d399",
    icon: "Search",
    benefits: [
      "Continuous monitoring of competitors and markets",
      "Structured data extraction from unstructured sources",
      "Trend identification across multiple signals",
      "Automated report generation with citations",
      "Knowledge base that grows with every run",
    ],
    workflows: [
      {
        title: "Competitive Intelligence",
        description: "Monitors competitor websites, changelogs, and social for product updates. Compiles weekly competitive brief.",
        trigger: "Cron (daily)",
        connectors: ["Slack", "Google Sheets", "Notion"],
        agentCount: 3,
      },
      {
        title: "Patent Monitor",
        description: "Searches patent databases for new filings in your technology area. Alerts on relevant applications.",
        trigger: "Cron (weekly)",
        connectors: ["Slack", "Google Sheets"],
        agentCount: 1,
      },
      {
        title: "Academic Paper Digest",
        description: "Scans arXiv and conference proceedings, filters by relevance, generates structured summaries.",
        trigger: "Cron (weekly)",
        connectors: ["Notion", "Slack"],
        agentCount: 2,
      },
    ],
    triggers: ["Cron", "Clipboard", "Manual"],
    connectors: ["Google Sheets", "Notion", "Slack", "PostgreSQL", "MongoDB"],
  },
  {
    slug: "devops",
    title: "DevOps Integration",
    headline: "Intelligent automation for your infrastructure",
    description:
      "Connect your CI/CD pipelines, monitoring, and incident management. Agents watch your deployments, detect anomalies, triage incidents, and execute runbooks — all from your desktop.",
    color: "#f43f5e",
    icon: "Server",
    benefits: [
      "Post-deployment monitoring with anomaly detection",
      "Automated incident triage with context gathering",
      "Runbook execution triggered by alerts",
      "Cost optimization recommendations from usage data",
      "Infrastructure drift detection and alerting",
    ],
    workflows: [
      {
        title: "Deployment Monitor",
        description: "After deploy, watches error rates, latency, and logs for 30 minutes. Alerts on anomalies with rollback suggestion.",
        trigger: "Webhook (CI/CD)",
        connectors: ["GitHub", "Slack", "Sentry"],
        agentCount: 1,
      },
      {
        title: "Incident Triage",
        description: "On alert, correlates with recent deploys, identifies owner, gathers context, posts triage summary.",
        trigger: "Webhook (PagerDuty)",
        connectors: ["Slack", "GitHub", "PagerDuty"],
        agentCount: 2,
      },
      {
        title: "Cost Anomaly Detector",
        description: "Daily scan of cloud billing data. Flags spend anomalies and identifies unused resources.",
        trigger: "Cron (daily)",
        connectors: ["AWS", "Slack", "Google Sheets"],
        agentCount: 1,
      },
    ],
    triggers: ["Webhook", "Cron", "Event listener"],
    connectors: ["GitHub", "GitLab", "AWS", "Slack", "Sentry", "PagerDuty"],
  },
  {
    slug: "communication",
    title: "Customer Communication",
    headline: "Respond faster, route smarter, follow up automatically",
    description:
      "Build agents that triage support messages, draft responses, route urgent issues, and follow up on open items. Connect email, Slack, Discord, and Telegram into unified workflows.",
    color: "#fbbf24",
    icon: "MessageSquare",
    benefits: [
      "Automatic message classification by urgency and topic",
      "Draft responses using your knowledge base",
      "Smart routing to the right team or person",
      "Follow-up reminders for open conversations",
      "Multi-channel inbox unification",
    ],
    workflows: [
      {
        title: "Support Triage Bot",
        description: "Monitors support channel, classifies messages, routes urgent items, drafts initial responses.",
        trigger: "Cron (5 min) / Webhook",
        connectors: ["Slack", "Discord", "Google Sheets"],
        agentCount: 1,
      },
      {
        title: "Email Follow-Up Agent",
        description: "Tracks open email threads, reminds on stale conversations, drafts follow-up messages.",
        trigger: "Cron (daily)",
        connectors: ["Gmail", "Google Sheets"],
        agentCount: 1,
      },
      {
        title: "Feedback Collector",
        description: "Aggregates feedback from multiple channels, extracts feature requests, updates product backlog.",
        trigger: "Cron (weekly)",
        connectors: ["Slack", "Discord", "Notion", "Linear"],
        agentCount: 2,
      },
    ],
    triggers: ["Cron", "Webhook", "Clipboard"],
    connectors: ["Slack", "Discord", "Gmail", "Telegram", "Twilio", "SendGrid"],
  },
];
