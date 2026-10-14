import { describe, it, expect } from "vitest";
import { describeAnchorGaps, findAnchorGaps } from "./anchor-coverage";
import { HOME_STAGES } from "./home-manifest";
import { LANDING_SECTIONS } from "./constants";

describe("findAnchorGaps", () => {
  it("reports a declared address with no host (the dead dot), by address", () => {
    const gaps = findAnchorGaps(["a", "pricing"], (id) => id === "a");
    expect(gaps.declaredWithoutHost).toEqual(["pricing"]);
    expect(describeAnchorGaps(gaps, "the scroll map", "/")[0]).toMatch(/declares "pricing".*no element on \//);
  });

  it("reports the second direction: a wrapper nobody declared", () => {
    const gaps = findAnchorGaps(["a"], () => true, ["a", "orphan"]);
    expect(gaps.hostedWithoutDeclaration).toEqual(["orphan"]);
  });

  it("is silent when the vocabulary and the page agree", () => {
    const gaps = findAnchorGaps(["a", "b"], () => true, ["a", "b"]);
    expect(describeAnchorGaps(gaps, "c", "/")).toEqual([]);
  });

  // The home page is the real target: its wrappers are all present at first
  // paint, so the live-page comparison is deterministic. Here the host set is
  // derived from the manifest the page renders from.
  it("home: the scroll-map vocabulary and the rendered wrapper set agree in both directions", () => {
    const hosts = new Set(["hero", ...HOME_STAGES.map((s) => s.anchorId)]);
    const gaps = findAnchorGaps(LANDING_SECTIONS.map((s) => s.id), (id) => hosts.has(id), [...hosts]);
    expect(gaps).toEqual({ declaredWithoutHost: [], hostedWithoutDeclaration: [] });
  });
});
