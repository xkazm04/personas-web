import type { useTranslation } from "@/i18n/useTranslation";
import type { ColumnDef } from "./knowledgeDenseTypes";

type KnowledgeLabels = ReturnType<typeof useTranslation>["t"]["knowledgePage"];

export function buildKnowledgeColumns(labels: KnowledgeLabels): ColumnDef[] {
  return [
    { key: "knowledgeType", label: labels.type, width: "w-16", align: "center" },
    { key: "patternKey", label: labels.patternKey, width: "flex-1 min-w-[140px]" },
    { key: "personaName", label: labels.agent, width: "w-28" },
    { key: "successCount", label: labels.success, width: "w-18", mono: true, align: "right" },
    { key: "failureCount", label: labels.fails, width: "w-16", mono: true, align: "right" },
    { key: "successRate", label: labels.rate, width: "w-16", mono: true, align: "right" },
    { key: "avgCostUsd", label: labels.cost, width: "w-18", mono: true, align: "right" },
    { key: "avgDurationMs", label: labels.duration, width: "w-20", mono: true, align: "right" },
    { key: "confidence", label: labels.confidence, width: "w-28" },
    { key: "lastSeen", label: labels.lastSeen, width: "w-20", mono: true, align: "right" },
  ];
}
