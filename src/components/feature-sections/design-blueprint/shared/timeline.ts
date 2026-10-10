import { ASKED, type DimKey } from "./dims";
import type { Answers } from "./machine";

export type StepKind = "type" | "read" | "engage" | "ask" | "resolve" | "finale";

export interface Step {
  kind: StepKind;
  ms: number;
  dim?: DimKey;
}

export interface Pace {
  type: number;
  read: number;
  engage: number;
  ask: number;
  resolve: number;
  finale: number;
}

/**
 * The build as a list of beats: the sentence is typed, read, then each
 * dimension is engaged, asked about (only the two that need you) and
 * resolved, then the finished agent holds for a finale.
 */
export function makeTimeline(order: DimKey[], pace: Pace): Step[] {
  const steps: Step[] = [
    { kind: "type", ms: pace.type },
    { kind: "read", ms: pace.read },
  ];
  for (const dim of order) {
    steps.push({ kind: "engage", ms: pace.engage, dim });
    if (ASKED.includes(dim)) steps.push({ kind: "ask", ms: pace.ask, dim });
    steps.push({ kind: "resolve", ms: pace.resolve, dim });
  }
  steps.push({ kind: "finale", ms: pace.finale });
  return steps;
}

export type DimPhase = "pending" | "engaged" | "asking" | "resolved";

/** Where one dimension stands when the clock is at step `at`. */
export function dimPhase(steps: Step[], at: number, dim: DimKey): DimPhase {
  const idx = (kind: StepKind) => steps.findIndex((s) => s.kind === kind && s.dim === dim);
  if (at >= idx("resolve")) return "resolved";
  const ask = idx("ask");
  if (ask >= 0 && at === ask) return "asking";
  return at >= idx("engage") ? "engaged" : "pending";
}

/** The step index of the first step of a kind (global steps carry no dim). */
export function stepOf(steps: Step[], kind: StepKind): number {
  return steps.findIndex((s) => s.kind === kind);
}

/** The build clock's state (driven by `useBuildClock`). */
export interface ClockState {
  /** Step index: -1 before arming, steps.length once finished. */
  at: number;
  /** Bumped by every replay of the finale (the test run re-keys on it). */
  run: number;
  /** Bumped only by a full Replay (the typed sentence re-keys on it). */
  build: number;
  answers: Answers;
  /** The visitor asked for motion (Replay), so it plays under reduced motion too. */
  userPlayed: boolean;
  /** The finished sheet was re-answered since the last Replay. */
  revised: boolean;
}

export type ClockAction =
  | { type: "ARM" }
  | { type: "TICK" }
  | { type: "ANSWER"; dim: DimKey; i: number; advance: boolean }
  | { type: "REVISE"; dim: DimKey; i: number }
  | { type: "REPLAY" };

export const INITIAL_CLOCK: ClockState = { at: -1, run: 0, build: 0, answers: {}, userPlayed: false, revised: false };

/**
 * The clock's reducer over a timeline. REVISE is the stamped sheet being
 * re-answered: it applies only once the build has finished, and replays the
 * finale alone (not the whole build), so the visitor sees the changed machine
 * run within seconds.
 */
export function clockReducer(steps: Step[]) {
  const finale = stepOf(steps, "finale");
  return function reduce(s: ClockState, a: ClockAction): ClockState {
    switch (a.type) {
      case "ARM":
        return s.at === -1 ? { ...s, at: 0 } : s;
      case "TICK":
        return { ...s, at: s.at + 1 };
      case "ANSWER":
        return { ...s, answers: { ...s.answers, [a.dim]: a.i }, at: a.advance ? s.at + 1 : s.at };
      case "REVISE":
        if (s.at !== steps.length) return s;
        return { ...s, answers: { ...s.answers, [a.dim]: a.i }, at: finale, run: s.run + 1, revised: true };
      case "REPLAY":
        return { at: 0, run: s.run + 1, build: s.build + 1, answers: {}, userPlayed: true, revised: false };
    }
  };
}
