export interface Connector {
  name: string;
  label: string;
  color: string;
  category: string;
  summary: string;
  monogram: string;
  authType: string;
}

export interface ConnectorCategory {
  key: string;
  label: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
}

export const categories: ConnectorCategory[] = [
  { key: "messaging", label: "Messaging", accent: "cyan" },
  { key: "development", label: "Development", accent: "purple" },
  { key: "database", label: "Databases", accent: "emerald" },
  { key: "devops", label: "Infrastructure", accent: "amber" },
  { key: "productivity", label: "Productivity", accent: "cyan" },
  { key: "analytics", label: "Analytics", accent: "purple" },
  { key: "monitoring", label: "Monitoring", accent: "amber" },
  { key: "crm", label: "CRM", accent: "emerald" },
  { key: "creativity", label: "Design", accent: "purple" },
  { key: "social", label: "Social", accent: "cyan" },
];

/* Colors adjusted for dark-background visibility where originals are too dark */
export const connectors: Connector[] = [
  // ── Messaging ──────────────────────────────────────────────────────
  { name: "slack", label: "Slack", color: "#E01E5A", category: "messaging", summary: "Workspace messaging for channels, DMs, and workflow notifications.", monogram: "Sl", authType: "Bot Token" },
  { name: "discord", label: "Discord", color: "#5865F2", category: "messaging", summary: "Bot integration for server messaging, moderation, and notifications.", monogram: "Dc", authType: "Bot Token" },
  { name: "telegram", label: "Telegram", color: "#26A5E4", category: "messaging", summary: "Bot for messaging, notifications, and group automation.", monogram: "Tg", authType: "Bot Token" },
  { name: "twilio_sms", label: "Twilio", color: "#F22F46", category: "messaging", summary: "SMS, voice, WhatsApp, and communication APIs.", monogram: "Tw", authType: "API Key" },
  { name: "sendgrid", label: "SendGrid", color: "#1A82E2", category: "messaging", summary: "Transactional and marketing email delivery at scale.", monogram: "SG", authType: "API Key" },
  { name: "resend", label: "Resend", color: "#ffffff", category: "messaging", summary: "Modern email API for developers with React Email support.", monogram: "Re", authType: "API Key" },

  // ── Development ────────────────────────────────────────────────────
  { name: "github", label: "GitHub", color: "#8b5cf6", category: "development", summary: "Repositories, issues, pull requests, and CI/CD automation.", monogram: "GH", authType: "PAT" },
  { name: "jira", label: "Jira", color: "#2684FF", category: "development", summary: "Issue tracking and project management for agile software teams.", monogram: "Ji", authType: "API Token" },
  { name: "linear", label: "Linear", color: "#5E6AD2", category: "development", summary: "Issue tracking for software teams with cycles, projects, and triage.", monogram: "Ln", authType: "PAT" },
  { name: "circleci", label: "CircleCI", color: "#71717a", category: "development", summary: "Continuous integration and delivery pipeline orchestration.", monogram: "CI", authType: "PAT" },
  { name: "confluence", label: "Confluence", color: "#2684FF", category: "development", summary: "Wiki and knowledge base for team documentation and collaboration.", monogram: "Cf", authType: "API Token" },

  // ── Databases ──────────────────────────────────────────────────────
  { name: "postgres", label: "PostgreSQL", color: "#5A9BD5", category: "database", summary: "Open-source relational database with advanced SQL and extensibility.", monogram: "Pg", authType: "Connection String" },
  { name: "mongodb", label: "MongoDB", color: "#47A248", category: "database", summary: "Document database with flexible schemas and aggregation pipelines.", monogram: "Mg", authType: "Connection String" },
  { name: "redis", label: "Redis", color: "#DC382D", category: "database", summary: "In-memory data store for caching, queues, and real-time pub/sub.", monogram: "Rd", authType: "Connection String" },
  { name: "supabase", label: "Supabase", color: "#3ECF8E", category: "database", summary: "Open-source Firebase alternative with Postgres, auth, and realtime.", monogram: "Sb", authType: "API Key" },
  { name: "neon", label: "Neon", color: "#00E699", category: "database", summary: "Serverless Postgres with branching, autoscaling, and bottomless storage.", monogram: "Ne", authType: "Connection String" },
  { name: "planetscale", label: "PlanetScale", color: "#71717a", category: "database", summary: "Serverless MySQL platform with branching and non-blocking schema changes.", monogram: "PS", authType: "API Key" },
  { name: "duckdb", label: "DuckDB", color: "#FFC107", category: "database", summary: "Embedded analytical database for OLAP, Parquet, CSV, and JSON.", monogram: "Dk", authType: "File Path" },
  { name: "convex", label: "Convex", color: "#F97316", category: "database", summary: "Real-time backend-as-a-service with database, functions, and scheduling.", monogram: "Cx", authType: "API Key" },
  { name: "notion", label: "Notion", color: "#9B9A97", category: "database", summary: "Workspace for knowledge bases, wikis, and project management.", monogram: "Nt", authType: "API Key" },
  { name: "upstash", label: "Upstash", color: "#00E9A3", category: "database", summary: "Serverless Redis and Kafka for low-latency data at the edge.", monogram: "Up", authType: "API Key" },

  // ── Infrastructure ─────────────────────────────────────────────────
  { name: "vercel", label: "Vercel", color: "#ffffff", category: "devops", summary: "Frontend deployment platform with serverless functions and edge network.", monogram: "Vc", authType: "PAT" },
  { name: "netlify", label: "Netlify", color: "#00C7B7", category: "devops", summary: "Web deployment platform with serverless functions and form handling.", monogram: "Nf", authType: "PAT" },
  { name: "cloudflare", label: "Cloudflare", color: "#F38020", category: "devops", summary: "CDN, DNS, Workers, and security services.", monogram: "CF", authType: "API Key" },

  // ── Productivity ───────────────────────────────────────────────────
  { name: "clickup", label: "ClickUp", color: "#7B68EE", category: "productivity", summary: "Project management with tasks, docs, goals, and time tracking.", monogram: "CU", authType: "PAT" },
  { name: "monday", label: "Monday.com", color: "#FF3D57", category: "productivity", summary: "Work management platform for projects, workflows, and CRM.", monogram: "Mo", authType: "API Key" },
  { name: "airtable", label: "Airtable", color: "#18BFFF", category: "productivity", summary: "Spreadsheet-database for project tracking and data management.", monogram: "At", authType: "PAT" },
  { name: "calendly", label: "Calendly", color: "#006BFF", category: "productivity", summary: "Scheduling for meetings and appointment automation.", monogram: "Ca", authType: "PAT" },
  { name: "dropbox", label: "Dropbox", color: "#0061FF", category: "productivity", summary: "Cloud storage for file sync, sharing, and collaboration.", monogram: "Dx", authType: "PAT" },

  // ── Analytics ──────────────────────────────────────────────────────
  { name: "posthog", label: "PostHog", color: "#F9BD2B", category: "analytics", summary: "Product analytics, feature flags, session replay, and A/B testing.", monogram: "PH", authType: "API Key" },
  { name: "mixpanel", label: "Mixpanel", color: "#7856FF", category: "analytics", summary: "Product analytics with GDPR-compliant data access.", monogram: "Mx", authType: "API Key" },
  { name: "twilio_segment", label: "Segment", color: "#52BD94", category: "analytics", summary: "Customer data platform for event tracking and routing.", monogram: "Se", authType: "API Key" },

  // ── Monitoring ─────────────────────────────────────────────────────
  { name: "sentry", label: "Sentry", color: "#8B5CF6", category: "monitoring", summary: "Application monitoring for errors, performance, and session replay.", monogram: "Sy", authType: "PAT" },
  { name: "betterstack", label: "Better Stack", color: "#E5484D", category: "monitoring", summary: "Uptime monitoring, incident management, and status pages.", monogram: "BS", authType: "API Key" },

  // ── CRM ────────────────────────────────────────────────────────────
  { name: "hubspot", label: "HubSpot", color: "#FF7A59", category: "crm", summary: "CRM for contacts, deals, marketing automation, and sales pipelines.", monogram: "HS", authType: "PAT" },

  // ── Design ─────────────────────────────────────────────────────────
  { name: "figma", label: "Figma", color: "#F24E1E", category: "creativity", summary: "Collaborative design tool for UI/UX, prototyping, and design systems.", monogram: "Fg", authType: "PAT" },

  // ── Social ─────────────────────────────────────────────────────────
  { name: "buffer", label: "Buffer", color: "#168EEA", category: "social", summary: "Social media management for scheduling and publishing.", monogram: "Bu", authType: "PAT" },
];
