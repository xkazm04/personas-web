import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { IDLE_LEDGER, overlay, transition, type LedgerState } from "./review-ledger";
import {
  DEFAULT_ESCALATION_POLICY,
  URGENCY_THRESHOLD_MINUTES,
  countOverdue,
  escalationDue,
  focusQueue,
  formatDue,
  orderByDue,
  reconcileFocusQueue,
  slaState,
  validateEscalationPolicy,
} from "./review-sla";
import type { EscalationPolicy, ManualReviewItem, ReviewSeverity, ReviewStatus } from "./types";

// One fixed clock for every case: the SLA rule is pure and takes `now`.
const NOW = Date.parse("2026-09-23T12:00:00.000Z");
const MIN = 60_000;

function row(id: string, severity: ReviewSeverity, minutesOld: number, status: ReviewStatus = "pending"): ManualReviewItem {
  return {
    id,
    personaId: "p",
    executionId: "",
    eventType: "manual_review",
    content: id,
    severity,
    status,
    reviewerNotes: null,
    createdAt: new Date(NOW - minutesOld * MIN).toISOString(),
    resolvedAt: status === "pending" ? null : new Date(NOW).toISOString(),
    resolvedBy: status === "pending" ? null : "System",
    escalatedAt: null,
  };
}

// The card's demo mix: info 24 h old, critical 14 min, warning 1 min, one resolved.
const MIX = [row("warn", "warning", 1), row("done", "info", 30, "approved"), row("crit", "critical", 14), row("info", "info", 1440)];

describe("slaState: one SLA rule", () => {
  it("critical 14 min old is due-soon with 16 min left (urgency 5 m passed, SLA 30 m not)", () => {
    expect(slaState(row("c", "critical", 14), DEFAULT_ESCALATION_POLICY, NOW)).toMatchObject({
      phase: "due-soon",
      remainingMs: 16 * MIN,
    });
  });

  it("info 24 h old is overdue by 16 h: negative, not clamped to 0", () => {
    expect(slaState(row("i", "info", 1440), DEFAULT_ESCALATION_POLICY, NOW)).toMatchObject({
      phase: "overdue",
      remainingMs: -960 * MIN,
    });
  });

  it("a fresh row below its urgency threshold is ok", () => {
    expect(slaState(row("w", "warning", 1), DEFAULT_ESCALATION_POLICY, NOW).phase).toBe("ok");
  });

  it("an unparseable createdAt fails loud: due now, overdue", () => {
    const bad = { ...row("x", "info", 0), createdAt: "not a date" };
    expect(slaState(bad, DEFAULT_ESCALATION_POLICY, NOW)).toMatchObject({ phase: "overdue", remainingMs: 0, dueAt: NOW });
  });
});

describe("due order", () => {
  it("pending by remainingMs ascending, resolved rows after", () => {
    expect(orderByDue(MIX, DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id)).toEqual(["info", "crit", "warn", "done"]);
  });

  it("countOverdue counts pending overdue rows only; focusQueue walks the same due order", () => {
    expect(countOverdue(MIX, DEFAULT_ESCALATION_POLICY, NOW)).toBe(1);
    expect(focusQueue(MIX, DEFAULT_ESCALATION_POLICY, NOW)).toEqual(["info", "crit", "warn"]);
  });

  it("the order is a function of the due instant, so the clock ticking never reshuffles it", () => {
    const later = NOW + 3 * 60 * MIN;
    expect(orderByDue(MIX, DEFAULT_ESCALATION_POLICY, later).map((r) => r.id)).toEqual(
      orderByDue(MIX, DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id),
    );
  });

  it("guard: non-pending rows keep today's newest-first order within their group", () => {
    const resolved = [row("old", "info", 300, "approved"), row("new", "critical", 10, "rejected"), row("mid", "warning", 60, "approved")];
    expect(orderByDue(resolved, DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id)).toEqual(["new", "mid", "old"]);
  });
});

describe("rows inside the undo window (decision ledger)", () => {
  // Definition: the ledger overlay is the truth everywhere. A row whose verdict
  // sits in the open 5 s window is a decided row: it sorts with the resolved
  // group, carries no clock, is not overdue, cannot be escalated and leaves the
  // focus walk. Undo puts it back exactly in its due slot.
  const arm = (ids: string[], state: LedgerState = IDLE_LEDGER) =>
    transition(state, { type: "arm", ids, verdict: "approved", now: NOW }).state;

  it("a windowed row sorts as decided and stops counting as overdue", () => {
    const windowed = overlay(MIX, arm(["info"]));
    expect(orderByDue(windowed, DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id)).toEqual(["crit", "warn", "done", "info"]);
    expect(countOverdue(windowed, DEFAULT_ESCALATION_POLICY, NOW)).toBe(0);
    const info = windowed.find((r) => r.id === "info")!;
    expect(escalationDue(info, DEFAULT_ESCALATION_POLICY, NOW)).toBe(false);
  });

  it("undo restores the exact due position", () => {
    const state = arm(["info"]);
    const undone = transition(state, { type: "undo", batchId: state.window!.batchId }).state;
    expect(orderByDue(overlay(MIX, undone), DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id)).toEqual(
      orderByDue(MIX, DEFAULT_ESCALATION_POLICY, NOW).map((r) => r.id),
    );
  });

  it("resolve the head -> the next most urgent follows; undo -> it returns to the front", () => {
    let queue = focusQueue(MIX, DEFAULT_ESCALATION_POLICY, NOW);
    const decided = new Set(["info"]);
    const state = arm(["info"]);
    queue = reconcileFocusQueue(queue, focusQueue(overlay(MIX, state), DEFAULT_ESCALATION_POLICY, NOW), decided);
    expect(queue).toEqual(["crit", "warn"]);
    const undone = transition(state, { type: "undo", batchId: state.window!.batchId }).state;
    queue = reconcileFocusQueue(queue, focusQueue(overlay(MIX, undone), DEFAULT_ESCALATION_POLICY, NOW), decided);
    expect(queue).toEqual(["info", "crit", "warn"]);
  });

  it("new arrivals join the back of the walk in due order, skips are kept", () => {
    const skipped = ["warn", "crit"]; // the operator skipped crit once
    const pending = focusQueue([...MIX, row("late", "info", 1000), row("hot", "critical", 40)], DEFAULT_ESCALATION_POLICY, NOW);
    expect(reconcileFocusQueue(skipped, pending, new Set())).toEqual(["warn", "crit", "info", "late", "hot"]);
  });
});

describe("escalation uses the same rule", () => {
  const overdueCrit = row("c", "critical", 45);
  it("due iff pending, not yet escalated, action is not none, and overdue", () => {
    expect(escalationDue(overdueCrit, DEFAULT_ESCALATION_POLICY, NOW)).toBe(true);
    expect(escalationDue(row("c", "critical", 14), DEFAULT_ESCALATION_POLICY, NOW)).toBe(false);
    expect(escalationDue({ ...overdueCrit, escalatedAt: new Date(NOW).toISOString() }, DEFAULT_ESCALATION_POLICY, NOW)).toBe(false);
    expect(escalationDue({ ...overdueCrit, status: "approved" }, DEFAULT_ESCALATION_POLICY, NOW)).toBe(false);
    const none: EscalationPolicy = { ...DEFAULT_ESCALATION_POLICY, critical: { slaMinutes: 30, action: "none" } };
    expect(escalationDue(overdueCrit, none, NOW)).toBe(false);
  });

  it("source scan: no second copy of the SLA arithmetic outside review-sla.ts", () => {
    const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const p = path.join(dir, name);
        return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : [];
      });
    const offenders = walk(SRC).filter(
      (f) => /slaMinutes\s*\*/.test(readFileSync(f, "utf8")) && !f.endsWith(path.join("lib", "review-sla.ts")),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
    expect(readFileSync(path.join(SRC, "stores", "reviewStore.ts"), "utf8")).not.toMatch(/slaMinutes \* 60_000/);
  });
});

describe("validateEscalationPolicy: SLA >= urgency threshold on every policy", () => {
  it("critical SLA of 2 min falls back to 30 and says why", () => {
    const { policy, rejections } = validateEscalationPolicy({ critical: { slaMinutes: 2, action: "escalate" } });
    expect(policy.critical).toEqual({ slaMinutes: 30, action: "escalate" });
    expect(rejections).toContain("critical.slaMinutes: below urgency threshold");
  });

  it("holds for every severity and every candidate SLA, not just the defaults", () => {
    const severities = Object.keys(URGENCY_THRESHOLD_MINUTES) as ReviewSeverity[];
    const candidates = [0.5, 1, 2, 4, 5, 6, 29, 30, 31, 119, 120, 121, 240, 480, 10_000];
    for (const sev of severities) {
      for (const slaMinutes of candidates) {
        const { policy } = validateEscalationPolicy({ [sev]: { slaMinutes, action: "auto_approve" } });
        for (const s of severities) expect(policy[s].slaMinutes).toBeGreaterThanOrEqual(URGENCY_THRESHOLD_MINUTES[s]);
        expect(policy[sev].slaMinutes).toBe(slaMinutes >= URGENCY_THRESHOLD_MINUTES[sev] ? slaMinutes : DEFAULT_ESCALATION_POLICY[sev].slaMinutes);
      }
    }
  });

  it("keeps the old field rules: missing -> default silently, invalid -> default + rejection", () => {
    const { policy, rejections } = validateEscalationPolicy({ warning: { action: "nope", slaMinutes: -1 }, info: "x" });
    expect(policy).toEqual(DEFAULT_ESCALATION_POLICY);
    expect(rejections).toEqual([
      "warning.action: invalid value",
      "warning.slaMinutes: not finite positive",
      "info: stored as string, expected object",
    ]);
  });

  it("guard: DEFAULT_ESCALATION_POLICY unchanged and valid as it stands", () => {
    expect(DEFAULT_ESCALATION_POLICY).toEqual({
      critical: { slaMinutes: 30, action: "escalate" },
      warning: { slaMinutes: 240, action: "escalate" },
      info: { slaMinutes: 480, action: "auto_approve" },
    });
    expect(validateEscalationPolicy(DEFAULT_ESCALATION_POLICY).rejections).toEqual([]);
  });
});

describe("guard: urgency thresholds unchanged", () => {
  it("urgency is 0 below 5/30/120 min and ramps to 1 at 3x", () => {
    expect(URGENCY_THRESHOLD_MINUTES).toEqual({ critical: 5, warning: 30, info: 120 });
    const at = (sev: ReviewSeverity, minutes: number) =>
      slaState({ createdAt: new Date(NOW - minutes * MIN).toISOString(), severity: sev }, DEFAULT_ESCALATION_POLICY, NOW).urgency;
    expect(at("critical", 4)).toBe(0);
    expect(at("critical", 10)).toBeCloseTo(0.5);
    expect(at("warning", 90)).toBe(1);
    expect(at("info", 119)).toBe(0);
  });
});

describe("formatDue: localized without per-unit keys", () => {
  it("overdue 16 h renders through Intl.RelativeTimeFormat in en and cs", () => {
    const en = formatDue(-960 * MIN, "en");
    const cs = formatDue(-960 * MIN, "cs");
    expect(en).toBe(new Intl.RelativeTimeFormat("en", { numeric: "always" }).format(-16, "hour"));
    expect(en).not.toBe(cs);
    expect(en).toContain("16");
    expect(cs).toContain("16");
  });

  it("picks minutes under an hour, hours under two days, days beyond", () => {
    expect(formatDue(16 * MIN, "en")).toBe("in 16 minutes");
    expect(formatDue(20 * 60 * MIN, "en")).toBe("in 20 hours");
    expect(formatDue(-3 * 24 * 60 * MIN, "en")).toBe("3 days ago");
    expect(formatDue(10_000, "en")).toBe("in 1 minute");
  });
});
