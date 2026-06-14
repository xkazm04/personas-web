"use client";

import { useMemo } from "react";

import {
  MOCK_HEALTH_DIGEST,
  MOCK_HEALTH_ISSUES,
  MOCK_SLA_BREACHES,
} from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useReviewStore } from "@/stores/reviewStore";

export type TriageKind = "breach" | "incident" | "review";

export interface TriageItem {
  id: string;
  kind: TriageKind;
  /** Raw severity from the source (SLA / health / review vocabularies). */
  severity: string;
  /** Normalized urgency used for ranking + tone selection. */
  weight: number;
  persona?: string;
  personaColor?: string;
  /** Verbatim summary line from the source data (already English demo copy). */
  summary: string;
  startedAt?: string;
  href: string;
}

// Cross-vocabulary severity → urgency weight. Higher sorts first and drives
// the row tone (rose ≥ 90, amber ≥ 50, cyan otherwise).
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 100,
  major: 75,
  high: 70,
  warning: 50,
  medium: 45,
  minor: 25,
  low: 20,
  info: 15,
};

// Personas carry no color on breach/health rows — look it up from the fleet
// health digest (the canonical name → brand-color map for the demo fleet).
const PERSONA_COLOR: Record<string, string> = Object.fromEntries(
  MOCK_HEALTH_DIGEST.agents.map((a) => [a.name, a.color]),
);

const MAX_ITEMS = 6;

/**
 * The Mission-Control Triage Pane's data: a single ranked queue of the most
 * urgent things needing attention, merged across active SLA breaches, open
 * health incidents, and pending manual reviews, sorted by severity then
 * recency. SLA + health rows are illustrative (demo only — no faithful synced
 * source); pending reviews come from the live review store in both modes.
 */
export function useTriageQueue(): TriageItem[] {
  const isDemo = useAuthStore((s) => s.isDemo);
  const reviews = useReviewStore((s) => s.reviews);

  return useMemo(() => {
    const items: TriageItem[] = [];

    if (isDemo) {
      for (const breach of MOCK_SLA_BREACHES) {
        if (breach.resolvedAt !== null) continue; // ongoing breaches only
        items.push({
          id: `tri-${breach.id}`,
          kind: "breach",
          severity: breach.severity,
          weight: SEVERITY_WEIGHT[breach.severity] ?? 0,
          persona: breach.persona,
          personaColor: PERSONA_COLOR[breach.persona],
          summary: breach.summary,
          startedAt: breach.startedAt,
          href: "/dashboard/sla",
        });
      }
      for (const issue of MOCK_HEALTH_ISSUES) {
        if (issue.status !== "open") continue;
        items.push({
          id: `tri-${issue.id}`,
          kind: "incident",
          severity: issue.severity,
          weight: SEVERITY_WEIGHT[issue.severity] ?? 0,
          persona: issue.personaName,
          personaColor: PERSONA_COLOR[issue.personaName],
          summary: issue.title,
          startedAt: issue.detectedAt,
          href: "/dashboard/observability",
        });
      }
    }

    for (const review of reviews) {
      if (review.status !== "pending") continue;
      const firstLine = (review.content ?? "").split("\n")[0]?.trim();
      items.push({
        id: `tri-${review.id}`,
        kind: "review",
        severity: review.severity,
        weight: SEVERITY_WEIGHT[review.severity] ?? 0,
        persona: review.personaName ?? undefined,
        personaColor: review.personaColor ?? undefined,
        summary: firstLine || review.eventType,
        startedAt: review.createdAt,
        href: "/dashboard/reviews",
      });
    }

    return items
      .sort(
        (a, b) =>
          b.weight - a.weight ||
          (b.startedAt ?? "").localeCompare(a.startedAt ?? ""),
      )
      .slice(0, MAX_ITEMS);
  }, [isDemo, reviews]);
}
