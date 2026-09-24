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
