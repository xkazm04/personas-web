import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import type { CommandRowUpdate } from "./commandReducer";
import { MOCK_RUN_TIMINGS, MOCK_TIMINGS, mockRunExecutionId, runMockCommand } from "./mockCommandPlane";

const visible = { isHidden: () => false };

describe("mockCommandPlane: the demo's simulated desktop", () => {
  const snapshot = MOCK_PERSONAS.map((p) => ({ ...p }));
  const execSnapshot = MOCK_EXECUTIONS.map((e) => ({ ...e }));

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    snapshot.forEach((p, i) => {
      MOCK_PERSONAS[i] = { ...p };
    });
    MOCK_EXECUTIONS.splice(0, MOCK_EXECUTIONS.length, ...execSnapshot.map((e) => ({ ...e })));
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

  it("run: completes at 2 s with the new execution's id, which goes queued -> running -> completed over 8 s", () => {
    const persona = MOCK_PERSONAS[2];
    const rows: CommandRowUpdate[] = [];
    let changes = 0;
    const statusOf = () => MOCK_EXECUTIONS.find((e) => e.id === mockRunExecutionId("r1"))?.status;
    runMockCommand(
      { id: "r1", verb: "run_persona", personaId: persona.id, params: { prompt: "summarize" } },
      (r) => rows.push(r),
      { ...visible, onFixtureChange: () => changes++ },
    );

    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs - 1);
    expect(statusOf()).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(rows.at(-1)).toEqual({ id: "r1", status: "completed", result: { executionId: "exec-r1" } });
    const created = MOCK_EXECUTIONS[0];
    expect(created).toMatchObject({ id: "exec-r1", personaId: persona.id, status: "queued", inputData: "summarize", personaName: persona.name });
    expect(changes).toBe(1);

    vi.advanceTimersByTime(MOCK_RUN_TIMINGS.runningMs);
    expect(statusOf()).toBe("running");
    expect(changes).toBe(2);
    vi.advanceTimersByTime(MOCK_RUN_TIMINGS.completedMs - MOCK_RUN_TIMINGS.runningMs - 1);
    expect(statusOf()).toBe("running");
    vi.advanceTimersByTime(1);
    expect(MOCK_EXECUTIONS[0]).toMatchObject({ status: "completed", costUsd: expect.any(Number) });
    expect(MOCK_EXECUTIONS[0].durationMs).toBe(MOCK_RUN_TIMINGS.completedMs - MOCK_RUN_TIMINGS.runningMs);
    expect(changes).toBe(3);
  });

  it("cancel: same timings; a running execution becomes cancelled, a finished one reports changed:false", () => {
    const live = MOCK_EXECUTIONS.find((e) => e.status === "running")!;
    const done = MOCK_EXECUTIONS.find((e) => e.status === "completed")!;
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "k1", verb: "cancel_execution", personaId: live.personaId, params: { executionId: live.id } }, (r) => rows.push(r), visible);
    runMockCommand({ id: "k2", verb: "cancel_execution", personaId: done.personaId, params: { executionId: done.id } }, (r) => rows.push(r), visible);

    vi.advanceTimersByTime(MOCK_TIMINGS.executingMs);
    expect(rows.map((r) => r.status)).toEqual(["executing", "executing"]);
    expect(MOCK_EXECUTIONS.find((e) => e.id === live.id)?.status).toBe("running");
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs - MOCK_TIMINGS.executingMs);
    expect(rows.find((r) => r.id === "k1" && r.status === "completed")?.result).toEqual({ executionId: live.id, changed: true, wasQueued: false });
    expect(rows.find((r) => r.id === "k2" && r.status === "completed")?.result).toEqual({ executionId: done.id, changed: false, wasQueued: false });
    expect(MOCK_EXECUTIONS.find((e) => e.id === live.id)?.status).toBe("cancelled");
    expect(MOCK_EXECUTIONS.find((e) => e.id === done.id)?.status).toBe("completed");
  });

  it("cancel during a run: the run's execution stays cancelled when its own timers fire", () => {
    const persona = MOCK_PERSONAS[2];
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "r2", verb: "run_persona", personaId: persona.id, params: { prompt: "go" } }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs + MOCK_RUN_TIMINGS.runningMs);
    const executionId = mockRunExecutionId("r2");
    runMockCommand({ id: "k3", verb: "cancel_execution", personaId: persona.id, params: { executionId } }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.at(-1)).toMatchObject({ id: "k3", status: "completed", result: { changed: true } });
    vi.advanceTimersByTime(MOCK_RUN_TIMINGS.completedMs);
    expect(MOCK_EXECUTIONS.find((e) => e.id === executionId)?.status).toBe("cancelled");
  });

  it("cancel refuses another persona's execution (the desktop's owner check) and an unknown one", () => {
    const exec = MOCK_EXECUTIONS[0];
    const other = MOCK_PERSONAS.find((p) => p.id !== exec.personaId)!;
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "o", verb: "cancel_execution", personaId: other.id, params: { executionId: exec.id } }, (r) => rows.push(r), visible);
    runMockCommand({ id: "u", verb: "cancel_execution", personaId: other.id, params: { executionId: "nope" } }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.find((r) => r.id === "o" && r.status === "failed")?.error_message).toMatch(/^forbidden/);
    expect(rows.find((r) => r.id === "u" && r.status === "failed")?.error_message).toMatch(/^not_found/);
    expect(MOCK_EXECUTIONS[0].status).toBe(exec.status);
  });

  it("cancelling a run command stops its execution's lifecycle too", () => {
    const rows: CommandRowUpdate[] = [];
    const stop = runMockCommand({ id: "r3", verb: "run_persona", personaId: MOCK_PERSONAS[0].id, params: { prompt: "x" } }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    stop();
    vi.advanceTimersByTime(MOCK_RUN_TIMINGS.completedMs);
    expect(MOCK_EXECUTIONS.find((e) => e.id === mockRunExecutionId("r3"))?.status).toBe("queued");
  });
});
