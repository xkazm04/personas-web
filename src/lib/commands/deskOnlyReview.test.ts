import { describe, it, expect } from "vitest";
import { isDeskOnlyReview, reviewReportId } from "./deskOnlyReview";

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

describe("reviewReportId", () => {
  it("reads the reportId of a council Approval, which is not desk-only", () => {
    expect(reviewReportId('{"reportId":"r1"}')).toBe("r1");
    expect(isDeskOnlyReview('{"reportId":"r1"}')).toBe(false);
  });
  it("leaves the probation packet and the ask desk-only", () => {
    expect(isDeskOnlyReview('{"kind":"app_master_probation"}')).toBe(true);
    expect(isDeskOnlyReview('{"source":"app_master_ask"}')).toBe(true);
    expect(reviewReportId('{"kind":"app_master_probation"}')).toBeNull();
  });
  it("is null for garbage, arrays, non-string and empty ids", () => {
    expect(reviewReportId(null)).toBeNull();
    expect(reviewReportId("not json")).toBeNull();
    expect(reviewReportId('["r1"]')).toBeNull();
    expect(reviewReportId('{"reportId":7}')).toBeNull();
    expect(reviewReportId('{"reportId":""}')).toBeNull();
  });
});
