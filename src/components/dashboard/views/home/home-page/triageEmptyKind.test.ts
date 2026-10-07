import { describe, expect, it } from "vitest";
import { triageEmptyKind } from "./useTriageQueue";

describe("triageEmptyKind", () => {
  it("shows items whenever there are any, served or not", () => {
    expect(triageEmptyKind(2, false)).toBe("items");
    expect(triageEmptyKind(2, true)).toBe("items");
  });

  it("is an all-clear only when the list was served", () => {
    expect(triageEmptyKind(0, false)).toBe("clear");
  });

  it("shows the desktop note instead of an all-clear when the list is not served", () => {
    expect(triageEmptyKind(0, true)).toBe("unserved");
  });
});
