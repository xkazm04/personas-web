import { describe, expect, it, vi } from "vitest";

import { MOCK_KNOWLEDGE_PATTERNS } from "./mock-dashboard-data";
import { MOCK_EXECUTIONS, MOCK_PERSONAS, getMockExecutionDetail } from "./mockData";
import { mockApi } from "./mockApi";
import { ApiError } from "./api-error";

/**
 * Honest provenance (tiger D1): an evidence chip opens the run it names, so
 * that run must exist, belong to the pattern's own agent, and an id the demo
 * does not hold must read as unavailable, never as a run that "completed".
 */
describe("knowledge pattern provenance", () => {
  const cited = MOCK_KNOWLEDGE_PATTERNS.filter((p) => p.lastExecutionId);

  it("cites at least the three seeded runs", () => {
    expect(cited.map((p) => p.id)).toEqual(expect.arrayContaining(["kp_1", "kp_2", "kp_3"]));
  });

  it.each(cited.map((p) => [p.id, p] as const))("%s cites a run its own persona owns", (_, pattern) => {
    const run = MOCK_EXECUTIONS.find((e) => e.id === pattern.lastExecutionId);
    expect(run, `${pattern.id} -> ${pattern.lastExecutionId}`).toBeDefined();
    const owner = MOCK_PERSONAS.find((p) => p.id === run!.personaId);
    expect(owner?.name).toBe(pattern.personaName);
  });

  it("the failure pattern cites a failed run whose error is the one it describes", () => {
    const kp2 = MOCK_KNOWLEDGE_PATTERNS.find((p) => p.id === "kp_2")!;
    const run = MOCK_EXECUTIONS.find((e) => e.id === kp2.lastExecutionId)!;
    expect(run.status).toBe("failed");
    expect(run.errorMessage).toMatch(/context window/i);
    expect(kp2.description).toMatch(/context window/i);
  });
});

describe("an execution id the demo does not hold", () => {
  it("getMockExecutionDetail reports it unavailable, with no status", () => {
    expect(getMockExecutionDetail("nope")).toEqual({ executionId: "nope", unavailable: true });
  });

  it("a held id still reports its own status", () => {
    const detail = getMockExecutionDetail("e-0004-mock");
    expect(detail).toMatchObject({ executionId: "e-0004-mock", status: "failed" });
    expect("unavailable" in detail).toBe(false);
  });

  it("mockApi.getExecution answers 404 like the real planes, never 'completed'", async () => {
    vi.useFakeTimers();
    try {
      const read = mockApi.getExecution("nope");
      const settled = read.then(
        () => null,
        (err: unknown) => err,
      );
      await vi.advanceTimersByTimeAsync(250);
      const err = await settled;
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    } finally {
      vi.useRealTimers();
    }
  });
});
