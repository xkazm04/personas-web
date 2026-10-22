import { describe, expect, it } from "vitest";
import { CALLOUT_VARIANTS, CARD_STATUSES, parseGuide } from "./parseGuide";

describe("enum-guarded block payloads - the grammar derives from the declared sets", () => {
  it("accepts every declared callout variant, in any case, and nothing else", () => {
    for (const v of CALLOUT_VARIANTS) {
      const { doc, diagnostics } = parseGuide(`:::callout-stack\n[${v.toUpperCase()}] text\n:::`);
      expect(diagnostics).toEqual([]);
      expect(doc).toMatchObject([{ type: "callout-stack", items: [{ variant: v, text: "text" }] }]);
    }
    expect(parseGuide(":::callout-stack\n[danger] text\n:::").diagnostics.map((d) => d.kind)).toEqual(["empty-block"]);
  });

  it("accepts every declared card status and nothing else", () => {
    for (const s of CARD_STATUSES) {
      const { doc, diagnostics } = parseGuide(`:::cards\n[${s}] Title | d\n:::`);
      expect(diagnostics).toEqual([]);
      expect(doc).toMatchObject([{ type: "cards", items: [{ status: s, title: "Title" }] }]);
    }
    expect(parseGuide(":::cards\n[planned] Title | d\n:::").diagnostics.map((d) => d.kind)).toEqual(["empty-block"]);
  });
});
