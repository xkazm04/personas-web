import { describe, expect, it } from "vitest";
import { keyboardInset } from "./useKeyboardInset";

describe("keyboardInset: how much of the layout viewport the keyboard covers", () => {
  it("is the layout height minus the visual viewport's bottom edge", () => {
    // iPhone 13 portrait: 844 px layout, a 336 px keyboard.
    expect(keyboardInset(844, 508, 0)).toBe(336);
    // Safari scrolled the visual viewport down by 40 px to show the field.
    expect(keyboardInset(844, 508, 40)).toBe(296);
  });

  it("reads 0 for no keyboard, or for a small change (the URL bar collapsing)", () => {
    expect(keyboardInset(844, 844, 0)).toBe(0);
    expect(keyboardInset(844, 790, 0)).toBe(0);
    expect(keyboardInset(844, 900, 0)).toBe(0);
  });
});
