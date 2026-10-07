import { describe, expect, it } from "vitest";

import { executionDeepLink, personaDeepLink } from "./desktopLinks";

const UUID = "3f2b8c1e-9a4d-4e57-b6a0-12c4d5e6f789";

describe("desktopLinks", () => {
  it("builds the exact URL for a UUID id", () => {
    expect(personaDeepLink(UUID)).toBe(`personas://persona/${UUID}`);
    expect(executionDeepLink(UUID)).toBe(`personas://execution/${UUID}`);
  });

  it("accepts 64 characters and rejects 65", () => {
    expect(personaDeepLink("a".repeat(64))).toBe(`personas://persona/${"a".repeat(64)}`);
    expect(executionDeepLink("a".repeat(64))).not.toBeNull();
    expect(personaDeepLink("a".repeat(65))).toBeNull();
    expect(executionDeepLink("a".repeat(65))).toBeNull();
  });

  it("accepts underscore and hyphen", () => {
    expect(personaDeepLink("a_b-C9")).toBe("personas://persona/a_b-C9");
  });

  it.each([
    ["empty", ""],
    ["a slash", "a/b"],
    ["a dot", "a.b"],
    ["a dotted segment", ".."],
    ["a percent sign", "a%20b"],
    ["a space", "a b"],
    ["a non-ASCII character", "caf\u00e9"],
    ["a trailing newline", `${UUID}\n`],
  ])("rejects an id with %s", (_name, id) => {
    expect(personaDeepLink(id)).toBeNull();
    expect(executionDeepLink(id)).toBeNull();
  });
});
