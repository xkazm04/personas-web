import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { redactText } from "./redactText";

/**
 * The shared cases (fixtures/redact-text-v2.json, copied byte for byte from
 * personas): the phone must mask exactly as the desk's `redact_text` does.
 */
interface Fixture {
  version: number;
  cases: { name: string; input: string; expected: string }[];
}

const raw = readFileSync(join(process.cwd(), "fixtures", "redact-text-v2.json"), "utf8");
const fixture = JSON.parse(raw) as Fixture;

describe("redactText fixture", () => {
  it("is version 2 with 71 cases and LF line endings", () => {
    expect(fixture.version).toBe(2);
    expect(fixture.cases).toHaveLength(71);
    expect(raw.includes("\r")).toBe(false);
  });
});

describe("redactText", () => {
  it.each(fixture.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    expect(redactText(c.input)).toBe(c.expected);
  });
});

describe("redactText idempotency (the desk masks again whatever arrives)", () => {
  it.each(fixture.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    expect(redactText(c.expected)).toBe(c.expected);
  });
});
