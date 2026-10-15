import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { correlate, DEMO_CORRELATION_WINDOW_MS, demoSignals, incidentContaining } from "./incidentCorrelate";
import { buildIncidentThreads, DEMO_INCIDENT_FIXTURES, linksToMembers } from "./incidentThreads";
import {
  DEMO_THREAD_FIXTURES,
  healthAlertCount,
  NO_RESOLVED_CAUSES,
  openIncidentCount,
  projectDemoThreads,
  settleThread,
  type ResolvedCauses,
  type ThreadFixtures,
} from "./settleThread";

/**
 * Fix the cause once, and every fragment of its thread settles (P21): the
 * Slack circuit-break's health check, health issue, SLA breach, SLA target and
 * audit incident all close on one fix, nothing outside the thread moves, and
 * the history (budget consumed, the breach's minutes) stays.
 */

const SLACK = "slack-circuit-break";
const AT = "2030-01-01T00:00:00.000Z";
const FIXED: ResolvedCauses = { [SLACK]: { at: AT, kind: "configure" } };

const checks = (f: ThreadFixtures) => f.healthChecks.flatMap((s) => s.items);
const byId = <T extends { id: string }>(rows: T[], id: string): T => {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`no row ${id}`);
  return row;
};

const threadIds = (key: string) => [
  ...(buildIncidentThreads(DEMO_INCIDENT_FIXTURES)
    .find((t) => t.key === key)
    ?.members.map((m) => m.id) ?? []),
  ...DEMO_THREAD_FIXTURES.auditIncidents.filter((i) => i.causeKey === key).map((i) => i.id),
];

/** Every row of the fixtures, by id. */
function rowsById(f: ThreadFixtures): Map<string, unknown> {
  return new Map<string, unknown>([
    ...checks(f).map((r) => [r.id, r] as const),
    ...f.healthIssues.map((r) => [r.id, r] as const),
    ...f.slaBreaches.map((r) => [r.id, r] as const),
    ...f.slaTargets.map((r) => [r.id, r] as const),
    ...f.auditIncidents.map((r) => [r.id, r] as const),
  ]);
}

/** Is the row with this id still open in these fixtures? */
function isOpen(f: ThreadFixtures, id: string): boolean {
  const check = checks(f).find((c) => c.id === id);
  if (check) return check.status !== "ok";
  const issue = f.healthIssues.find((i) => i.id === id);
  if (issue) return issue.status === "open";
  const breach = f.slaBreaches.find((b) => b.id === id);
  if (breach) return breach.resolvedAt === null;
  const target = f.slaTargets.find((t) => t.id === id);
  if (target) return target.activeBreach;
  const incident = f.auditIncidents.find((i) => i.id === id);
  if (incident) return incident.status === "open" || incident.status === "escalated";
  throw new Error(`no row ${id}`);
}

describe("settleThread", () => {
  const settled = settleThread(DEMO_THREAD_FIXTURES, FIXED);

  it("the Slack thread spans all five fixtures and is open today", () => {
    const ids = threadIds(SLACK);
    expect(ids).toEqual(expect.arrayContaining(["in_slack", "hi_2", "br_1", "sla_5", "inc_1"]));
    expect(ids.filter((id) => isOpen(DEMO_THREAD_FIXTURES, id))).toEqual(ids);
  });

  it("leaves zero open members of the fixed thread", () => {
    expect(threadIds(SLACK).filter((id) => isOpen(settled, id))).toEqual([]);
  });

  it("closes the breach at the fix time with its duration frozen", () => {
    const before = byId(DEMO_THREAD_FIXTURES.slaBreaches, "br_1");
    const after = byId(settled.slaBreaches, "br_1");
    expect(after.resolvedAt).toBe(AT);
    expect(after.durationMinutes).toBe(Math.round((Date.parse(AT) - Date.parse(before.startedAt)) / 60_000));
    expect(byId(settled.auditIncidents, "inc_1").resolvedAt).toBe(AT);
  });

  it("keeps history: rows stay, consumed budget and failure flags stay", () => {
    const target = byId(settled.slaTargets, "sla_5");
    const original = byId(DEMO_THREAD_FIXTURES.slaTargets, "sla_5");
    expect(target.timeInSLA).toBe(original.timeInSLA);
    expect(target.current).toBe(original.current);
    expect(byId(settled.healthIssues, "hi_2").isCircuitBreaker).toBe(true);
    expect(settled.slaBreaches).toHaveLength(DEMO_THREAD_FIXTURES.slaBreaches.length);
    expect(settled.healthIssues).toHaveLength(DEMO_THREAD_FIXTURES.healthIssues.length);
    expect(settled.auditIncidents).toHaveLength(DEMO_THREAD_FIXTURES.auditIncidents.length);
  });

  it("returns every row outside the thread by reference (the security-latency thread included)", () => {
    const inThread = new Set(threadIds(SLACK));
    const security = threadIds("security-latency");
    expect(security.length).toBeGreaterThan(0);
    const before = rowsById(DEMO_THREAD_FIXTURES);
    const after = rowsById(settled);
    for (const id of security) expect(after.get(id), id).toBe(before.get(id));
    for (const [id, row] of before) if (!inThread.has(id)) expect(after.get(id), id).toBe(row);
    // Sections with no thread member come back by reference too.
    const untouched = DEMO_THREAD_FIXTURES.healthChecks.filter((s) => s.key !== "integrations");
    for (const section of untouched) expect(settled.healthChecks).toContain(section);
  });

  it("never mutates its input, and with no fix (or an unknown cause) returns the fixtures themselves", () => {
    const snapshot = JSON.stringify(DEMO_THREAD_FIXTURES);
    settleThread(DEMO_THREAD_FIXTURES, FIXED);
    expect(JSON.stringify(DEMO_THREAD_FIXTURES)).toBe(snapshot);
    expect(settleThread(DEMO_THREAD_FIXTURES, NO_RESOLVED_CAUSES)).toBe(DEMO_THREAD_FIXTURES);
    expect(settleThread(DEMO_THREAD_FIXTURES, { nope: { at: AT, kind: "configure" } })).toBe(DEMO_THREAD_FIXTURES);
  });

  it("is idempotent: settling a settled projection changes nothing", () => {
    expect(settleThread(settled, FIXED)).toBe(settled);
  });
});

describe("correlate over the projection", () => {
  const incidents = (f: ThreadFixtures) => correlate(demoSignals(f), { windowMs: DEMO_CORRELATION_WINDOW_MS });
  const active = (s: string) => s === "open" || s === "escalated";

  it("today: the Slack cluster is active and holds the failing check", () => {
    const slack = incidentContaining(incidents(DEMO_THREAD_FIXTURES), "in_slack");
    expect(slack && active(slack.status)).toBe(true);
  });

  it("after the fix: no active cluster contains in_slack, and the Slack cluster resolves at the fix time", () => {
    const after = incidents(settleThread(DEMO_THREAD_FIXTURES, FIXED));
    expect(after.filter((i) => active(i.status) && i.members.some((m) => m.id === "in_slack"))).toEqual([]);
    const slack = incidentContaining(after, "inc_1")!;
    expect(slack.members.map((m) => m.id).sort()).toEqual(["br_1", "hi_2", "inc_1"]);
    expect(slack.status).toBe("resolved");
    expect(slack.resolvedAt).toBe(AT);
    // History stays linkable: the resolved cluster still reaches SLA and Observability.
    expect(linksToMembers(slack.members).map((l) => l.href)).toEqual([
      "/dashboard/sla?focus=br_1",
      "/dashboard/observability?focus=hi_2",
    ]);
  });

  it("the other clusters are untouched", () => {
    const before = incidents(DEMO_THREAD_FIXTURES).filter((i) => !i.members.some((m) => m.id === "inc_1"));
    const after = incidents(settleThread(DEMO_THREAD_FIXTURES, FIXED)).filter(
      (i) => !i.members.some((m) => m.id === "inc_1"),
    );
    expect(after).toEqual(before);
  });
});

describe("badge selectors over the projection", () => {
  it("with no fix, read today's values (Health 1, Incidents = open + escalated)", () => {
    const today = projectDemoThreads(NO_RESOLVED_CAUSES);
    expect(today).toBe(DEMO_THREAD_FIXTURES);
    expect(healthAlertCount(today.healthChecks)).toBe(1);
    expect(openIncidentCount(today.auditIncidents)).toBe(
      DEMO_THREAD_FIXTURES.auditIncidents.filter((i) => i.status === "open" || i.status === "escalated").length,
    );
  });

  it("after the fix, each badge drops by the thread's members", () => {
    const today = projectDemoThreads(NO_RESOLVED_CAUSES);
    const fixed = projectDemoThreads(FIXED);
    expect(projectDemoThreads(FIXED)).toBe(fixed); // one projection per fix state
    expect(healthAlertCount(fixed.healthChecks)).toBe(healthAlertCount(today.healthChecks) - 1);
    expect(openIncidentCount(fixed.auditIncidents)).toBe(openIncidentCount(today.auditIncidents) - 1);
  });
});

describe("wiring (source scan)", () => {
  const SRC = path.resolve(__dirname, "..");
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
    });
  const sources = files(SRC).filter((f) => !/\.test\.tsx?$/.test(f));

  it("correlate() has a production importer", () => {
    const importers = sources.filter((f) => {
      const text = readFileSync(f, "utf8");
      return /import\s*\{[^}]*\bcorrelate\b[^}]*\}\s*from\s*"(\.\/|@\/lib\/)incidentCorrelate"/.test(text);
    });
    expect(importers.map((f) => path.relative(SRC, f).replaceAll("\\", "/"))).toContain("lib/mockApi.ts");
  });

  it("the badge counts are no longer import-time constants", () => {
    for (const f of sources) {
      const text = readFileSync(f, "utf8");
      expect(text, f).not.toMatch(/\bMOCK_HEALTH_ALERTS\b/);
      expect(text, f).not.toMatch(/\bMOCK_OPEN_INCIDENTS\b/);
    }
  });
});
