import { describe, it, expect } from "vitest";
import { tokenizePrompt } from "./SyntaxPrompt";

const keywords = (text: string) =>
  tokenizePrompt(text).filter((p) => p.keyword).map((p) => p.text);

describe("SyntaxPrompt keyword highlighting", () => {
  it("highlights #-prefixed tokens after whitespace (the \\b#-bug regression)", () => {
    const kws = keywords("Review PR #142 for style issues");
    expect(kws).toContain("#142");
    expect(kws).toContain("PR");
    expect(kws).toContain("style");
    expect(kws).toContain("issues");
  });

  it("highlights Slack channel tokens", () => {
    const kws = keywords("Summarize #engineering and #product channels");
    expect(kws).toContain("#engineering");
    expect(kws).toContain("#product");
    expect(kws).toContain("channels");
  });

  it("prefers the multi-word token over its prefix", () => {
    expect(keywords("do this next week")).toContain("next week");
  });

  it("does not highlight a keyword embedded in a larger word", () => {
    expect(keywords("timezone timely")).not.toContain("time");
  });
});
