import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_PERSONAS } from "@/lib/mockData";
import type { CommandRowUpdate } from "./commandReducer";
import { MOCK_TIMINGS, runMockCommand } from "./mockCommandPlane";

const visible = { isHidden: () => false };

describe("mockCommandPlane: the demo's simulated desktop", () => {
  const snapshot = MOCK_PERSONAS.map((p) => ({ ...p }));

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    snapshot.forEach((p, i) => {
      MOCK_PERSONAS[i] = { ...p };
    });
  });

  it("claims at 1.2 s and completes at 2.0 s, writing the pause through to the fixture", () => {
    const target = MOCK_PERSONAS.find((p) => p.enabled)!;
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "c1", verb: "pause_persona", personaId: target.id, params: {} }, (r) => rows.push(r), visible);

    vi.advanceTimersByTime(MOCK_TIMINGS.executingMs - 1);
    expect(rows).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(rows).toEqual([{ id: "c1", status: "executing" }]);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs - MOCK_TIMINGS.executingMs);
    expect(rows[1]).toEqual({ id: "c1", status: "completed", result: { enabled: false, changed: true } });
    expect(MOCK_PERSONAS.find((p) => p.id === target.id)?.enabled).toBe(false);
  });

  it("a repeat pause reports changed:false, and resume reverses it", () => {
    const target = MOCK_PERSONAS.find((p) => !p.enabled)!;
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "a", verb: "pause_persona", personaId: target.id, params: {} }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.at(-1)).toMatchObject({ status: "completed", result: { enabled: false, changed: false } });

    runMockCommand({ id: "b", verb: "resume_persona", personaId: target.id, params: {} }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.at(-1)).toMatchObject({ id: "b", status: "completed", result: { enabled: true, changed: true } });
    expect(MOCK_PERSONAS.find((p) => p.id === target.id)?.enabled).toBe(true);
  });

  it("an unknown persona fails not_found; an unscripted verb is refused", () => {
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "x", verb: "pause_persona", personaId: "nope", params: {} }, (r) => rows.push(r), visible);
    runMockCommand({ id: "y", verb: "chat_send", personaId: MOCK_PERSONAS[0].id, params: {} }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.find((r) => r.id === "x" && r.status !== "executing")).toMatchObject({ status: "failed", error_message: "not_found" });
    expect(rows.find((r) => r.id === "y" && r.status !== "executing")?.status).toBe("rejected");
  });

  it("refuses to start in a hidden tab, and cancel stops the timers", () => {
    expect(() => runMockCommand({ id: "h", verb: "pause_persona", personaId: MOCK_PERSONAS[0].id, params: {} }, () => {}, { isHidden: () => true })).toThrow(/hidden/);
    const rows: CommandRowUpdate[] = [];
    const cancel = runMockCommand({ id: "c", verb: "pause_persona", personaId: MOCK_PERSONAS[0].id, params: {} }, (r) => rows.push(r), visible);
    cancel();
    vi.advanceTimersByTime(10_000);
    expect(rows).toEqual([]);
  });
});
