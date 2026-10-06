/**
 * WHEN everything happens in memory lab v2 - "Say it once".
 *
 * The same request, three times, months apart. The thing that changes is how
 * much YOU have to say, and the reason it changes is visible beside it:
 *
 *   day 1     you spell it all out - the ask and four details. She does it,
 *             and that night keeps the two you were sure about.
 *   week 3    the same ask, and you only add the two she does not have yet.
 *             The two you said again light up where you first said them -
 *             said twice, and now she carries those too.
 *   month 2   three words. Everything she carries flows back into the work,
 *             and the reply is just as complete as the day-one one.
 *   hold      the staircase of shrinking messages beside a full column of
 *             what she carries - the claim, in one still frame.
 *
 * One deterministic CYCLE, pure phase functions, no DOM.
 */

export const TICK_MS = 1000;
/** 24 x 1s per loop; the last 5s are still. */
export const CYCLE = 24;

export type PhraseKey = "short" | "thursday" | "staging" | "billing";
export type GroupKey = "prefer" | "worked" | "decided";

/** What each detail you give her becomes once she carries it: which of her
 *  kept sentences (`athenaPage.memory.kept`) and which group it lives in. */
export const KEEPS: Record<PhraseKey, { kept: number; group: GroupKey }> = {
  short: { kept: 3, group: "prefer" },
  billing: { kept: 2, group: "prefer" },
  staging: { kept: 1, group: "worked" },
  thursday: { kept: 0, group: "decided" },
};
export const GROUPS: readonly GroupKey[] = ["prefer", "worked", "decided"];
/** Card order inside the column, group by group. */
export const CARD_ORDER: readonly PhraseKey[] = ["short", "billing", "staging", "thursday"];

export interface RowPlan {
  when: "day" | "weeks" | "months";
  ask: "ask" | "brief";
  phrases: readonly PhraseKey[];
  /** The phrases she keeps after this row's reply. */
  keeps: readonly PhraseKey[];
  typeAt: number;
  replyAt: number;
  keepAt: number;
}

export const ROWS: readonly RowPlan[] = [
  {
    when: "day",
    ask: "ask",
    phrases: ["short", "thursday", "staging", "billing"],
    keeps: ["short", "thursday"],
    typeAt: 2,
    replyAt: 4,
    keepAt: 5,
  },
  {
    when: "weeks",
    ask: "ask",
    phrases: ["staging", "billing"],
    keeps: ["staging", "billing"],
    typeAt: 8,
    replyAt: 10,
    keepAt: 11,
  },
  { when: "months", ask: "brief", phrases: [], keeps: [], typeAt: 14, replyAt: 17, keepAt: 99 },
];

const OPEN_AT = 1;
/** Everything she carries flows back into the month-two request. */
const RECALL_AT = 16;
const HOLD_AT = 19;
/** A flight lands one tick after it leaves. */
const FLIGHT = 1;

/** Reduced motion pins the hold: all three rows, all four cards, the recall
 *  still traced into the last reply. */
export const INITIAL_TICK = HOLD_AT + 2;
export const PARK_TICK = CYCLE - 1;

export interface SceneState {
  open: boolean;
  /** Per row: 0 not yet, 1 ask typed, 2 details typed. */
  typed: number[];
  replied: boolean[];
  /** The row being worked; earlier rows dim one step. */
  current: number;
  /** Phrases in flight to the column this tick, and phrases carried. */
  flying: PhraseKey[];
  carried: Set<PhraseKey>;
  /** Week three's repeats, joined back to where you first said them. */
  repeats: boolean;
  /** 0 not yet, 1 flowing back this tick, 2 arrived and quiet. */
  recall: number;
  holding: boolean;
}

export function sceneAt(phase: number): SceneState {
  const carried = new Set<PhraseKey>();
  const flying: PhraseKey[] = [];
  for (const row of ROWS) {
    for (const k of row.keeps) {
      if (phase >= row.keepAt + FLIGHT) carried.add(k);
      else if (phase === row.keepAt) flying.push(k);
    }
  }
  const current = ROWS.reduce((at, row, i) => (phase >= row.typeAt ? i : at), -1);
  return {
    open: phase >= OPEN_AT,
    typed: ROWS.map((r) => (phase >= r.typeAt + 1 ? 2 : phase >= r.typeAt ? 1 : 0)),
    replied: ROWS.map((r) => phase >= r.replyAt),
    current,
    flying,
    carried,
    repeats: phase >= ROWS[1].typeAt + 1,
    recall: phase < RECALL_AT ? 0 : phase === RECALL_AT ? 1 : 2,
    holding: phase >= HOLD_AT,
  };
}

/** Which status line runs at a phase: a key into `athenaLab.memory.v2.status`,
 *  or `carries` for the closing line the live section already ships. */
export function statusKeyAt(phase: number): "spell" | "keeps" | "twice" | "carried" | "brief" | "already" | "carries" {
  if (phase < ROWS[0].keepAt) return "spell";
  if (phase < ROWS[1].typeAt) return "keeps";
  if (phase < ROWS[1].keepAt) return "twice";
  if (phase < ROWS[2].typeAt) return "carried";
  if (phase < RECALL_AT) return "brief";
  if (phase < HOLD_AT) return "already";
  return "carries";
}
