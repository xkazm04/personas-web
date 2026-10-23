import { describe, expect, it } from "vitest";

import {
  INCIDENT_SEVERITIES,
  INCIDENT_SOURCES,
  INCIDENT_STATUSES,
  type AuditIncident,
  type IncidentSeverity,
  type IncidentSource,
  type IncidentStatus,
} from "@/lib/mock-dashboard-data";
import { applyIncidentFilters, incidentFacetCounts, type IncidentFilters } from "./incidentFormat";

/**
 * Pins the incident filter bar's counts to search/faceting-and-filters: a
 * facet's pill counts apply every other facet's selection but not its own, so
 * each number equals the row count a click on that pill produces.
 */

let n = 0;
const incident = (status: IncidentStatus, severity: IncidentSeverity, source: IncidentSource, persona: string): AuditIncident => ({
  id: `i-${n++}`,
  title: "t",
  description: "d",
  severity,
  status,
  source,
  persona,
  personaColor: "#000",
  detectedAt: new Date(Date.UTC(2026, 9, 1, 0, n)).toISOString(),
  resolvedAt: null,
  category: "c",
  recommendation: "r",
});

const INCIDENTS: AuditIncident[] = [
  incident("open", "critical", "executions", "Ada"),
  incident("open", "high", "events", "Ada"),
  incident("resolved", "critical", "vault", "Bo"),
  incident("escalated", "low", "executions", "Bo"),
  incident("open", "medium", "messages", "Cy"),
  incident("ignored", "critical", "executions", "Cy"),
  incident("resolved", "high", "reviews", "Ada"),
];

const ALL: IncidentFilters = { status: "all", severity: "all", source: "all", persona: "all" };

const SELECTIONS: IncidentFilters[] = [
  ALL,
  { ...ALL, severity: "critical" },
  { ...ALL, status: "open", source: "executions" },
  { ...ALL, persona: "Ada", severity: "high" },
  { status: "resolved", severity: "critical", source: "vault", persona: "Bo" },
];

describe("incidentFacetCounts", () => {
  it.each(SELECTIONS)("each pill counts the rows its click would show (%o)", (filters) => {
    const counts = incidentFacetCounts(INCIDENTS, filters);
    const facets = [
      ["status", INCIDENT_STATUSES],
      ["severity", INCIDENT_SEVERITIES],
      ["source", INCIDENT_SOURCES],
    ] as const;
    for (const [facet, values] of facets) {
      for (const value of ["all", ...values]) {
        const rows = applyIncidentFilters(INCIDENTS, { ...filters, [facet]: value });
        expect(counts[facet][value] ?? 0, `${facet}=${value}`).toBe(rows.length);
      }
    }
  });

  it("a facet's own selection does not narrow its counts", () => {
    const counts = incidentFacetCounts(INCIDENTS, { ...ALL, severity: "critical" });
    expect(counts.severity.high).toBe(2);
    expect(counts.status.open).toBe(1);
  });
});
