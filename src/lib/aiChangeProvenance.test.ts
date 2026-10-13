import { describe, it, expect } from "vitest";
import { classifyCommit, gateMode } from "../../scripts/check-ai-change.mjs";

/**
 * Pins how scripts/check-ai-change.mjs treats a commit by provenance
 * (docs/AI_HARNESS.md "Provenance"): a trailer makes a commit an agent's, a good
 * signature makes an untrailered commit a person's, and anything else is
 * unverified, which warns by default and fails under --strict-provenance.
 */

const CLAUDE = "fix: x\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";
const ASCENT = "fix: x\n\nAscent-Resolves: 1234";
const PLAIN = "fix: x";

describe("classifyCommit", () => {
  it("a trailer makes an agent commit, signed or not", () => {
    expect(classifyCommit(CLAUDE, "N")).toBe("agent");
    expect(classifyCommit(ASCENT, "G")).toBe("agent");
  });

  it("only a good signature verifies an untrailered commit", () => {
    expect(classifyCommit(PLAIN, "G")).toBe("verified");
    for (const status of ["N", "B", "U", "X", "Y", "R", "E", ""]) {
      expect(classifyCommit(PLAIN, status), status).toBe("unverified");
    }
  });

  it("a dropped trailer does not make an unsigned commit a person's", () => {
    expect(classifyCommit("fix: x\n\nCo-Authored-By: Jane <jane@example.com>", "N")).toBe("unverified");
  });
});

describe("gateMode", () => {
  it("fails agent commits and skips verified ones, strict or not", () => {
    for (const strict of [false, true]) {
      expect(gateMode("agent", strict)).toBe("fail");
      expect(gateMode("verified", strict)).toBe("skip");
    }
  });

  it("warns on unverified commits by default and fails them under strict provenance", () => {
    expect(gateMode("unverified", false)).toBe("warn");
    expect(gateMode("unverified", true)).toBe("fail");
  });

  it("an unsigned commit that drops its trailer is no longer skipped", () => {
    expect(gateMode(classifyCommit(PLAIN, "N"), false)).not.toBe("skip");
  });
});
