import { createMockQueueTelemetryAdapter } from "@/lib/event-bus-demo";
import { EXTENDED_TOOLS, TOOL_MAP } from "@/lib/tool-catalogue";

export type QueueVariant = "swarm" | "lanes";

export const queueRouteSeeds = [
  {
    id: "gmail-jira",
    producerId: "gmail",
    producerLabel: TOOL_MAP.get("gmail")!.name,
    consumerId: "jira",
    consumerLabel: TOOL_MAP.get("jira")!.name,
    color: TOOL_MAP.get("gmail")!.color,
    eventType: "Email arrives → Inbox triage agent handles it",
    queueDepth: 34,
    throughputEps: 28,
    latencyMs: 420,
  },
  {
    id: "slack-drive",
    producerId: "slack",
    producerLabel: TOOL_MAP.get("slack")!.name,
    consumerId: "drive",
    consumerLabel: TOOL_MAP.get("drive")!.name,
    color: TOOL_MAP.get("slack")!.color,
    eventType: "Slack message → Digest agent summarizes it",
    queueDepth: 21,
    throughputEps: 36,
    latencyMs: 310,
  },
  {
    id: "github-figma",
    producerId: "github",
    producerLabel: TOOL_MAP.get("github")!.name,
    consumerId: "figma",
    consumerLabel: TOOL_MAP.get("figma")!.name,
    color: TOOL_MAP.get("github")!.color,
    eventType: "Pull request opened → Review agent analyzes it",
    queueDepth: 12,
    throughputEps: 19,
    latencyMs: 260,
  },
  {
    id: "calendar-stripe",
    producerId: "calendar",
    producerLabel: TOOL_MAP.get("calendar")!.name,
    consumerId: "stripe",
    consumerLabel: TOOL_MAP.get("stripe")!.name,
    color: TOOL_MAP.get("calendar")!.color,
    eventType: "Meeting ends → Follow-up agent sends notes",
    queueDepth: 48,
    throughputEps: 14,
    latencyMs: 520,
  },
] as const;

export const defaultTelemetryAdapter = createMockQueueTelemetryAdapter(queueRouteSeeds, 1400);

const SWARM_TOOL_IDS = ["gmail", "slack", "github", "jira", "figma", "discord", "notion", "docker", "python", "redis"];
export const swarmTools = EXTENDED_TOOLS.filter((t) => SWARM_TOOL_IDS.includes(t.id));

export const variantTabs: { id: QueueVariant; label: string; hint: string }[] = [
  { id: "swarm", label: "Live Connections", hint: "Real-time activity" },
  { id: "lanes", label: "Performance View", hint: "Speed + delivery stats" },
];
