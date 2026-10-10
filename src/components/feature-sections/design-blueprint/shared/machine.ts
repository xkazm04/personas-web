import type { DimKey } from "./dims";

/** The visitor's answers to the two questions, by option index. */
export type Answers = Partial<Record<DimKey, number>>;

/** Option indices of `designMatrix.questions` (keep in step with its `options`). */
export const TRIGGER = { every15: 0, hourly: 1, webhook: 2 } as const;
export const REVIEW = { auto: 0, approve: 1, urgent: 2 } as const;

/** The answers the live matrix pre-picks (shared/copy.ts `PICKED`). */
export const DEFAULT_ANSWERS = { triggers: TRIGGER.every15, review: REVIEW.approve } as const;

/** What starts a run: the schedule clock or an incoming webhook. */
export type Origin = "clock" | "webhook";
/** The review gate: absent, holding every draft, or holding only urgent ones. */
export type Gate = "none" | "hold" | "urgent-only";
/** How a part is drawn: as designed, left as construction lines, or swapped for its alternative glyph. */
export type PartState = "drawn" | "omitted" | "swapped";

/** A named place a test-run token passes through. */
export type Stop = "origin" | "webhook" | "core" | "gate-hold" | "gate-open" | "messages" | "mast";
export type TokenKind = "email" | "routine" | "urgent";
export interface Token {
  kind: TokenKind;
  stops: Stop[];
}

export interface Machine {
  origin: Origin;
  gate: Gate;
  parts: Record<DimKey, PartState>;
}

/**
 * The machine the blueprint draws, as a pure function of the visitor's two
 * answers: 'Real-time webhook' swaps the schedule clock for a hook,
 * 'Auto-send' leaves the review gate undrawn, 'Ask only for urgent' keeps the
 * gate but lets routine mail through.
 */
export function machineFor(answers: Answers): Machine {
  const triggers = answers.triggers ?? DEFAULT_ANSWERS.triggers;
  const review = answers.review ?? DEFAULT_ANSWERS.review;
  const origin: Origin = triggers === TRIGGER.webhook ? "webhook" : "clock";
  const gate: Gate = review === REVIEW.auto ? "none" : review === REVIEW.urgent ? "urgent-only" : "hold";
  return {
    origin,
    gate,
    parts: {
      tasks: "drawn",
      apps: "drawn",
      triggers: origin === "webhook" ? "swapped" : "drawn",
      review: gate === "none" ? "omitted" : "drawn",
      memory: "drawn",
      errors: "drawn",
      messages: "drawn",
      events: "drawn",
    },
  };
}

export function partState(m: Machine, dim: DimKey): PartState {
  return m.parts[dim];
}

/** The finale's test run: the emails sent through the machine and where each one stops. */
export function runScript(m: Machine): Token[] {
  const start: Stop = m.origin === "webhook" ? "webhook" : "origin";
  const through: Stop[] = [start, "core", "messages", "mast"];
  const held: Stop[] = [start, "core", "gate-hold", "gate-open", "messages", "mast"];
  if (m.gate === "none") return [{ kind: "email", stops: through }];
  if (m.gate === "hold") return [{ kind: "email", stops: held }];
  return [
    { kind: "routine", stops: through },
    { kind: "urgent", stops: held },
  ];
}
