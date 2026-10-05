import { describe, expect, it } from "vitest";
import { gradeOf, judge, successPercent } from "./readings";

describe("mission readings", () => {
  it("passes source states through untouched", () => {
    expect(judge("outcomes", { status: "pending" })).toBe("pending");
    expect(judge("spend", { status: "failed", error: "boom" })).toBe("failed");
    expect(judge("vault", { status: "unmeasured" })).toBe("unmeasured");
  });

  it("judges outcomes on the desktop's 90 / 75 cut-offs", () => {
    const at = (successRate: number | null) =>
      judge("outcomes", { status: "ready", value: { successRate, runs: 10, failed: 1, trace: [] } });
    expect(at(90)).toBe("ok");
    expect(at(89)).toBe("watch");
    expect(at(75)).toBe("watch");
    expect(at(74)).toBe("act");
    expect(at(null)).toBe("unmeasured");
  });

  it("lets a critical agent outrank a degraded one", () => {
    const value = { score: 70, critical: 1, degraded: 3, healthy: 2, trace: [] };
    expect(judge("agents", { status: "ready", value })).toBe("act");
    expect(judge("agents", { status: "ready", value: { ...value, critical: 0 } })).toBe("watch");
  });

  it("hands a non-empty queue to the human, not to an alarm", () => {
    const value = { reviews: 1, alerts: 0, memory: 0, reports: 0, total: 1 };
    expect(judge("queue", { status: "ready", value })).toBe("yours");
    expect(judge("queue", { status: "ready", value: { ...value, reviews: 0, total: 0 } })).toBe("ok");
  });

  it("acts on a paused agent before an open issue", () => {
    expect(judge("recovery", { status: "ready", value: { open: 2, paused: 1, autoFixed: 0 } })).toBe("act");
    expect(judge("recovery", { status: "ready", value: { open: 2, paused: 0, autoFixed: 4 } })).toBe("watch");
  });

  it("computes success over finished runs only", () => {
    expect(successPercent(42, 5)).toBe(89);
    expect(successPercent(0, 0)).toBeNull();
  });

  it("grades agent scores", () => {
    expect(gradeOf(80)).toBe("healthy");
    expect(gradeOf(79)).toBe("degraded");
    expect(gradeOf(59)).toBe("critical");
  });
});
