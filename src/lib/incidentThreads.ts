import {
  MOCK_HEALTH_CHECKS,
  MOCK_HEALTH_ISSUES,
  MOCK_SLA_BREACHES,
  MOCK_SLA_TARGETS,
  type SLABreach,
  type SLAMetricType,
  type SLASeverity,
} from "./mock-dashboard-data";

/**
 * Demo incident threads: one outage, followed across the three Observability
 * routes that each hold a fragment of it.
 *
 * The Slack circuit-break is a health check on /dashboard/health, a health
 * issue on /dashboard/observability, and an SLA breach (plus the target it
 * breaches) on /dashboard/sla. This module joins those fragments so each one
 * can link to its siblings with a `?focus=<id>` deep link.
 *
 * Two joins, two kinds of evidence:
 * - Across routes, fragments share a declared `causeKey`. Nothing else in the
 *   fixtures ties a health check to a breach, so the key is the identity,
 *   minted once and carried to every screen.
 * - Within SLA, a target joins its breaches by persona + metric, which both
 *   already carry. That join is derived, never declared.
 *
 * Pure: every function takes its fixtures, so the Supabase plane (which has no
 * causeKey) simply yields no threads and no links.
 */

export type IncidentMemberKind = "slaBreach" | "slaTarget" | "healthIssue" | "healthCheck";
export type IncidentRoute = "sla" | "observability" | "health";

const KIND_ROUTE: Record<IncidentMemberKind, IncidentRoute> = {
  slaBreach: "sla",
  slaTarget: "sla",
  healthIssue: "observability",
  healthCheck: "health",
};

const ROUTE_PATH: Record<IncidentRoute, string> = {
  sla: "/dashboard/sla",
  observability: "/dashboard/observability",
  health: "/dashboard/health",
};

/** Kinds a `?focus=` can land on, in link order. A target is a thread member
 *  but its grid has no focus target, so it is never linked to. */
const LINK_KINDS: IncidentMemberKind[] = ["slaBreach", "healthIssue", "healthCheck"];

export interface IncidentMember {
  kind: IncidentMemberKind;
  id: string;
  /** Owning persona; health checks are infrastructure and carry none. */
  persona: string | null;
}

export interface IncidentThread {
  key: string;
  members: IncidentMember[];
}

export interface RelatedLink {
  route: IncidentRoute;
  kind: IncidentMemberKind;
  id: string;
  href: string;
}

export interface IncidentFixtures {
  healthChecks: { id: string; causeKey?: string }[];
  healthIssues: { id: string; personaName: string | null; causeKey?: string }[];
  slaBreaches: { id: string; persona: string; metric: SLAMetricType; causeKey?: string }[];
  slaTargets: { id: string; persona: string; metric: SLAMetricType }[];
}

export function focusHref(kind: IncidentMemberKind, id: string): string {
  return `${ROUTE_PATH[KIND_ROUTE[kind]]}?focus=${encodeURIComponent(id)}`;
}

/** Breach ids for one SLA target, joined by persona + metric. */
export function relatedWithinSla(fixtures: IncidentFixtures, targetId: string): string[] {
  const target = fixtures.slaTargets.find((t) => t.id === targetId);
  if (!target) return [];
  return fixtures.slaBreaches
    .filter((b) => b.persona === target.persona && b.metric === target.metric)
    .map((b) => b.id);
}

export function buildIncidentThreads(fixtures: IncidentFixtures): IncidentThread[] {
  const byKey = new Map<string, IncidentMember[]>();
  const add = (key: string | undefined, member: IncidentMember) => {
    if (!key) return;
    const members = byKey.get(key) ?? [];
    members.push(member);
    byKey.set(key, members);
  };
  for (const b of fixtures.slaBreaches) add(b.causeKey, { kind: "slaBreach", id: b.id, persona: b.persona });
  for (const i of fixtures.healthIssues) add(i.causeKey, { kind: "healthIssue", id: i.id, persona: i.personaName });
  for (const c of fixtures.healthChecks) add(c.causeKey, { kind: "healthCheck", id: c.id, persona: null });

  return [...byKey].map(([key, members]) => {
    const breachIds = new Set(members.filter((m) => m.kind === "slaBreach").map((m) => m.id));
    const targets = fixtures.slaTargets
      .filter((t) => relatedWithinSla(fixtures, t.id).some((id) => breachIds.has(id)))
      .map((t): IncidentMember => ({ kind: "slaTarget", id: t.id, persona: t.persona }));
    return { key, members: [...members, ...targets] };
  });
}

/** One link per OTHER route the id's thread reaches; [] when it has no thread. */
export function relatedTo(threads: IncidentThread[], id: string): RelatedLink[] {
  const thread = threads.find((t) => t.members.some((m) => m.id === id));
  const self = thread?.members.find((m) => m.id === id);
  if (!thread || !self) return [];
  const seen = new Set<IncidentRoute>([KIND_ROUTE[self.kind]]);
  const links: RelatedLink[] = [];
  for (const kind of LINK_KINDS) {
    const route = KIND_ROUTE[kind];
    const member = thread.members.find((m) => m.kind === kind);
    if (!member || seen.has(route)) continue;
    seen.add(route);
    links.push({ route, kind, id: member.id, href: focusHref(kind, member.id) });
  }
  return links;
}

/** `?focus=` is untrusted input: only an id we know passes through. */
export function resolveFocus(raw: string | null, known: ReadonlySet<string>): string | null {
  return raw !== null && known.has(raw) ? raw : null;
}

export function initialBreachLogState(
  breaches: Pick<SLABreach, "id">[],
  focus: string | null,
): { filter: "all" | SLASeverity; openId: string | null } {
  const openId = focus !== null && breaches.some((b) => b.id === focus) ? focus : null;
  return { filter: "all", openId };
}

export const DEMO_INCIDENT_FIXTURES: IncidentFixtures = {
  healthChecks: MOCK_HEALTH_CHECKS.flatMap((section) => section.items),
  healthIssues: MOCK_HEALTH_ISSUES,
  slaBreaches: MOCK_SLA_BREACHES,
  slaTargets: MOCK_SLA_TARGETS,
};

export const DEMO_THREADS = buildIncidentThreads(DEMO_INCIDENT_FIXTURES);

/** Every id a demo `?focus=` may name: the rows the three routes render. */
export const DEMO_FOCUS_IDS: ReadonlySet<string> = new Set([
  ...DEMO_INCIDENT_FIXTURES.slaBreaches.map((b) => b.id),
  ...DEMO_INCIDENT_FIXTURES.healthIssues.map((i) => i.id),
  ...DEMO_INCIDENT_FIXTURES.healthChecks.map((c) => c.id),
]);
