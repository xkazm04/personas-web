import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const count = vi.fn();
const distribution = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  metrics: {
    count: (...a: unknown[]) => count(...a),
    distribution: (...a: unknown[]) => distribution(...a),
  },
}));

const { trackWebVital, flushAnalyticsQueue } = await import("./analytics");

function consent(value: string | null) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", { getItem: () => value });
}

describe("trackWebVital", () => {
  beforeEach(() => {
    count.mockClear();
    distribution.mockClear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("with consent, records a route-tagged distribution in milliseconds", () => {
    consent("all");
    trackWebVital("INP", 180, "/features");
    expect(distribution).toHaveBeenCalledWith("web_vital.inp", 180, {
      unit: "millisecond",
      attributes: { route: "/features" },
    });
  });

  it("CLS is unitless", () => {
    consent("all");
    trackWebVital("CLS", 0.05, "/");
    expect(distribution).toHaveBeenCalledWith("web_vital.cls", 0.05, { unit: "none", attributes: { route: "/" } });
  });

  it("without consent nothing is sent; granting consent flushes it", () => {
    consent(null);
    trackWebVital("LCP", 2100, "/athena");
    expect(distribution).not.toHaveBeenCalled();
    consent("all");
    flushAnalyticsQueue();
    expect(distribution).toHaveBeenCalledWith("web_vital.lcp", 2100, {
      unit: "millisecond",
      attributes: { route: "/athena" },
    });
  });

  it("ignores non-finite values and never throws when the metrics API is missing", () => {
    consent("all");
    trackWebVital("LCP", Number.NaN, "/");
    expect(distribution).not.toHaveBeenCalled();
    distribution.mockImplementationOnce(() => {
      throw new Error("no metrics");
    });
    expect(() => trackWebVital("LCP", 1, "/")).not.toThrow();
  });
});
