import type { KnowledgePattern } from "@/lib/mock-dashboard-data";

export function relativeKnowledgeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatKnowledgeDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export function formatKnowledgeCost(usd: number): string {
  return `$${usd.toFixed(3)}`;
}

export function knowledgeSuccessRate(pattern: KnowledgePattern): number {
  const total = pattern.successCount + pattern.failureCount;
  return total > 0 ? pattern.successCount / total : 0;
}

export function knowledgeConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return "#10b981";
  if (confidence >= 0.4) return "#f59e0b";
  return "#f43f5e";
}
