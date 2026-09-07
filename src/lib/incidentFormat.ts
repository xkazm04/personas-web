import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  KeyRound,
  Mail,
  MinusCircle,
  Radio,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";

import type {
  AuditIncident,
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
} from "@/lib/mock-dashboard-data";
import { INCIDENT_SEVERITIES, INCIDENT_SOURCES } from "@/lib/mock-dashboard-data";

export type StatusFilter = IncidentStatus | "all";
export type SeverityFilter = IncidentSeverity | "all";
export type SourceFilter = IncidentSource | "all";
export type GroupByKey = "none" | "agent" | "severity" | "source";

export interface IncidentFilters {
  status: StatusFilter;
  severity: SeverityFilter;
  source: SourceFilter;
  /** "all" or a persona name. */
  persona: string;
}

// Severity → tints + icon. Mirrors the observability health-issue palette
// (red / orange / amber / blue) so the two surfaces read consistently.
export const severityStyle: Record<
  IncidentSeverity,
  { text: string; chip: string; rail: string; icon: React.ElementType }
> = {
  critical: { text: "text-red-400", chip: "border-red-500/20 bg-red-500/10 text-red-300", rail: "bg-red-400", icon: AlertTriangle },
  high: { text: "text-orange-400", chip: "border-orange-500/20 bg-orange-500/10 text-orange-300", rail: "bg-orange-400", icon: ShieldAlert },
  medium: { text: "text-amber-400", chip: "border-amber-500/20 bg-amber-500/10 text-amber-300", rail: "bg-amber-400", icon: CircleDot },
  low: { text: "text-blue-400", chip: "border-blue-500/20 bg-blue-500/10 text-blue-300", rail: "bg-blue-400", icon: CircleDot },
};

// Status → badge tint + icon. Distinct from severity so a row's status reads
// independently of its severity rail.
export const statusStyle: Record<
  IncidentStatus,
  { chip: string; icon: React.ElementType }
> = {
  open: { chip: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300", icon: CircleDot },
  escalated: { chip: "border-amber-500/25 bg-amber-500/10 text-amber-300", icon: TrendingUp },
  resolved: { chip: "border-emerald-500/20 bg-emerald-500/8 text-emerald-300", icon: CheckCircle2 },
  ignored: { chip: "border-glass bg-white/[0.04] text-muted-dark", icon: MinusCircle },
};

export const sourceIcon: Record<IncidentSource, React.ElementType> = {
  executions: Zap,
  events: Radio,
  triggers: CalendarClock,
  vault: KeyRound,
  messages: Mail,
  reviews: ClipboardCheck,
};

const SEVERITY_WEIGHT: Record<IncidentSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Sort worst-and-newest first: severity desc, then detectedAt desc. */
function bySeverityThenRecency(a: AuditIncident, b: AuditIncident): number {
  return (
    SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
    b.detectedAt.localeCompare(a.detectedAt)
  );
}

export function applyIncidentFilters(
  incidents: AuditIncident[],
  filters: IncidentFilters,
): AuditIncident[] {
  return incidents
    .filter((i) => filters.status === "all" || i.status === filters.status)
    .filter((i) => filters.severity === "all" || i.severity === filters.severity)
    .filter((i) => filters.source === "all" || i.source === filters.source)
    .filter((i) => filters.persona === "all" || i.persona === filters.persona)
    .slice()
    .sort(bySeverityThenRecency);
}

export interface IncidentGroup {
  /** Raw group value — resolved to a display label in the UI. */
  key: string;
  items: AuditIncident[];
}

/**
 * Bucket incidents by the chosen dimension, ordered meaningfully (severity
 * worst-first, sources by canonical order, agents by incident count desc).
 * `none` returns a single unnamed group. Each group's items keep the
 * severity-then-recency order.
 */
export function groupIncidents(
  incidents: AuditIncident[],
  groupBy: GroupByKey,
): IncidentGroup[] {
  if (groupBy === "none") {
    return [{ key: "none", items: incidents }];
  }

  const buckets = new Map<string, AuditIncident[]>();
  for (const incident of incidents) {
    const key =
      groupBy === "agent"
        ? incident.persona
        : groupBy === "severity"
          ? incident.severity
          : incident.source;
    const arr = buckets.get(key);
    if (arr) arr.push(incident);
    else buckets.set(key, [incident]);
  }

  let orderedKeys: string[];
  if (groupBy === "severity") {
    orderedKeys = INCIDENT_SEVERITIES.filter((s) => buckets.has(s));
  } else if (groupBy === "source") {
    orderedKeys = INCIDENT_SOURCES.filter((s) => buckets.has(s));
  } else {
    // agent: busiest first, ties broken alphabetically for stability.
    orderedKeys = [...buckets.keys()].sort(
      (a, b) => (buckets.get(b)?.length ?? 0) - (buckets.get(a)?.length ?? 0) || a.localeCompare(b),
    );
  }

  return orderedKeys.map((key) => ({ key, items: buckets.get(key) ?? [] }));
}
