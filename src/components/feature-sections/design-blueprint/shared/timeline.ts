import { ASKED, type DimKey } from "./dims";

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
