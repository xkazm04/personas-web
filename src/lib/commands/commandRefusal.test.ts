import { describe, expect, it } from "vitest";
import { isDeskOnly } from "./commandRefusal";

describe("isDeskOnly", () => {
  it("is false for null and empty", () => {
    expect(isDeskOnly(null)).toBe(false);
    expect(isDeskOnly("")).toBe(false);
    expect(isDeskOnly("   ")).toBe(false);
  });

  it("is true for the bare token, padded or with a detail", () => {
    expect(isDeskOnly("desk_only")).toBe(true);
    expect(isDeskOnly("  desk_only  ")).toBe(true);
    expect(isDeskOnly("desk_only: app master probation packet")).toBe(true);
    expect(isDeskOnly("desk_only : x")).toBe(true);
  });

  it("is false for other tokens and for a longer token that starts the same", () => {
    expect(isDeskOnly("replayed")).toBe(false);
    expect(isDeskOnly("not_paired: desk_only")).toBe(false);
    expect(isDeskOnly("desk_only_x")).toBe(false);
    expect(isDeskOnly("desk_only_x: detail")).toBe(false);
  });
});
