import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { redactText } from "./redactText";

/**
 * The shared cases (fixtures/redact-text-v1.json, copied byte for byte from
 * personas): the phone must mask exactly as the desk's `redact_text` does.
 */
interface Fixture {
  version: number;
  cases: { name: string; input: string; expected: string }[];
}

const raw = readFileSync(join(process.cwd(), "fixtures", "redact-text-v1.json"), "utf8");
const fixture = JSON.parse(raw) as Fixture;

describe("redactText fixture", () => {
  it("is version 1 with 62 cases and LF line endings", () => {
    expect(fixture.version).toBe(1);
    expect(fixture.cases).toHaveLength(62);
    expect(raw.includes("\r")).toBe(false);
  });
});

describe("redactText", () => {
  it.each(fixture.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    expect(redactText(c.input)).toBe(c.expected);
  });
});

/**
 * Cases whose masked output the desk's `redact_text` masks AGAIN into a
 * different text: `NAME=[redacted]` re-reads `[redacted]` as a bracketed value
 * and becomes `NAME=[[redacted]]`. The port matches the Rust here (all 62
 * cases above pass), so neither the fixture nor the port is bent to force
 * idempotency. Reported to the App Master as an open question.
 */
const NOT_IDEMPOTENT = new Set<string>([
  "a CERTIFICATE block whose body is not base64 is judged token by token",
  "bearer: the word after Bearer is masked whatever it looks like",
  "joined pairs: a connection string split by spaces in prose",
  "joined pairs: a secret between ampersands outside a URL",
  "joined pairs: a trailing separator after the password stays",
  "joined pairs: the password in a connection string is masked, every other pair stays",
  "named value: a password holding a colon goes whole",
  "named value: a password with base64 padding goes whole",
  "named value: a secret-named JSON key masks its value",
  "named value: a secret-named key in prose masks its value",
  "named value: a secret-named key with a colon masks the next word",
  "named value: an env assignment keeps its name",
  "url: a key in the query string is masked, the other pairs stay",
  "url: a secret query pair keeps the segment rule"
]);

describe("redactText idempotency (the desk masks again whatever arrives)", () => {
  it.each(fixture.cases.filter((c) => !NOT_IDEMPOTENT.has(c.name)).map((c) => [c.name, c] as const))("%s", (_name, c) => {
    expect(redactText(c.expected)).toBe(c.expected);
  });

  it("names only cases that exist and really are not idempotent", () => {
    for (const name of NOT_IDEMPOTENT) {
      const c = fixture.cases.find((x) => x.name === name);
      expect(c, name).toBeDefined();
      expect(redactText(c!.expected), name).not.toBe(c!.expected);
    }
  });
});
