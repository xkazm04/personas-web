import { describe, expect, it } from "vitest";
import {
  addCommand,
  applyRowUpdate,
  displayEnabled,
  latestForPersona,
  openIds,
  overdueIds,
  reportedEnabled,
  type CommandStatus,
  type InflightCommand,
  type InflightMap,
} from "./commandReducer";

const T0 = Date.parse("2026-10-06T12:00:00.000Z");

const cmd = (over: Partial<InflightCommand> = {}): InflightCommand => ({
  id: "c1",
  verb: "pause_persona",
  personaId: "p1",
  status: "pending",
  result: null,
  error: null,
  requestedAt: T0,
  expiresAt: T0 + 60_000,
  ...over,
});

const ALL: CommandStatus[] = ["pending", "executing", "completed", "failed", "rejected", "expired"];
const TERMINAL: CommandStatus[] = ["completed", "failed", "rejected", "expired"];

describe("commandStore reducer: the six states", () => {
  it("pending -> executing -> completed, carrying the result", () => {
    let m: InflightMap = addCommand({}, cmd());
    m = applyRowUpdate(m, { id: "c1", status: "executing" });
    expect(m.c1.status).toBe("executing");
    m = applyRowUpdate(m, { id: "c1", status: "completed", result: { enabled: false, changed: true } });
    expect(m.c1).toMatchObject({ status: "completed", result: { enabled: false, changed: true }, error: null });
  });

  it.each(["failed", "rejected", "expired"] as const)("pending -> %s keeps the reason", (status) => {
    const m = applyRowUpdate(addCommand({}, cmd()), { id: "c1", status, error_message: "controller_revoked" });
    expect(m.c1).toMatchObject({ status, error: "controller_revoked" });
  });

  it("may skip executing (a fast desktop's poll sees completed first)", () => {
    const m = applyRowUpdate(addCommand({}, cmd()), { id: "c1", status: "completed", result: { enabled: false } });
    expect(m.c1.status).toBe("completed");
  });

  it.each(TERMINAL)("%s is final: no later update of any status moves it", (terminal) => {
    const start = addCommand({}, cmd({ status: terminal }));
    for (const next of ALL) {
      expect(applyRowUpdate(start, { id: "c1", status: next, error_message: "late" })).toBe(start);
    }
  });

  it("never steps backwards: a late Realtime 'pending' after 'executing' is ignored", () => {
    const start = addCommand({}, cmd({ status: "executing" }));
    expect(applyRowUpdate(start, { id: "c1", status: "pending" })).toBe(start);
  });

  it("ignores unknown ids, unknown statuses, and a no-op repeat (same reference back)", () => {
    const start = addCommand({}, cmd({ status: "executing" }));
    expect(applyRowUpdate(start, { id: "other", status: "completed" })).toBe(start);
    expect(applyRowUpdate(start, { id: "c1", status: "approved" })).toBe(start);
    expect(applyRowUpdate(start, { id: "c1", status: "executing" })).toBe(start);
  });

  it("a non-object result is not taken as the outcome", () => {
    const m = applyRowUpdate(addCommand({}, cmd()), { id: "c1", status: "completed", result: "oops" });
    expect(m.c1.result).toBeNull();
  });
});

describe("web-side expiry and the backstop poll", () => {
  it("a row still pending 15 s after exp is overdue; one second earlier it is not", () => {
    const m = addCommand({}, cmd());
    expect(overdueIds(m, T0 + 60_000 + 14_999)).toEqual([]);
    expect(overdueIds(m, T0 + 60_000 + 15_000)).toEqual(["c1"]);
  });

  it("executing and terminal rows are never expired by the web", () => {
    let m: InflightMap = addCommand({}, cmd({ id: "a", status: "executing" }));
    m = addCommand(m, cmd({ id: "b", status: "completed" }));
    expect(overdueIds(m, T0 + 10 * 60_000)).toEqual([]);
  });

  it("the web's expiry is applied through the same reducer", () => {
    const m = applyRowUpdate(addCommand({}, cmd()), { id: "c1", status: "expired", error_message: "expired: desktop did not pick it up" });
    expect(m.c1.status).toBe("expired");
  });

  it("openIds lists exactly the non-terminal commands", () => {
    let m: InflightMap = {};
    ALL.forEach((status, i) => {
      m = addCommand(m, cmd({ id: `c${i}`, status }));
    });
    expect(openIds(m).sort()).toEqual(["c0", "c1"]);
  });
});

describe("what a persona row shows", () => {
  it("latestForPersona picks the newest command for that persona only", () => {
    let m: InflightMap = addCommand({}, cmd({ id: "old", requestedAt: T0 }));
    m = addCommand(m, cmd({ id: "new", requestedAt: T0 + 5_000 }));
    m = addCommand(m, cmd({ id: "other", personaId: "p2", requestedAt: T0 + 9_000 }));
    expect(latestForPersona(m, "p1")?.id).toBe("new");
    expect(latestForPersona(m, "p3")).toBeNull();
  });

  it("reportedEnabled: a completed pause reads false, a completed resume true, anything else null", () => {
    expect(reportedEnabled(cmd({ status: "completed", result: { enabled: false, changed: true } }))).toBe(false);
    expect(reportedEnabled(cmd({ verb: "resume_persona", status: "completed", result: { enabled: true, changed: false } }))).toBe(true);
    expect(reportedEnabled(cmd({ verb: "resume_persona", status: "completed", result: null }))).toBe(true);
    expect(reportedEnabled(cmd({ status: "executing" }))).toBeNull();
    expect(reportedEnabled(cmd({ verb: "cancel_execution", status: "completed", result: { changed: true } }))).toBeNull();
    expect(reportedEnabled(null)).toBeNull();
  });
});

describe("displayEnabled: reported value first, then the mirror", () => {
  const paused = cmd({ status: "completed", result: { enabled: false, changed: true }, requestedAt: T0 });

  it("shows the reported pause while the synced persona predates the command", () => {
    expect(displayEnabled({ enabled: true, updatedAt: new Date(T0 - 60_000).toISOString() }, paused)).toBe(false);
  });

  it("hands back to the mirror once the persona was written after the command", () => {
    expect(displayEnabled({ enabled: false, updatedAt: new Date(T0 + 3_000).toISOString() }, paused)).toBe(false);
    // The mirror wins even when it disagrees (the desktop is the authority).
    expect(displayEnabled({ enabled: true, updatedAt: new Date(T0 + 3_000).toISOString() }, paused)).toBe(true);
  });

  it("an open or failed command never changes what the row shows", () => {
    const p = { enabled: true, updatedAt: new Date(T0 - 1).toISOString() };
    expect(displayEnabled(p, cmd({ status: "executing" }))).toBe(true);
    expect(displayEnabled(p, cmd({ status: "failed", error: "not_found" }))).toBe(true);
    expect(displayEnabled(p, null)).toBe(true);
  });
});
