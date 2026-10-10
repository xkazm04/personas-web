import { describe, expect, it } from "vitest";
import { downloadPlan } from "@/lib/release";
import { arrivalPlan, handoffQuery, parseHandoffArrival } from "./handoff-arrival";

const LIVE = downloadPlan("https://github.com/x/personas/releases/download/v1/setup.exe");
const NOT_LIVE = downloadPlan(undefined);

describe("handoffQuery", () => {
  it("is two fixed tokens and nothing else", () => {
    expect(handoffQuery("m")).toBe("?via=phone&from=m");
    expect(handoffQuery("m2")).toBe("?via=phone&from=m2");
  });
});

describe("parseHandoffArrival", () => {
  it("reads a phone hand-off and its source", () => {
    expect(parseHandoffArrival("?via=phone&from=m2")).toEqual({ from: "m2" });
    expect(parseHandoffArrival("?via=phone&from=m")).toEqual({ from: "m" });
  });
  it("keeps the arrival but drops a source outside the allow-list", () => {
    expect(parseHandoffArrival("?via=phone&from=<script>")).toEqual({ from: null });
    expect(parseHandoffArrival("?via=phone")).toEqual({ from: null });
  });
  it("is null for anything that is not a phone hand-off", () => {
    expect(parseHandoffArrival("?ref=waitlist&platform=macos")).toBeNull();
    expect(parseHandoffArrival("")).toBeNull();
    expect(parseHandoffArrival("?via=email&from=m")).toBeNull();
  });
});

describe("arrivalPlan", () => {
  it("offers the installer when this computer's platform has one", () => {
    expect(arrivalPlan({ from: "m" }, LIVE, "windows")).toEqual({ action: "download", platform: "windows" });
  });
  it("offers this computer's waitlist when it has no installer", () => {
    expect(arrivalPlan({ from: "m" }, NOT_LIVE, "windows")).toEqual({ action: "waitlist", platform: "windows" });
    expect(arrivalPlan({ from: "m" }, LIVE, "macos")).toEqual({ action: "waitlist", platform: "macos" });
  });
  it("changes nothing for an organic visitor", () => {
    expect(arrivalPlan(null, LIVE, "windows")).toBeNull();
    expect(arrivalPlan(null, NOT_LIVE, "linux")).toBeNull();
  });
});
