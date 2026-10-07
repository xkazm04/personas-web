import { describe, it, expect } from "vitest";
import { canDecideReview, type GateInputs } from "./useReviewGate";

const online = { tier: "online" } as ReturnType<GateInputs["tierFor"]>;
const base: GateInputs = {
  commandPlane: false,
  desktopPlane: false,
  ready: true,
  tierFor: () => online,
  personaDeviceId: () => "dev-1",
};
const review = { personaId: "p1", deviceId: "dev-1" };

describe("canDecideReview", () => {
  it("allows an ordinary review on the orchestrator plane", () => {
    expect(canDecideReview(review, base)).toBe(true);
  });
  it("refuses a desk-only review on every plane", () => {
    const r = { ...review, deskOnly: true };
    expect(canDecideReview(r, base)).toBe(false);
    expect(canDecideReview(r, { ...base, commandPlane: true })).toBe(false);
  });
  it("treats an undefined or false deskOnly as ordinary", () => {
    expect(canDecideReview({ ...review, deskOnly: false }, base)).toBe(true);
  });
  it("still judges the bulk toolbar (null review) as before", () => {
    expect(canDecideReview(null, base)).toBe(true);
  });
});
