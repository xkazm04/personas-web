import { describe, it, expect } from "vitest";
import { commitTypeAdvice } from "../../scripts/check-ai-change.mjs";

/**
 * Pins the commit-type rule of scripts/check-ai-change.mjs. Lane commits were
 * typed `fix:` whatever they did ("fix: Added threat model"), so a type-based
 * reading of the log filed features as bug fixes. The gate reports that on
 * every PR, as advice, alongside the CLAUDE.md format advice.
 */

const src = [{ status: "A", file: "src/lib/x.ts" }];

describe("commitTypeAdvice", () => {
  it("flags a fix: whose subject adds something", () => {
    expect(commitTypeAdvice("fix: Added threat model with route-coverage unit test", src)).toHaveLength(1);
    expect(commitTypeAdvice("fix(api): Introduce a rate limit", src)).toHaveLength(1);
    expect(commitTypeAdvice("fix: new gate for agent commits", src)).toHaveLength(1);
  });

  it("accepts a fix: that repairs and a feat: that adds", () => {
    expect(commitTypeAdvice("fix: Replaced placeholders in SECURITY.md", src)).toEqual([]);
    expect(commitTypeAdvice("fix: addresses the inverted limiter", src)).toEqual([]);
    expect(commitTypeAdvice("feat: Added threat model", src)).toEqual([]);
  });

  it("asks for docs:/test:/ci: when every file is that kind", () => {
    expect(commitTypeAdvice("fix: Replaced placeholders", [{ status: "M", file: "SECURITY.md" }])[0]).toContain("`docs:`");
    expect(commitTypeAdvice("feat: cover votes", [{ status: "A", file: "src/lib/votes.test.ts" }])[0]).toContain("`test:`");
    expect(commitTypeAdvice("fix: pin action", [{ status: "M", file: ".github/workflows/ci.yml" }])[0]).toContain("`ci:`");
  });

  it("stays quiet on mixed change sets and on non-conventional subjects", () => {
    const mixed = [...src, { status: "M", file: "docs/a.md" }];
    expect(commitTypeAdvice("feat: thing", mixed)).toEqual([]);
    expect(commitTypeAdvice("B.2/lint: Added rule", src)).toEqual([]);
    expect(commitTypeAdvice("docs: Added a page", [{ status: "A", file: "docs/a.md" }])).toEqual([]);
  });
});
