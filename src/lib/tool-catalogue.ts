export interface ToolEntry {
  id: string;
  name: string;
  color: string;
}

/**
 * Canonical tool / integration registry.
 * Both FlowComposer and EventBusShowcase derive their tool lists from this.
 */
export const TOOL_CATALOGUE: readonly ToolEntry[] = [
  // Core integrations (used by FlowComposer + EventBusShowcase)
  { id: "gmail", name: "Gmail", color: "#ea4335" },
  { id: "slack", name: "Slack", color: "#4a154b" },
  { id: "github", name: "GitHub", color: "#8b5cf6" },
  { id: "calendar", name: "Calendar", color: "#06b6d4" },
  { id: "stripe", name: "Stripe", color: "#635bff" },
  { id: "jira", name: "Jira", color: "#0052cc" },
  { id: "drive", name: "Drive", color: "#34a853" },
  { id: "figma", name: "Figma", color: "#f24e1e" },
  { id: "webhook", name: "Webhook", color: "#f59e0b" },
  { id: "api", name: "REST API", color: "#3b82f6" },
  { id: "database", name: "Database", color: "#14b8a6" },
  { id: "notify", name: "Notify", color: "#ec4899" },
  { id: "docs", name: "Docs", color: "#6366f1" },
  { id: "s3", name: "S3 Bucket", color: "#f97316" },
  { id: "rss", name: "RSS Feed", color: "#fb923c" },
  { id: "auth", name: "Auth", color: "#10b981" },
  { id: "cli", name: "CLI", color: "#a3a3a3" },
  { id: "agent", name: "AI Agent", color: "#8b5cf6" },
  { id: "plugin", name: "Plugin", color: "#d946ef" },
  { id: "pubsub", name: "Pub/Sub", color: "#0ea5e9" },

  // Extended integrations (used by EventBusShowcase swarm)
  { id: "react", name: "React", color: "#61DAFB" },
  { id: "notion", name: "Notion", color: "#ffffff" },
  { id: "nextjs", name: "Next.js", color: "#ffffff" },
  { id: "discord", name: "Discord", color: "#5865F2" },
  { id: "nodejs", name: "Node.js", color: "#339933" },
  { id: "datadog", name: "Datadog", color: "#632CA6" },
  { id: "typescript", name: "TypeScript", color: "#3178C6" },
  { id: "aws", name: "AWS", color: "#FF9900" },
  { id: "vercel", name: "Vercel", color: "#ffffff" },
  { id: "salesforce", name: "Salesforce", color: "#00A1E0" },
  { id: "python", name: "Python", color: "#3776AB" },
  { id: "docker", name: "Docker", color: "#2496ED" },
  { id: "kubernetes", name: "Kubernetes", color: "#326CE5" },
  { id: "postgresql", name: "PostgreSQL", color: "#4169E1" },
  { id: "redis", name: "Redis", color: "#DC382D" },
  { id: "mongodb", name: "MongoDB", color: "#47A248" },
  { id: "trello", name: "Trello", color: "#0052CC" },
] as const;

/** Lookup a tool by id */
export const TOOL_MAP = new Map(TOOL_CATALOGUE.map((t) => [t.id, t]));

/** The first 20 tools — the core set used by FlowComposer */
export const CORE_TOOLS = TOOL_CATALOGUE.slice(0, 20);

/** All tools including extended integrations — used by EventBusShowcase swarm */
export const EXTENDED_TOOLS = TOOL_CATALOGUE;
