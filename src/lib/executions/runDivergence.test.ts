import { describe, expect, it } from "vitest";

import { MOCK_EXECUTIONS } from "@/lib/mockData";
import type { PersonaExecution } from "@/lib/types";

import { compareRuns, firstDivergence, pickBaseline } from "./runDivergence";

const mk = (over: Partial<PersonaExecution>): PersonaExecution => ({
  ...MOCK_EXECUTIONS[1],
  triggerId: null,
  useCaseId: null,
  retryOfExecutionId: null,
  ...over,
});

describe("pickBaseline over the mock runs", () => {
  it("failed PR Review run falls back to the persona's last completed run", () => {
    const failed = MOCK_EXECUTIONS.find((r) => r.status === "failed")!;
    const pick = pickBaseline(failed, MOCK_EXECUTIONS)!;
    expect(pick.reason).toBe("persona-last-completed");
    expect(pick.baseline.personaId).toBe(failed.personaId);
    expect(pick.baseline.status).toBe("completed");
    expect(pick.baseline.durationMs).toBe(28900);
    expect(pick.caveat).toBeNull();
  });

  it("same-trigger pair prefers the trigger sibling", () => {
    const run = MOCK_EXECUTIONS.find((r) => r.durationMs === 17400)!;
    const pick = pickBaseline(run, MOCK_EXECUTIONS)!;
    expect(pick.reason).toBe("same-trigger");
    expect(pick.baseline.triggerId).toBe(run.triggerId);
  });

  it("cancelled run gets a baseline but is flagged not-failed", () => {
    const cancelled = MOCK_EXECUTIONS.find((r) => r.status === "cancelled")!;
    const pick = pickBaseline(cancelled, MOCK_EXECUTIONS)!;
    expect(pick.caveat).toBe("not-failed");
  });

  it("never picks another persona's run", () => {
    for (const run of MOCK_EXECUTIONS) {
      const pick = pickBaseline(run, MOCK_EXECUTIONS);
      if (pick) expect(pick.baseline.personaId).toBe(run.personaId);
    }
  });
});

describe("pickBaseline lineage", () => {
  it("walks the retry chain past failed ancestors", () => {
    const good = mk({ id: "g", status: "completed", createdAt: "2026-01-01T00:00:00Z", startedAt: null });
    const bad1 = mk({ id: "f1", status: "failed", retryOfExecutionId: "g", createdAt: "2026-01-02T00:00:00Z", startedAt: null });
    const bad2 = mk({ id: "f2", status: "failed", retryOfExecutionId: "f1", createdAt: "2026-01-03T00:00:00Z", startedAt: null });
    const pick = pickBaseline(bad2, [good, bad1, bad2])!;
    expect(pick.reason).toBe("retry-parent");
    expect(pick.baseline.id).toBe("g");
  });

  it("survives a retry cycle", () => {
    const a = mk({ id: "a", status: "failed", retryOfExecutionId: "b" });
    const b = mk({ id: "b", status: "failed", retryOfExecutionId: "a" });
    expect(pickBaseline(a, [a, b])).toBeNull();
  });

  it("does not use runs newer than the failure", () => {
    const failed = mk({ id: "f", status: "failed", createdAt: "2026-01-02T00:00:00Z", startedAt: null });
    const later = mk({ id: "l", status: "completed", createdAt: "2026-01-05T00:00:00Z", startedAt: null });
    expect(pickBaseline(failed, [failed, later])).toBeNull();
  });
});

describe("compareRuns", () => {
  it("reports deltas, ratios and model change", () => {
    const failed = MOCK_EXECUTIONS.find((r) => r.status === "failed")!;
    const good = MOCK_EXECUTIONS.find((r) => r.durationMs === 28900)!;
    const c = compareRuns(failed, good);
    expect(c.durationMs).toMatchObject({ a: 3400, b: 28900 });
    expect(c.inputTokens.diff).toBe(failed.inputTokens - good.inputTokens);
    expect(c.model.changed).toBe(false);
  });

  it("returns null duration while a run is unfinished and null ratio for zero", () => {
    const running = mk({ durationMs: null, inputTokens: 5 });
    const zero = mk({ inputTokens: 0 });
    const c = compareRuns(running, zero);
    expect(c.durationMs).toBeNull();
    expect(c.inputTokens.ratio).toBeNull();
  });
});

describe("firstDivergence", () => {
  it("is null for identical or both-empty outputs", () => {
    expect(firstDivergence("a\nb", "a\nb")).toBeNull();
    expect(firstDivergence(null, "")).toBeNull();
  });
  it("finds the first differing line", () => {
    expect(firstDivergence("a\nb\nc", "a\nX\nc")).toEqual({ line: 2, a: "b", b: "X" });
  });
  it("handles one side ending early and CRLF", () => {
    expect(firstDivergence("a\r\nb", "a")).toEqual({ line: 2, a: "b", b: null });
  });
});
