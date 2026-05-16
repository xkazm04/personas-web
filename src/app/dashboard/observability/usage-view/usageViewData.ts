export const MOCK_TOOL_USAGE = [
  { toolName: "slack", invocations: 342 },
  { toolName: "github", invocations: 287 },
  { toolName: "postgres", invocations: 198 },
  { toolName: "redis", invocations: 156 },
  { toolName: "notion", invocations: 89 },
  { toolName: "jira", invocations: 67 },
  { toolName: "sentry", invocations: 45 },
];

export const MOCK_TOOL_USAGE_OVER_TIME = (() => {
  const tools = ["slack", "github", "postgres", "redis", "notion"];
  const days: { date: string; tools: Record<string, number> }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const toolsByDay: Record<string, number> = {};
    tools.forEach((tool, index) => {
      toolsByDay[tool] = Math.round(
        12 + Math.sin((i + index) * 0.7) * 8 + Math.random() * 6 + (5 - index) * 3,
      );
    });
    days.push({ date: date.toISOString().slice(0, 10), tools: toolsByDay });
  }
  return days;
})();

export const MOCK_TOOL_USAGE_BY_PERSONA = [
  { personaName: "DevOps Bot", tools: { slack: 120, github: 85, postgres: 40, redis: 90, notion: 15 } },
  { personaName: "Code Reviewer", tools: { slack: 45, github: 180, postgres: 12, jira: 60, notion: 30 } },
  { personaName: "Data Pipeline", tools: { slack: 22, postgres: 140, redis: 55, notion: 8 } },
  { personaName: "Alert Monitor", tools: { slack: 155, sentry: 45, github: 22, redis: 11 } },
];

const toolNameCache = new Map<string, string>();

export function formatToolName(name: string): string {
  const cached = toolNameCache.get(name);
  if (cached) return cached;
  const formatted = name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  toolNameCache.set(name, formatted);
  return formatted;
}
