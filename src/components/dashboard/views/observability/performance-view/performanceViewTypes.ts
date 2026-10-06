import type { CostAnomaly, MockHealthIssue } from "@/lib/mock-dashboard-data";
import type { useTranslation } from "@/i18n/useTranslation";

export const BUDGET_THRESHOLD = 0.8;

export type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

export type ObservabilityLabels = ReturnType<typeof useTranslation>["t"]["observabilityPage"];

export type { CostAnomaly, MockHealthIssue };
