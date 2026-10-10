import { describe, expect, it } from "vitest";
import { GATE_X, runPoints, STEPS } from "../geometry";
import { machineFor, partState, runScript } from "./machine";
import { clockReducer, INITIAL_CLOCK, stepOf, type ClockState } from "./timeline";

/**
 * The blueprint's machine is a pure function of the visitor's two answers
 * (designMatrix.questions: triggers 'Every 15 min' | 'Every hour' |
 * 'Real-time webhook', review 'Auto-send' | 'Approve first' | 'Ask only for
 * urgent'), and a stamped sheet can be revised without replaying the build.
 */
describe("machineFor / runScript", () => {
  it("defaults (triggers 0, review 1): clock origin, holding gate, one token through the gate", () => {
    const m = machineFor({});
    expect(m.origin).toBe("clock");
    expect(m.gate).toBe("hold");
    const tokens = runScript(m);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].stops).toEqual(["origin", "core", "gate-hold", "gate-open", "messages", "mast"]);
  });

  it("Auto-send: no gate, the review part is omitted, the token never stops at a gate", () => {
    const m = machineFor({ review: 0 });
    expect(m.gate).toBe("none");
    expect(partState(m, "review")).toBe("omitted");
    for (const t of runScript(m)) {
      expect(t.stops).not.toContain("gate-hold");
      expect(t.stops).not.toContain("gate-open");
    }
  });

  it("Ask only for urgent: a routine email passes, an urgent one waits at the gate", () => {
    const m = machineFor({ review: 2 });
    expect(m.gate).toBe("urgent-only");
    const tokens = runScript(m);
    expect(tokens.map((t) => t.kind)).toEqual(["routine", "urgent"]);
    const [routine, urgent] = tokens;
    expect(routine.stops).not.toContain("gate-hold");
    expect(urgent.stops).toContain("gate-hold");
    expect(urgent.stops.indexOf("gate-hold")).toBeLessThan(urgent.stops.indexOf("messages"));
  });

  it("Real-time webhook starts every token at the webhook; the schedules start at the clock", () => {
    const hook = machineFor({ triggers: 2 });
    expect(hook.origin).toBe("webhook");
    for (const t of runScript(hook)) expect(t.stops[0]).toBe("webhook");
    expect(machineFor({ triggers: 0 }).origin).toBe("clock");
    expect(machineFor({ triggers: 1 }).origin).toBe("clock");
  });
});

describe("clock reducer REVISE", () => {
  const reduce = clockReducer(STEPS);
  const FINALE = stepOf(STEPS, "finale");

  it("on a finished sheet: sets the answer and replays only the finale", () => {
    const finished: ClockState = { ...INITIAL_CLOCK, at: STEPS.length, run: 2, build: 2, answers: { review: 1 } };
    const next = reduce(finished, { type: "REVISE", dim: "review", i: 0 });
    expect(next.answers.review).toBe(0);
    expect(next.at).toBe(FINALE);
    expect(next.run).toBe(finished.run + 1);
    // the sentence and the parts do not replay: the build counter is untouched
    expect(next.build).toBe(finished.build);
  });

  it("mid-build: revision is not offered, the state is returned unchanged", () => {
    const mid: ClockState = { ...INITIAL_CLOCK, at: FINALE - 3 };
    expect(reduce(mid, { type: "REVISE", dim: "review", i: 0 })).toBe(mid);
  });
});

describe("runPoints", () => {
  const pausesAtGate = (xs: number[]) => xs.some((x, i) => i > 0 && x === GATE_X && xs[i - 1] === GATE_X);

  it("the token pauses at the gate only when there is a gate to wait at", () => {
    for (const track of runPoints(machineFor({ review: 0 }))) expect(pausesAtGate(track.x)).toBe(false);
    const [only] = runPoints(machineFor({}));
    expect(pausesAtGate(only.x)).toBe(true);
  });
});
