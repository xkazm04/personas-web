import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { laneFigures } from "./figures";

const dir = path.resolve(__dirname);
const read = (rel: string) => readFileSync(path.join(dir, rel), "utf8");

describe("laneFigures - what one Performance View lane shows", () => {
  it("reports delivery time as the simulated latency in ms, not a share of a ceiling", () => {
    expect(laneFigures({ queueDepth: 34, latencyMs: 420, eps: 28 }).deliveryMs).toBe(420);
    expect(laneFigures({ queueDepth: 34, latencyMs: 419.6, eps: 28 }).deliveryMs).toBe(420);
  });

  it("keeps latencies above the old 600 ms ceiling distinct (they all used to read 100%)", () => {
    // The mock feed ranges 140-980 ms; the old ratio clamped 600..980 to one value.
    const slow = laneFigures({ queueDepth: 10, latencyMs: 700, eps: 10 }).deliveryMs;
    const slower = laneFigures({ queueDepth: 10, latencyMs: 980, eps: 10 }).deliveryMs;
    expect(slow).toBe(700);
    expect(slower).toBe(980);
  });

  it("sanitises non-finite and negative inputs to 0", () => {
    const f = laneFigures({ queueDepth: Number.NaN, latencyMs: -5, eps: Number.POSITIVE_INFINITY });
    expect(f).toMatchObject({ queueDepth: 0, deliveryMs: 0, eps: 0 });
  });

  it("scales the queue bar to depth, with a visible floor and a full cap", () => {
    expect(laneFigures({ queueDepth: 0, latencyMs: 1, eps: 1 }).queueFillPct).toBe(8);
    expect(laneFigures({ queueDepth: 25, latencyMs: 1, eps: 1 }).queueFillPct).toBe(50);
    expect(laneFigures({ queueDepth: 500, latencyMs: 1, eps: 1 }).queueFillPct).toBe(100);
  });
});

describe("event-bus showcase copy - no internal jargon reaches the visitor", () => {
  it("LanesView derives its figures from laneFigures, not a percentage of a ceiling", () => {
    const src = read("components/LanesView.tsx");
    expect(src).toMatch(/from "\.\.\/figures"/);
    expect(src).not.toMatch(/latencyRatio|\/\s*600\b/);
  });

  it("the panel's info line does not print the telemetry source ('mock' / 'bootstrap')", () => {
    const src = read("index.tsx");
    expect(src).not.toMatch(/\$\{snapshot\.source\}/);
  });
});
