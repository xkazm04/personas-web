import { describe, it, expect } from "vitest";
import { isValidEmail, isValidVoterId } from "./validation";

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.com")).toBe(true);
  });

  it("requires a 2+ char alphabetic TLD and an @", () => {
    expect(isValidEmail("noatsign.example.com")).toBe(false);
    expect(isValidEmail("a@b.c")).toBe(false); // 1-char TLD
    expect(isValidEmail("a@b.123")).toBe(false); // numeric TLD
    expect(isValidEmail("a@b")).toBe(false); // no TLD
  });

  it("rejects header/HTML-injection characters", () => {
    for (const bad of [
      "a<b>@c.com",
      'a"@c.com',
      "a;b@c.com",
      "a(b)@c.com",
      "a b@c.com",
      "a@c.com\nBcc: x@y.com",
    ]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });

  it("rejects addresses over the 254-char cap", () => {
    const long = `${"a".repeat(250)}@b.com`; // > 254
    expect(long.length).toBeGreaterThan(254);
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("isValidVoterId", () => {
  it("accepts 16-64 char [A-Za-z0-9_-] ids (incl. a UUID without dashes stripped)", () => {
    expect(isValidVoterId("abcdef0123456789")).toBe(true); // 16
    expect(isValidVoterId("a".repeat(64))).toBe(true); // 64
    expect(isValidVoterId("voter_ID-123456789")).toBe(true);
  });

  it("rejects too-short / too-long / wrong-charset / non-string", () => {
    expect(isValidVoterId("a".repeat(15))).toBe(false); // 15
    expect(isValidVoterId("a".repeat(65))).toBe(false); // 65
    expect(isValidVoterId("has spaces 0000000")).toBe(false);
    expect(isValidVoterId("<script>aaaaaaaaaa")).toBe(false);
    expect(isValidVoterId(12345678901234567 as unknown)).toBe(false);
    expect(isValidVoterId(null)).toBe(false);
    expect(isValidVoterId(undefined)).toBe(false);
  });
});
