import { describe, it, expect } from "vitest";
import type { SLATarget } from "@/lib/mock-dashboard-data";
import { complianceBand, formatValue, formatTarget, formatAbsolute } from "./slaFormat";

const target = (over: Partial<SLATarget>) =>
  ({ unit: "%", current: 99, target: 95, ...over }) as unknown as SLATarget;

describe("complianceBand boundaries", () => {
  it("maps the exact band thresholds (0.995 / 0.98 / 0.95) inclusively", () => {
    expect(complianceBand(0.995).text).toBe("text-emerald-400");
    expect(complianceBand(0.98).text).toBe("text-cyan-400");
    expect(complianceBand(0.95).text).toBe("text-amber-400");
    expect(complianceBand(0.9499).text).toBe("text-rose-400");
    expect(complianceBand(0).text).toBe("text-rose-400");
  });
});

describe("formatValue / formatTarget", () => {
  it("renders ms under/over 1000 as ms/s", () => {
    expect(formatValue(target({ unit: "ms", current: 850 }))).toBe("850ms");
    expect(formatValue(target({ unit: "ms", current: 1500 }))).toBe("1.5s");
    expect(formatTarget(target({ unit: "ms", target: 2000 }))).toBe("2s");
  });

  it("renders percentage values with scale-aware precision", () => {
    expect(formatValue(target({ unit: "%", current: 99.4 }))).toBe("99.40%");
    expect(formatValue(target({ unit: "%", current: 100 }))).toBe("100.0%");
  });
});

describe("formatAbsolute", () => {
  it("returns '-' for an invalid iso instead of 'Invalid Date'", () => {
    expect(formatAbsolute("nope")).toBe("-");
    expect(formatAbsolute("")).toBe("-");
  });

  it("formats a valid iso deterministically (no current-time dependency)", () => {
    expect(formatAbsolute("2026-03-15T12:00:00Z")).toContain("Mar");
  });
});
