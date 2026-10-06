import { describe, expect, it } from "vitest";
import type { PersonaExecution } from "@/lib/types";
import type { InflightCommand } from "./commandReducer";
import {
  EXECUTION_REREAD_WINDOW_MS,
  RUN_PROMPT_MAX,
  isBeyondSyncWindow,
  cancelParams,
  derivePersonaRow,
  personaRuns,
  reportedCancelledId,
  runParams,
} from "./personaRow";

function run(id: string, status: PersonaExecution["status"], minutesAgo: number, personaId = "p1"): PersonaExecution {
  return {
    id,
    personaId,
    triggerId: null,
    useCaseId: null,
    status,
    inputData: null,
    outputData: null,
    claudeSessionId: null,
    modelUsed: null,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    errorMessage: null,
    durationMs: null,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(Date.UTC(2026, 9, 6, 12, 0) - minutesAgo * 60_000).toISOString(),
  };
}

function cmd(over: Partial<InflightCommand>): InflightCommand {
  return {
    id: "c1",
    verb: "cancel_execution",
    personaId: "p1",
    status: "completed",
    result: { executionId: "e1", changed: true, wasQueued: false },
    error: null,
    requestedAt: 0,
    expiresAt: 60_000,
    ...over,
  };
}

describe("personaRuns", () => {
  it("keeps one persona's runs, newest first, capped", () => {
    const all = [run("old", "completed", 30), run("other", "running", 1, "p2"), run("new", "failed", 5), run("mid", "completed", 10)];
    expect(personaRuns(all, "p1").map((e) => e.id)).toEqual(["new", "mid", "old"]);
    expect(personaRuns(all, "p1", 2).map((e) => e.id)).toEqual(["new", "mid"]);
  });
});

describe("derivePersonaRow: the row state", () => {
  it("idle with no runs, or when the newest finished run succeeded", () => {
    expect(derivePersonaRow({ enabled: true, runs: [] })).toEqual({ state: "idle", liveExecutionId: null });
    expect(derivePersonaRow({ enabled: true, runs: [run("a", "completed", 1), run("b", "failed", 9)] }).state).toBe("idle");
  });

  it("running when a run is queued or running, and Cancel targets the newest live one", () => {
    expect(derivePersonaRow({ enabled: true, runs: [run("q", "queued", 1), run("r", "running", 2)] })).toEqual({
      state: "running",
      liveExecutionId: "q",
    });
    expect(derivePersonaRow({ enabled: true, runs: [run("r", "running", 1), run("f", "failed", 2)] }).state).toBe("running");
  });

  it("failed when the newest finished run failed and nothing is live", () => {
    expect(derivePersonaRow({ enabled: true, runs: [run("f", "failed", 1), run("c", "completed", 5)] }).state).toBe("failed");
    // A cancelled run is not a failure.
    expect(derivePersonaRow({ enabled: true, runs: [run("x", "cancelled", 1), run("f", "failed", 5)] }).state).toBe("idle");
  });

  it("paused wins, and still reports a run pause did not stop", () => {
    expect(derivePersonaRow({ enabled: false, runs: [run("r", "running", 1)] })).toEqual({ state: "paused", liveExecutionId: "r" });
    expect(derivePersonaRow({ enabled: false, runs: [run("f", "failed", 1)] }).state).toBe("paused");
  });

  it("a completed cancel stops the run showing as live before the mirror catches up", () => {
    const runs = [run("e1", "running", 1), run("f", "failed", 5)];
    expect(derivePersonaRow({ enabled: true, runs, cancelledId: "e1" })).toEqual({ state: "idle", liveExecutionId: null });
    const two = [run("e1", "running", 1), run("e0", "queued", 2)];
    expect(derivePersonaRow({ enabled: true, runs: two, cancelledId: "e1" })).toEqual({ state: "running", liveExecutionId: "e0" });
  });
});

describe("reportedCancelledId", () => {
  it("reads the execution a completed cancel stopped, and nothing else", () => {
    expect(reportedCancelledId(cmd({}))).toBe("e1");
    expect(reportedCancelledId(cmd({ status: "executing" }))).toBeNull();
    expect(reportedCancelledId(cmd({ verb: "pause_persona", result: { enabled: false } }))).toBeNull();
    expect(reportedCancelledId(cmd({ result: {} }))).toBeNull();
    expect(reportedCancelledId(null)).toBeNull();
  });
});

describe("params shaping (spec 2.2)", () => {
  it("run_persona carries the trimmed prompt; empty or over-long is refused", () => {
    expect(runParams("  summarize the inbox \n")).toEqual({ prompt: "summarize the inbox" });
    expect(runParams("   ")).toBeNull();
    expect(runParams("x".repeat(RUN_PROMPT_MAX))).toEqual({ prompt: "x".repeat(RUN_PROMPT_MAX) });
    expect(runParams("x".repeat(RUN_PROMPT_MAX + 1))).toBeNull();
  });

  it("cancel_execution carries the execution id", () => {
    expect(cancelParams("e-42")).toEqual({ executionId: "e-42" });
  });
});

describe("isBeyondSyncWindow (spec 1.2 known edge)", () => {
  it("flags a run created more than 24 h ago, and nothing unparseable", () => {
    const now = Date.UTC(2026, 9, 6, 12, 0);
    const at = (ms: number) => ({ createdAt: new Date(ms).toISOString() });
    expect(isBeyondSyncWindow(at(now - EXECUTION_REREAD_WINDOW_MS), now)).toBe(false);
    expect(isBeyondSyncWindow(at(now - EXECUTION_REREAD_WINDOW_MS - 1), now)).toBe(true);
    expect(isBeyondSyncWindow({ createdAt: "not a date" }, now)).toBe(false);
  });
});
