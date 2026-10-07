import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import { MOCK_CHAT_MESSAGES, MOCK_CHAT_SESSIONS } from "@/lib/mock-dashboard-data";
import type { PersonaEvent } from "@/lib/types";
import type { CommandRowUpdate } from "./commandReducer";
import {
  MOCK_CHAT_TIMINGS,
  MOCK_RUN_TIMINGS,
  MOCK_TIMINGS,
  mockChatIds,
  mockRunExecutionId,
  runMockCommand,
} from "./mockCommandPlane";

const visible = { isHidden: () => false };

describe("mockCommandPlane: the demo's simulated desktop", () => {
  const snapshot = MOCK_PERSONAS.map((p) => ({ ...p }));
  const execSnapshot = MOCK_EXECUTIONS.map((e) => ({ ...e }));
  const sessionSnapshot = MOCK_CHAT_SESSIONS.map((s) => ({ ...s }));
  const messageSnapshot = MOCK_CHAT_MESSAGES.map((m) => ({ ...m }));

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    snapshot.forEach((p, i) => {
      MOCK_PERSONAS[i] = { ...p };
    });
    MOCK_EXECUTIONS.splice(0, MOCK_EXECUTIONS.length, ...execSnapshot.map((e) => ({ ...e })));
    MOCK_CHAT_SESSIONS.splice(0, MOCK_CHAT_SESSIONS.length, ...sessionSnapshot.map((x) => ({ ...x })));
    MOCK_CHAT_MESSAGES.splice(0, MOCK_CHAT_MESSAGES.length, ...messageSnapshot.map((m) => ({ ...m })));
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

  it("an unknown persona fails not_found", () => {
    const rows: CommandRowUpdate[] = [];
    runMockCommand({ id: "x", verb: "pause_persona", personaId: "nope", params: {} }, (r) => rows.push(r), visible);
    vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
    expect(rows.find((r) => r.id === "x" && r.status !== "executing")).toMatchObject({ status: "failed", error_message: "not_found" });
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

  describe("chat_send", () => {
    const outcome = (rows: CommandRowUpdate[], id: string) => rows.find((r) => r.id === id && r.status !== "executing");

    it("Athena, in an existing thread: completes at 2 s with the user message written, the reply about 4 s after the send", () => {
      const rows: CommandRowUpdate[] = [];
      const changes = vi.fn();
      const before = MOCK_CHAT_MESSAGES.length;
      runMockCommand(
        { id: "ch1", verb: "chat_send", personaId: "athena", params: { sessionId: "default", message: " How was the night? " } },
        (r) => rows.push(r),
        { ...visible, onFixtureChange: changes },
      );
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      const ids = mockChatIds("ch1");
      expect(outcome(rows, "ch1")).toEqual({ id: "ch1", status: "completed", result: { sessionId: "default", userMessageId: ids.userMessageId } });
      const user = MOCK_CHAT_MESSAGES.find((m) => m.id === ids.userMessageId)!;
      expect(user).toMatchObject({ role: "user", content: "How was the night?", threadKind: "athena", personaId: "athena", sessionId: "default" });
      expect(MOCK_CHAT_MESSAGES).toHaveLength(before + 1);
      expect(changes).toHaveBeenCalled();

      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.replyMs - 1);
      expect(MOCK_CHAT_MESSAGES.some((m) => m.id === ids.replyId)).toBe(false);
      vi.advanceTimersByTime(1);
      const reply = MOCK_CHAT_MESSAGES.find((m) => m.id === ids.replyId)!;
      expect(reply).toMatchObject({ role: "assistant", sessionId: "default", executionId: null });
      expect(reply.content).toContain("How was the night?");
      expect(MOCK_TIMINGS.completedMs + MOCK_CHAT_TIMINGS.replyMs).toBe(4000);
    });

    it("a new thread (sessionId null) is created and named by the result", () => {
      const rows: CommandRowUpdate[] = [];
      runMockCommand({ id: "ch2", verb: "chat_send", personaId: "athena", params: { sessionId: null, message: "Plan my Friday" } }, (r) => rows.push(r), visible);
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      const ids = mockChatIds("ch2");
      expect(outcome(rows, "ch2")?.result).toMatchObject({ sessionId: ids.sessionId });
      expect(MOCK_CHAT_SESSIONS.find((s) => s.sessionId === ids.sessionId)).toMatchObject({ threadKind: "athena", title: "Plan my Friday" });
    });

    it("persona chat: a run goes queued -> running -> completed, and the reply carries its executionId", () => {
      const persona = MOCK_PERSONAS.find((p) => p.enabled)!;
      const rows: CommandRowUpdate[] = [];
      runMockCommand({ id: "ch3", verb: "chat_send", personaId: persona.id, params: { sessionId: null, message: "Status?" } }, (r) => rows.push(r), visible);
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      const ids = mockChatIds("ch3");
      expect(outcome(rows, "ch3")?.result).toEqual({ sessionId: ids.sessionId, userMessageId: ids.userMessageId, executionId: ids.executionId });
      const run = () => MOCK_EXECUTIONS.find((e) => e.id === ids.executionId)?.status;
      expect(run()).toBe("queued");
      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.runningMs);
      expect(run()).toBe("running");
      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.runCompletedMs - MOCK_CHAT_TIMINGS.runningMs);
      expect(run()).toBe("completed");
      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.replyMs - MOCK_CHAT_TIMINGS.runCompletedMs);
      expect(MOCK_CHAT_MESSAGES.find((m) => m.id === ids.replyId)).toMatchObject({ role: "assistant", executionId: ids.executionId, personaId: persona.id });
    });

    it("refuses like the desktop: empty, over 8 KB, an unknown thread, an unknown persona", () => {
      const rows: CommandRowUpdate[] = [];
      const send = (id: string, personaId: string, params: Record<string, unknown>) =>
        runMockCommand({ id, verb: "chat_send", personaId, params }, (r) => rows.push(r), visible);
      send("e1", "athena", { sessionId: null, message: "   " });
      send("e2", "athena", { sessionId: null, message: "a".repeat(8193) });
      send("e3", "athena", { sessionId: "no-such-thread", message: "hi" });
      send("e5", "nope", { sessionId: null, message: "hi" });
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      expect(outcome(rows, "e1")?.error_message).toBe("empty_message");
      expect(outcome(rows, "e2")?.error_message).toBe("message_too_long");
      expect(outcome(rows, "e3")?.error_message).toMatch(/^not_found/);
      expect(outcome(rows, "e5")?.error_message).toMatch(/^not_found/);
      expect(rows.filter((r) => r.status === "failed")).toHaveLength(4);
    });

    it("a paused persona still chats (PLAN M21): the turn starts, and the reply arrives", () => {
      const paused = MOCK_PERSONAS.find((p) => !p.enabled)!;
      const rows: CommandRowUpdate[] = [];
      runMockCommand({ id: "pz1", verb: "chat_send", personaId: paused.id, params: { sessionId: null, message: "Still there?" } }, (r) => rows.push(r), visible);
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      const ids = mockChatIds("pz1");
      expect(outcome(rows, "pz1")).toMatchObject({ status: "completed", result: { executionId: ids.executionId } });
      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.replyMs);
      expect(MOCK_CHAT_MESSAGES.find((m) => m.id === ids.replyId)).toMatchObject({ role: "assistant", personaId: paused.id });
      // Pause is untouched: the persona stays paused.
      expect(MOCK_PERSONAS.find((p) => p.id === paused.id)?.enabled).toBe(false);
    });

    it("cancelling the command before the reply stops the reply", () => {
      const stop = runMockCommand({ id: "ch4", verb: "chat_send", personaId: "athena", params: { sessionId: "default", message: "x" } }, () => {}, visible);
      vi.advanceTimersByTime(MOCK_TIMINGS.completedMs);
      stop();
      vi.advanceTimersByTime(MOCK_CHAT_TIMINGS.replyMs);
      expect(MOCK_CHAT_MESSAGES.some((m) => m.id === mockChatIds("ch4").replyId)).toBe(false);
    });
  });

  describe("review_decide (M20): the verdict goes through the api, like the desktop's decision", () => {
    type Ev = PersonaEvent;
    const outcome = (rows: CommandRowUpdate[], id: string) => rows.find((r) => r.id === id && r.status !== "executing");
    const review = (id: string, personaId: string, status: Ev["status"] = "pending"): Ev => ({
      id,
      projectId: "p",
      eventType: "manual_review",
      sourceType: "execution",
      sourceId: null,
      targetPersonaId: personaId,
      payload: "{}",
      status,
      errorMessage: null,
      processedAt: null,
      useCaseId: null,
      createdAt: "2026-10-07T08:00:00.000Z",
    });
    const plane = (events: Ev[]) => {
      const update = vi.fn(async (id: string, body: { status: Ev["status"]; metadata?: string }) => ({ ...events.find((e) => e.id === id)!, status: body.status }));
      return { update, deps: { ...visible, reviews: { list: async () => events, update } } };
    };

    it("claims at 1.2 s, applies the verdict with its notes at 2 s, and completes with the contract's result", async () => {
      const { update, deps } = plane([review("r1", "p1")]);
      const rows: CommandRowUpdate[] = [];
      runMockCommand(
        { id: "rd1", verb: "review_decide", personaId: "p1", params: { reviewId: "r1", decision: "rejected", notes: "not yet" } },
        (r) => rows.push(r),
        deps,
      );
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.executingMs);
      expect(rows).toEqual([{ id: "rd1", status: "executing" }]);
      expect(update).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs - MOCK_TIMINGS.executingMs);
      expect(update).toHaveBeenCalledWith("r1", { status: "failed", metadata: JSON.stringify({ reviewerNotes: "not yet" }) });
      expect(outcome(rows, "rd1")).toEqual({ id: "rd1", status: "completed", result: { reviewId: "r1", status: "rejected", changed: true } });
    });

    it("an approve with no notes writes only the status", async () => {
      const { update, deps } = plane([review("r1", "p1")]);
      runMockCommand({ id: "rd2", verb: "review_decide", personaId: "p1", params: { reviewId: "r1", decision: "approved", notes: null } }, () => {}, deps);
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
      expect(update).toHaveBeenCalledWith("r1", { status: "processed" });
    });

    it("refuses like the desktop: an unknown review, another persona's review (never a hint it exists), a bad decision", async () => {
      const { update, deps } = plane([review("r1", "p1")]);
      const rows: CommandRowUpdate[] = [];
      const send = (id: string, personaId: string, params: Record<string, unknown>) =>
        runMockCommand({ id, verb: "review_decide", personaId, params }, (r) => rows.push(r), deps);
      send("x1", "p1", { reviewId: "nope", decision: "approved", notes: null });
      send("x2", "p2", { reviewId: "r1", decision: "approved", notes: null });
      send("x3", "p1", { reviewId: "r1", decision: "maybe", notes: null });
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
      expect(outcome(rows, "x1")).toMatchObject({ status: "failed", error_message: "not_found" });
      expect(outcome(rows, "x2")).toMatchObject({ status: "failed", error_message: "not_found" });
      expect(outcome(rows, "x3")).toMatchObject({ status: "failed", error_message: "invalid_decision" });
      expect(update).not.toHaveBeenCalled();
    });

    it("an already decided review completes unchanged, reporting its current status", async () => {
      const { update, deps } = plane([review("r1", "p1", "processed")]);
      const rows: CommandRowUpdate[] = [];
      runMockCommand({ id: "rd3", verb: "review_decide", personaId: "p1", params: { reviewId: "r1", decision: "rejected", notes: null } }, (r) => rows.push(r), deps);
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
      expect(outcome(rows, "rd3")).toEqual({ id: "rd3", status: "completed", result: { reviewId: "r1", status: "approved", changed: false } });
      expect(update).not.toHaveBeenCalled();
    });

    it("cancelling before the answer writes nothing", async () => {
      const { update, deps } = plane([review("r1", "p1")]);
      const rows: CommandRowUpdate[] = [];
      const stop = runMockCommand({ id: "rd4", verb: "review_decide", personaId: "p1", params: { reviewId: "r1", decision: "approved", notes: null } }, (r) => rows.push(r), deps);
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.executingMs);
      stop();
      await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
      expect(update).not.toHaveBeenCalled();
      expect(outcome(rows, "rd4")).toBeUndefined();
    });
  });
});
