import type { KnowledgePattern } from "@/lib/mock-dashboard-data";

export type KnowledgeType = KnowledgePattern["knowledgeType"];

export type SortField =
  | "knowledgeType"
  | "patternKey"
  | "personaName"
  | "successCount"
  | "failureCount"
  | "successRate"
  | "avgCostUsd"
  | "avgDurationMs"
  | "confidence"
  | "lastSeen";

export type SortDir = "asc" | "desc";

export interface ColumnDef {
  key: SortField;
  label: string;
  width: string;
  mono?: boolean;
  align?: "left" | "center" | "right";
}
