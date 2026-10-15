import {
  MOCK_AUDIT_INCIDENTS,
  MOCK_HEALTH_CHECKS,
  MOCK_HEALTH_ISSUES,
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
  type AuditIncident,
  type HealthActionKind,
  type HealthCheckSection,
  type MockHealthIssue,
  type SLABreach,
  type SLATarget,
} from "./mock-dashboard-data";
import { buildIncidentThreads } from "./incidentThreads";

/**
 * Fix the cause once, and every fragment of its incident thread settles.
 *
 * `incidentThreads.ts` joins the fragments of one outage by a declared
 * `causeKey`. This module is the other half: given the causes the visitor has
 * fixed this session, it projects the fixtures so that EVERY member of each
 * fixed thread reads settled - the health check `ok`, the health issue
 * `resolved`, the SLA breach closed at the fix time with its duration frozen,
 * the SLA target out of active breach, the audit incident resolved. A fix is
 * keyed by thread, not by check, so no screen can disagree with another.
 *
 * History stays: a settled breach keeps its row and the minutes it ran, a
 * target keeps the budget it consumed (`timeInSLA`, `current`), an issue keeps
 * its detection time and circuit-breaker flag. Only the open state closes.
 *
 * Pure. Members already settled, and every row outside a fixed thread, come
 * back by reference; with no fix, the fixtures themselves come back.
 */

export interface ResolvedCause {
  /** ISO time of the fix: a settled breach's `resolvedAt`. */
  at: string;
  /** The Health action that fixed it (Configure / Install). */
  kind: HealthActionKind;
}

/** The session's fixed causes, keyed by `causeKey`. */
export type ResolvedCauses = Readonly<Record<string, ResolvedCause>>;

export const NO_RESOLVED_CAUSES: ResolvedCauses = Object.freeze({});

/** Every fixture a thread member can live in. */
export interface ThreadFixtures {
  healthChecks: HealthCheckSection[];
  healthIssues: MockHealthIssue[];
  slaBreaches: SLABreach[];
  slaTargets: SLATarget[];
  auditIncidents: AuditIncident[];
}

/** Maps the rows of one array, keeping the array itself when no row changed. */
function mapKept<T>(rows: T[], settle: (row: T) => T): T[] {
  let changed = false;
  const next = rows.map((row) => {
    const out = settle(row);
    if (out !== row) changed = true;
    return out;
  });
  return changed ? next : rows;
}

const minutesBetween = (fromIso: string, toIso: string) =>
  Math.max(0, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60_000));

export function settleThread(fixtures: ThreadFixtures, resolved: ResolvedCauses): ThreadFixtures {
  if (Object.keys(resolved).length === 0) return fixtures;

  // Thread membership, including the SLA targets joined by persona + metric.
  const threads = buildIncidentThreads({
    healthChecks: fixtures.healthChecks.flatMap((section) => section.items),
    healthIssues: fixtures.healthIssues,
    slaBreaches: fixtures.slaBreaches,
    slaTargets: fixtures.slaTargets,
  });
  const settledAt = new Map<string, string>();
  for (const thread of threads) {
    const cause = resolved[thread.key];
    if (cause) for (const member of thread.members) settledAt.set(member.id, cause.at);
  }
  // Audit incidents declare their cause too; they have no route of their own
  // in the thread links, so they join here rather than in buildIncidentThreads.
  for (const incident of fixtures.auditIncidents) {
    const cause = incident.causeKey ? resolved[incident.causeKey] : undefined;
    if (cause) settledAt.set(incident.id, cause.at);
  }
  if (settledAt.size === 0) return fixtures;

  const healthChecks = mapKept(fixtures.healthChecks, (section) => {
    const items = mapKept(section.items, (item) =>
      settledAt.has(item.id) && (item.status !== "ok" || item.action)
        ? { ...item, status: "ok" as const, action: undefined }
        : item,
    );
    return items === section.items ? section : { ...section, items };
  });

  const healthIssues = mapKept(fixtures.healthIssues, (issue) =>
    settledAt.has(issue.id) && issue.status === "open" ? { ...issue, status: "resolved" as const } : issue,
  );

  const slaBreaches = mapKept(fixtures.slaBreaches, (breach) => {
    const at = settledAt.get(breach.id);
    if (at === undefined || breach.resolvedAt !== null) return breach;
    return { ...breach, resolvedAt: at, durationMinutes: minutesBetween(breach.startedAt, at) };
  });

  const slaTargets = mapKept(fixtures.slaTargets, (target) =>
    settledAt.has(target.id) && target.activeBreach ? { ...target, activeBreach: false } : target,
  );

  const auditIncidents = mapKept(fixtures.auditIncidents, (incident) => {
    const at = settledAt.get(incident.id);
    if (at === undefined || (incident.status !== "open" && incident.status !== "escalated")) return incident;
    return { ...incident, status: "resolved" as const, resolvedAt: at };
  });

  const next = { healthChecks, healthIssues, slaBreaches, slaTargets, auditIncidents };
  const unchanged = (Object.keys(next) as (keyof ThreadFixtures)[]).every((key) => next[key] === fixtures[key]);
  return unchanged ? fixtures : next;
}

/** The demo's fixtures as served before any fix. */
export const DEMO_THREAD_FIXTURES: ThreadFixtures = {
  healthChecks: MOCK_HEALTH_CHECKS,
  healthIssues: MOCK_HEALTH_ISSUES,
  slaBreaches: MOCK_SLA_BREACHES,
  slaTargets: MOCK_SLA_TARGETS,
  auditIncidents: MOCK_AUDIT_INCIDENTS,
};

const projections = new WeakMap<ResolvedCauses, ThreadFixtures>();

/**
 * The demo fixtures as this session sees them. Memoized on the `resolved`
 * reference, so every reader of one store state shares one projection (and
 * React memos see a stable value).
 */
export function projectDemoThreads(resolved: ResolvedCauses): ThreadFixtures {
  let projection = projections.get(resolved);
  if (!projection) {
    projection = settleThread(DEMO_THREAD_FIXTURES, resolved);
    projections.set(resolved, projection);
  }
  return projection;
}

/** Failing health checks: the Health nav badge. */
export function healthAlertCount(sections: HealthCheckSection[]): number {
  return sections.reduce((n, section) => n + section.items.filter((i) => i.status === "error").length, 0);
}

/**
 * Unresolved audit incidents (open + escalated): the Incidents nav badge and
 * the Mission Control queue's alerts, matching the Incidents KPI headline.
 */
export function openIncidentCount(incidents: AuditIncident[]): number {
  return incidents.filter((i) => i.status === "open" || i.status === "escalated").length;
}
