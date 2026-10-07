import { describe, it, expect } from "vitest";
import { decidableIds } from "@/lib/commands/deskOnlyReview";

describe("decidableIds", () => {
  const reviews = [{ id: "a" }, { id: "b", deskOnly: true }, { id: "c", deskOnly: false }];
  it("drops a desk-only review from a bulk selection", () => {
    expect(decidableIds(["a", "b", "c"], reviews)).toEqual(["a", "c"]);
  });
  it("leaves nothing to send when only desk-only reviews are selected", () => {
    expect(decidableIds(["b"], reviews)).toEqual([]);
  });
});
