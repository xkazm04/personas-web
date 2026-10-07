import { describe, it, expect } from "vitest";
import { isDeskOnlyReview } from "./deskOnlyReview";

describe("isDeskOnlyReview", () => {
  it("is false for absent context_data", () => {
    expect(isDeskOnlyReview(null)).toBe(false);
    expect(isDeskOnlyReview(undefined)).toBe(false);
    expect(isDeskOnlyReview("")).toBe(false);
  });
  it("is false for non-JSON text", () => {
    expect(isDeskOnlyReview("app_master_probation")).toBe(false);
  });
  it("is false for JSON that is not an object", () => {
    expect(isDeskOnlyReview('"app_master_probation"')).toBe(false);
    expect(isDeskOnlyReview("42")).toBe(false);
    expect(isDeskOnlyReview("null")).toBe(false);
    expect(isDeskOnlyReview('["app_master_probation"]')).toBe(false);
  });
  it("is true for a probation packet kind", () => {
    expect(isDeskOnlyReview('{"kind":"app_master_probation"}')).toBe(true);
  });
  it("is true for an App Master ask source", () => {
    expect(isDeskOnlyReview('{"source":"app_master_ask","x":1}')).toBe(true);
  });
  it("is false for any other kind or source", () => {
    expect(isDeskOnlyReview('{"kind":"other","source":"somewhere"}')).toBe(false);
    expect(isDeskOnlyReview('{"kind":1,"source":null}')).toBe(false);
    expect(isDeskOnlyReview("{}")).toBe(false);
  });
});
