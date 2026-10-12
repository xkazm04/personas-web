import { describe, expect, it } from "vitest";
import { estimateTextWidth, fitTextLength } from "./textFit";

describe("textFit", () => {
  it("counts latin as 0.6em and CJK as 1em", () => {
    expect(estimateTextWidth("abcde", 10)).toBeCloseTo(30);
    expect(estimateTextWidth("日本語", 10)).toBe(30);
  });
  it("returns a textLength only when the text overflows its slot", () => {
    expect(fitTextLength("NO REPLAYS", 9, 90)).toBeUndefined();
    expect(fitTextLength("A very long translated label", 9, 90)).toBe(90);
  });
});
