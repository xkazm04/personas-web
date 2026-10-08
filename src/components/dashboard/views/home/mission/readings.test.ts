import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-error";
import {
  fromSwr,
  gradeOf,
  instrumentsReading,
  isNotServed,
  judge,
  openAlertValue,
  queueReading,
  sourceOf,
  successPercent,
  type SourceState,
} from "./readings";

describe("queueReading", () => {
  const extras = { alerts: 0, memory: 0, reports: 0 };
  const base = { settled: true, listNotServed: false, pendingReviews: 0, extras };

  it("is pending until the review fetch settles", () => {
    expect(queueReading({ ...base, settled: false })).toEqual({ status: "pending" });
    expect(queueReading({ ...base, settled: false, listNotServed: true })).toEqual({ status: "pending" });
  });

  it("is unmeasured when the list is not served, never a ready 0", () => {
    const reading = queueReading({ ...base, listNotServed: true });
    expect(reading).toEqual({ status: "unmeasured" });
    expect(judge("queue", reading)).toBe("unmeasured");
  });

  it("reads a served empty list as ready 0 and judges ok", () => {
    const reading = queueReading(base);
    expect(reading).toEqual({ status: "ready", value: { reviews: 0, alerts: 0, memory: 0, reports: 0, total: 0 } });
    expect(judge("queue", reading)).toBe("ok");
  });

  it("carries the pending count and demo extras into the total", () => {
    expect(queueReading({ ...base, pendingReviews: 3 })).toEqual({
      status: "ready",
      value: { reviews: 3, alerts: 0, memory: 0, reports: 0, total: 3 },
    });
    const demo = queueReading({ ...base, pendingReviews: 2, extras: { alerts: 1, memory: 2, reports: 3 } });
    expect(demo).toEqual({ status: "ready", value: { reviews: 2, alerts: 1, memory: 2, reports: 3, total: 8 } });
    expect(judge("queue", demo)).toBe("yours");
  });
});

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

describe("not-served reads", () => {
  const e501 = new ApiError(501, '{"error":"not_on_desktop"}');
  const e500 = new ApiError(500, "boom");

  it("isNotServed is true only for ApiError 501", () => {
    expect(isNotServed(e501)).toBe(true);
    expect(isNotServed(e500)).toBe(false);
    expect(isNotServed(new Error("x"))).toBe(false);
    expect(isNotServed(undefined)).toBe(false);
  });

  it("fromSwr maps each state", () => {
    const map = (n: number) => n * 2;
    expect(fromSwr(undefined, e501, map)).toEqual({ status: "unmeasured" });
    expect(fromSwr(undefined, e500, map)).toEqual({ status: "failed", error: e500.message });
    expect(fromSwr(undefined, undefined, map)).toEqual({ status: "pending" });
    expect(fromSwr(2, undefined, map)).toEqual({ status: "ready", value: 4 });
  });

  it("openAlertValue is null unless a read succeeded", () => {
    expect(openAlertValue(undefined, false)).toBeNull();
    expect(openAlertValue(undefined, true)).toBeNull();
    expect(openAlertValue([{ status: "open" }, { status: "resolved" }, { status: "open" }], false)).toBe(2);
    expect(openAlertValue([], false)).toBe(0);
  });
});

describe("sourceOf", () => {
  it("reads a 501 as unserved with no error text", () => {
    expect(sourceOf("observability", false, new ApiError(501, "not on desktop"))).toEqual({
      key: "observability",
      status: "unserved",
      error: null,
    });
  });

  it("reads any other error as failed with its message", () => {
    expect(sourceOf("healing", false, new ApiError(500, "boom"))).toMatchObject({ status: "failed", error: expect.stringContaining("boom") });
  });

  it("is ok when settled and pending when not", () => {
    expect(sourceOf("routines", true, undefined)).toEqual({ key: "routines", status: "ok", error: null });
    expect(sourceOf("routines", false, undefined)).toEqual({ key: "routines", status: "pending", error: null });
  });
});

describe("instrumentsReading", () => {
  const src = (...statuses: SourceState["status"][]): SourceState[] =>
    statuses.map((status, i) => ({
      key: (["observability", "healing", "reviews", "routines"] as const)[i],
      status,
      error: null,
    }));

  it("is pending while any source is pending", () => {
    expect(instrumentsReading(src("ok", "pending", "ok", "unserved"))).toEqual({ status: "pending" });
  });

  it("counts every source when all are served", () => {
    expect(instrumentsReading(src("ok", "ok", "ok", "ok"))).toEqual({ status: "ready", value: { ok: 4, total: 4 } });
    expect(instrumentsReading(src("ok", "ok", "ok", "failed"))).toEqual({ status: "ready", value: { ok: 3, total: 4 } });
  });

  it("leaves unserved sources out of ok and total", () => {
    expect(instrumentsReading(src("ok", "unserved", "ok", "unserved"))).toEqual({
      status: "ready",
      value: { ok: 2, total: 2 },
    });
  });

  it("is unmeasured when no source is served", () => {
    expect(instrumentsReading(src("unserved", "unserved", "unserved", "unserved"))).toEqual({ status: "unmeasured" });
  });
});
