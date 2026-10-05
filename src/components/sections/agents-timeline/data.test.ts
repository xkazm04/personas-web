import { describe, it, expect } from "vitest";
import { scenarios, speedupPercent, trackResolved } from "./data";
import { scenarios as chatScenarios } from "../agents-chat/data";

/**
 * The race's figures must agree with what it shows. The timer counts each
 * track's `totalMs`, so a result line that names a different duration, or a
 * "% faster" measured against a track that never resolved, contradicts the
 * demo on screen. The chat on the same /how page tells the same stories, so a
 * wait the race states must be the wait the chat states.
 */

const sum = (steps: { durationMs: number }[]) => steps.reduce((n, s) => n + s.durationMs, 0);

/** Any duration a sentence states ("4 seconds", "90 seconds", "1.8s", "for hours"). */
const STATED_DURATION = /\b\d+(?:\.\d+)?\s*(?:s|secs?|seconds?)\b|\bhours?\b/i;

describe("race figures agree with the race", () => {
  it.each(scenarios)("$id: each track's total is the sum of its steps", (s) => {
    expect(s.workflow.totalMs).toBe(sum(s.workflow.steps));
    expect(s.agent.totalMs).toBe(sum(s.agent.steps));
  });

  it.each(scenarios)("$id: no result line names a duration the timer does not show", (s) => {
    for (const track of [s.workflow, s.agent]) {
      expect(track.result, `"${track.result}" vs a ${track.totalMs / 1000}s timer`).not.toMatch(STATED_DURATION);
    }
  });

  it.each(scenarios)("$id: no speed-up is claimed over a workflow that never resolved", (s) => {
    expect(trackResolved(s.workflow)).toBe(false);
    expect(speedupPercent(s)).toBeNull();
  });

  it("a speed-up is the share of the workflow's time saved, when both tracks resolved", () => {
    const base = scenarios[0];
    const resolved = { ...base, workflow: { ...base.workflow, steps: [{ label: "done", durationMs: 2000, status: "ok" as const }], totalMs: 2000 } };
    expect(speedupPercent({ ...resolved, agent: { ...base.agent, totalMs: 1500 } })).toBe(25);
  });
});

describe("race and chat tell the same story", () => {
  it("ambiguous-email: the race states the same wait as the chat's hand-off", () => {
    const chat = chatScenarios.find((c) => c.id === "ambiguous-email");
    const race = scenarios.find((s) => s.id === "ambiguous-email");
    const handOff = chat?.workflow.messages.at(-1)?.text ?? "";
    const wait = /(\d+) minutes/.exec(handOff)?.[0];
    expect(wait, `chat hand-off: "${handOff}"`).toBeTruthy();
    expect(race?.workflow.result).toContain(wait);
  });
});
