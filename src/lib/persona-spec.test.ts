import { describe, expect, it } from "vitest";
import { parseCoreProfile } from "./persona-spec";

describe("parseCoreProfile", () => {
  it("parses a full living-agent Core from its JSON string", () => {
    const core = parseCoreProfile(
      JSON.stringify({
        motivation: " Ship clean reviews ",
        stance: "Skeptical by default",
        northStarCommitment: "Zero escaped defects",
        riskTolerance: 0.2,
        conflictStyle: "challenger",
        identity: "A senior reviewer",
        voice: "Direct, brief",
        principles: ["Read the diff", "", 7],
        constraints: ["Never approve unseen code"],
        decisionPrinciples: ["Safety over speed"],
      }),
    );
    expect(core).toEqual({
      motivation: "Ship clean reviews",
      stance: "Skeptical by default",
      northStarCommitment: "Zero escaped defects",
      conflictStyle: "challenger",
      identity: "A senior reviewer",
      voice: "Direct, brief",
      principles: ["Read the diff"],
      constraints: ["Never approve unseen code"],
      decisionPrinciples: ["Safety over speed"],
    });
  });

  it("is tolerant of a prose-only blob and an object input", () => {
    const core = parseCoreProfile({ stance: "Pragmatic" });
    expect(core?.stance).toBe("Pragmatic");
    expect(core?.conflictStyle).toBeNull();
    expect(core?.principles).toEqual([]);
  });

  it("drops unrecognised conflict styles instead of inventing one", () => {
    expect(parseCoreProfile({ conflictStyle: "bully", voice: "x" })?.conflictStyle).toBeNull();
  });

  it.each([null, undefined, "", "   ", "not json", "[]", "42", "{}", { riskTolerance: 0.5 }])(
    "returns null for no usable Core: %j",
    (input) => {
      expect(parseCoreProfile(input)).toBeNull();
    },
  );
});
