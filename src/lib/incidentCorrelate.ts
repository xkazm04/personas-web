import {
  MOCK_AUDIT_INCIDENTS,
  MOCK_HEALTH_CHECKS,
  MOCK_HEALTH_ISSUES,
  MOCK_SLA_BREACHES,
  type AuditIncident,
  type HealthCheckItem,
  type HealthCheckSection,
  type MockHealthIssue,
  type SLABreach,
} from "./mock-dashboard-data";

/**
 * Incidents as a computed ledger: signals in, incidents out.
 *
 * `incidentThreads.ts` joins fragments that someone pre-declared with a
 * `causeKey`. This module derives the grouping instead, from what every signal
 * already carries: owning persona, a time, and a category. A shared cause is
 * an output of correlation here, never an input typed into fixtures.
 *
 * Two timed signals merge when ALL of these hold (the over-merge guards):
 * - same persona (persona-less signals never merge with each other),
 * - same category CLASS (see `categoryClass`: `timeout`, `latency` and
 *   `performance` are one class; `successRate` and `resource` are not),
 * - their detection times chain within `windowMs` (single-linkage, so a long
 *   outage that keeps raising signals stays one incident).
 *
 * A "standing" signal has no time (a failing health check is a state, not an
 * event) and no persona. It attaches to an incident of its own category class
 * whose text names the check's service, and never forms an incident alone.
 *
 * Pure: no clock, no I/O. The adapters at the bottom lift today's fixtures
 * into signals; a Supabase plane would lift healing issues, dead letters and
 * review escalations the same way.
 */

export type SignalKind = "slaBreach" | "healthIssue" | "healthCheck" | "auditIncident";
export type SignalSeverity = "critical" | "high" | "medium" | "low";
export type SignalStatus = "open" | "resolved" | "ignored" | "escalated";

export interface Signal {
  id: string;
  kind: SignalKind;
  /** Owning persona; null for infrastructure signals. */
  persona: string | null;
  /** Raw, source-specific category; folded to a class for comparison. */
  category: string;
  /** ISO detection time; null marks a standing signal (no time of its own). */
  detectedAt: string | null;
  resolvedAt: string | null;
  severity: SignalSeverity;
  status: SignalStatus;
  /** Free text searched for a standing signal's service. */
  text?: string;
  /** Standing signals only: the service the check watches (e.g. "Slack"). */
  service?: string;
}

export interface CorrelateOptions {
  windowMs: number;
  /** When false, category is ignored (persona + window only). Default true. */
  sameCategory?: boolean;
}

export interface Incident {
  /** Deterministic: derived from the earliest timed member's id. */
  id: string;
  members: Signal[];
  severity: SignalSeverity;
  status: SignalStatus;
  detectedAt: string;
  resolvedAt: string | null;
  persona: string | null;
}

const CLASS_OF: Record<string, string> = {
  circuit_breaker: "availability",
  availability: "availability",
  delivery: "availability",
  latency: "latency",
  timeout: "latency",
  performance: "latency",
  resource: "resource",
  successRate: "quality",
  reliability: "quality",
};

/** Folds the planes' category vocabularies into one comparable class.
 *  Unknown categories are their own class, so they only merge with themselves. */
export function categoryClass(category: string): string {
  return CLASS_OF[category] ?? category;
}

const SEVERITY_RANK: Record<SignalSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

/** `escalated` outranks `open` outranks `ignored` outranks `resolved`. */
const STATUS_RANK: Record<SignalStatus, number> = { resolved: 0, ignored: 1, open: 2, escalated: 3 };

const ms = (iso: string) => Date.parse(iso);

export function correlate(signals: readonly Signal[], options: CorrelateOptions): Incident[] {
  const sameCategory = options.sameCategory ?? true;
  const timed = signals
    .filter((s) => s.detectedAt !== null)
    .sort((a, b) => ms(a.detectedAt!) - ms(b.detectedAt!) || a.id.localeCompare(b.id));
  const standing = signals.filter((s) => s.detectedAt === null);

  const groups: Signal[][] = [];
  const lastAt: number[] = [];
  for (const s of timed) {
    const at = ms(s.detectedAt!);
    const idx =
      s.persona === null
        ? -1
        : groups.findIndex(
            (g, i) =>
              g[0].persona === s.persona &&
              (!sameCategory || categoryClass(g[0].category) === categoryClass(s.category)) &&
              at - lastAt[i] <= options.windowMs,
          );
    if (idx === -1) {
      groups.push([s]);
      lastAt.push(at);
    } else {
      groups[idx].push(s);
      lastAt[idx] = at;
    }
  }

  for (const s of standing) {
    const service = s.service?.toLowerCase();
    if (!service) continue;
    const target = groups.find(
      (g) =>
        (!sameCategory || categoryClass(g[0].category) === categoryClass(s.category)) &&
        g.some((m) => m.text?.toLowerCase().includes(service)),
    );
    if (target) target.push(s);
  }

  return groups.map(toIncident);
}

function toIncident(members: Signal[]): Incident {
  const timed = members.filter((m) => m.detectedAt !== null);
  const earliest = timed[0];
  const status = members.reduce<SignalStatus>(
    (max, m) => (STATUS_RANK[m.status] > STATUS_RANK[max] ? m.status : max),
    "resolved",
  );
  const stillOpen = status === "open" || status === "escalated";
  const latestResolved =
    timed
      .map((m) => m.resolvedAt)
      .filter((r): r is string => r !== null)
      .sort((a, b) => ms(b) - ms(a))[0] ?? null;
  return {
    id: `cor_${earliest.id}`,
    members,
    severity: members.reduce<SignalSeverity>(
      (max, m) => (SEVERITY_RANK[m.severity] > SEVERITY_RANK[max] ? m.severity : max),
      "low",
    ),
    status,
    detectedAt: earliest.detectedAt!,
    resolvedAt: stillOpen ? null : latestResolved,
    persona: earliest.persona,
  };
}

// ── Adapters: today's fixtures as signals ───────────────────────────

const SLA_SEVERITY: Record<SLABreach["severity"], SignalSeverity> = {
  critical: "critical",
  major: "high",
  minor: "low",
};

export function slaBreachSignal(b: SLABreach): Signal {
  return {
    id: b.id,
    kind: "slaBreach",
    persona: b.persona,
    category: b.metric,
    detectedAt: b.startedAt,
    resolvedAt: b.resolvedAt,
    severity: SLA_SEVERITY[b.severity],
    status: b.resolvedAt ? "resolved" : "open",
    text: b.summary,
  };
}

export function healthIssueSignal(i: MockHealthIssue): Signal {
  const resolved = i.status === "resolved" || i.status === "auto_fixed";
  return {
    id: i.id,
    kind: "healthIssue",
    persona: i.personaName,
    category: i.category,
    detectedAt: i.detectedAt,
    resolvedAt: null,
    severity: i.severity,
    status: resolved ? "resolved" : "open",
    text: `${i.title} ${i.description}`,
  };
}

export function healthCheckSignal(c: HealthCheckItem): Signal {
  return {
    id: c.id,
    kind: "healthCheck",
    persona: null,
    category: "availability",
    detectedAt: null,
    resolvedAt: null,
    severity: "high",
    status: "open",
    service: c.name,
  };
}

export function auditIncidentSignal(i: AuditIncident): Signal {
  return {
    id: i.id,
    kind: "auditIncident",
    persona: i.persona,
    category: i.category,
    detectedAt: i.detectedAt,
    resolvedAt: i.resolvedAt,
    severity: i.severity,
    status: i.status,
    text: `${i.title} ${i.description}`,
  };
}

/** The fixtures signals are lifted from: the demo's own, or a session projection of them. */
export interface SignalFixtures {
  slaBreaches: SLABreach[];
  healthIssues: MockHealthIssue[];
  healthChecks: HealthCheckSection[];
  auditIncidents: AuditIncident[];
}

const DEMO_SIGNAL_FIXTURES: SignalFixtures = {
  slaBreaches: MOCK_SLA_BREACHES,
  healthIssues: MOCK_HEALTH_ISSUES,
  healthChecks: MOCK_HEALTH_CHECKS,
  auditIncidents: MOCK_AUDIT_INCIDENTS,
};

/** The window the demo Incidents page correlates with: 90 minutes. */
export const DEMO_CORRELATION_WINDOW_MS = 90 * 60_000;

/**
 * Every demo signal. Only a failing health check is a signal; an ok one is not.
 * Given the session's projection (lib/settleThread.ts), a fixed cause's
 * signals arrive settled, so its incident resolves.
 */
export function demoSignals(fixtures: SignalFixtures = DEMO_SIGNAL_FIXTURES): Signal[] {
  return [
    ...fixtures.slaBreaches.map(slaBreachSignal),
    ...fixtures.healthIssues.map(healthIssueSignal),
    ...fixtures.healthChecks
      .flatMap((s) => s.items)
      .filter((c) => c.status === "error")
      .map(healthCheckSignal),
    ...fixtures.auditIncidents.map(auditIncidentSignal),
  ];
}

/** The correlated incident holding a signal id, or null. */
export function incidentContaining(incidents: readonly Incident[], signalId: string): Incident | null {
  return incidents.find((i) => i.members.some((m) => m.id === signalId)) ?? null;
}
