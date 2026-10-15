import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCOPE_FILTER,
  dayStartMs,
  inScope,
  scopeHidAll,
  scopeRows,
  scopeWindow,
  type ScopeFilter,
  type ScopeRow,
} from "./dashboardScope";

const NOW = Date.parse("2026-10-15T12:00:00Z");
const H = 3_600_000;
const ago = (hours: number) => new Date(NOW - hours * H).toISOString();

const IR = "p-0002-mock";
const PR = "p-0001-mock";

// A mixed list: two personas, id- and name-keyed rows, rows with no persona or
// no time dimension, an open and a closed span, an unreadable time.
const MIXED: (ScopeRow & { tag: string })[] = [
  { tag: "ir-1h", personaId: IR, at: ago(1) },
  { tag: "ir-23h", personaId: IR, at: ago(23) },
  { tag: "ir-3d", personaId: IR, at: ago(72) },
  { tag: "ir-10d", personaId: IR, at: ago(240) },
  { tag: "pr-2h", personaId: PR, at: ago(2) },
  { tag: "pr-5d", personaId: PR, at: ago(120) },
  { tag: "pr-40d", personaId: PR, at: ago(960) },
  { tag: "broadcast-1h", personaId: null, at: ago(1) },
  { tag: "ir-name-6h", personaName: "Incident Responder", at: ago(6) },
  { tag: "pr-name-6h", personaName: "PR Review Agent", at: ago(6) },
  { tag: "ir-standing", personaId: IR },
  { tag: "timeless-anyone", at: ago(500) },
  { tag: "ir-open-span-from-3d", personaId: IR, at: ago(72), until: null },
  { tag: "ir-closed-span-3d", personaId: IR, at: ago(80), until: ago(72) },
  { tag: "ir-future", personaId: IR, at: NOW + H },
  { tag: "ir-unreadable", personaId: IR, at: "not a date" },
];

const kept = (filter: ScopeFilter) => MIXED.filter((row) => inScope(row, filter, NOW)).map((row) => row.tag);

describe("inScope", () => {
  it("keeps every row but the older-than-7-days ones under the default scope", () => {
    expect(kept(DEFAULT_SCOPE_FILTER)).toHaveLength(13);
    expect(kept(DEFAULT_SCOPE_FILTER)).not.toContain("ir-10d");
    expect(kept(DEFAULT_SCOPE_FILTER)).not.toContain("pr-40d");
    expect(kept(DEFAULT_SCOPE_FILTER)).not.toContain("timeless-anyone");
  });

  it("narrows to one persona and the last 24 hours", () => {
    const filter: ScopeFilter = { personaId: IR, personaName: "Incident Responder", dateRange: "24h" };
    expect(kept(filter)).toEqual([
      "ir-1h",
      "ir-23h",
      "ir-name-6h",
      "ir-standing",
      "ir-open-span-from-3d",
      "ir-future",
      "ir-unreadable",
    ]);
  });

  it("widens with the window: 90 days keeps all but nothing older", () => {
    expect(kept({ personaId: null, dateRange: "90d" })).toHaveLength(16);
    expect(kept({ personaId: null, dateRange: "30d" })).toHaveLength(15);
    expect(kept({ personaId: null, dateRange: "24h" })).toHaveLength(10);
  });

  it("drops a name-keyed row when the chosen persona's name is not known", () => {
    expect(inScope({ personaName: "Incident Responder" }, { personaId: IR, dateRange: "7d" }, NOW)).toBe(false);
  });

  it("reads a custom range, a date-only end covering the whole day", () => {
    const filter: ScopeFilter = { personaId: null, dateRange: "custom", customStart: "2026-10-12", customEnd: "2026-10-12" };
    expect(kept(filter)).toEqual(["ir-3d", "ir-standing", "ir-open-span-from-3d", "ir-closed-span-3d", "ir-unreadable"]);
    expect(scopeWindow({ personaId: null, dateRange: "custom" }, NOW)).toBeNull();
  });
});

describe("scopeRows", () => {
  it("keeps the focused row whatever the scope says", () => {
    const rows = [{ id: "a", at: ago(400) }, { id: "b", at: ago(1) }];
    const scope = { filter: { personaId: null, dateRange: "24h" as const }, now: NOW };
    expect(scopeRows(rows, (r) => ({ at: r.at }), scope).map((r) => r.id)).toEqual(["b"]);
    expect(scopeRows(rows, (r) => ({ at: r.at }), scope, { id: "a", of: (r) => r.id }).map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("tells an emptied list from an empty one", () => {
    expect(scopeHidAll([1], [])).toBe(true);
    expect(scopeHidAll([], [])).toBe(false);
  });
});

describe("daily rows", () => {
  it("count whole days: 24h is today, 7d is the last seven", () => {
    const days = Array.from({ length: 14 }, (_, i) => new Date(NOW - (13 - i) * 24 * H).toISOString().slice(0, 10));
    const count = (dateRange: ScopeFilter["dateRange"]) =>
      days.filter((date) => inScope({ at: dayStartMs(date) }, { personaId: null, dateRange }, NOW)).length;
    expect(count("24h")).toBe(1);
    expect(count("7d")).toBe(7);
    expect(count("30d")).toBe(14);
  });
});
