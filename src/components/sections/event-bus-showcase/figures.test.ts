import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dir = path.resolve(__dirname);
const read = (rel: string) => readFileSync(path.join(dir, rel), "utf8");

describe("event-bus showcase copy - no internal jargon reaches the visitor", () => {
  it("the panel's info line does not print the telemetry source ('mock' / 'bootstrap')", () => {
    const src = read("index.tsx");
    expect(src).not.toMatch(/\$\{snapshot\.source\}/);
  });
});
