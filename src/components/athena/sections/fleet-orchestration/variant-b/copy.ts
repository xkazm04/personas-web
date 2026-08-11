/**
 * The structural half of section 4 ("Sentence to work"), variant B — the shape
 * the request has, not the words in it. Every word lives in `src/i18n` under
 * `athenaPage.fleet`.
 *
 * The rule this file exists to keep: the tasks must be TRACEABLE. A visitor
 * should be able to point at a phrase in the sentence and then at the card it
 * became. So the sentence is authored as five clauses, each carrying exactly
 * one highlightable phrase (`athenaPage.fleet.request.clauses` — three parts
 * per clause, the middle one being the phrase), and the four task titles are
 * plainly derived restatements of the first four; the fifth is the answer
 * itself. Clause i owns task i, which is what makes the rebuild below a
 * one-liner and what a translation must preserve: re-word a clause freely,
 * but never add, drop or re-order one.
 */

import type { Translations } from "@/i18n/en";

/** A run of the sentence. `task` marks the phrase that becomes something. */
export interface Segment {
  t: string;
  task?: number;
}

/** One clause of the request. Clauses arrive one per tick as it is typed. */
export type Clause = readonly Segment[];

/** The phrase that becomes the answer rather than a task. */
export const ANSWER_PHRASE = 4;

/** How long the request is, in clauses and in the work it implies. The tick
 *  clock in `./data` is budgeted against both. */
export const CLAUSE_COUNT = 5;
export const TASK_COUNT = 4;

/** The one task whose scope you change before anything runs. */
export const EDITED_TASK = 0;

/** Which part of a clause is its one highlightable phrase. */
const PHRASE = 1;

/** Rebuild the request out of the localized clauses — clause i carries task i,
 *  and the last one carries ANSWER_PHRASE, which is the same number. */
export function requestFrom(clauses: readonly (readonly string[])[]): readonly Clause[] {
  return clauses
    .slice(0, CLAUSE_COUNT)
    .map((parts, i) => parts.map((t, k) => (k === PHRASE ? { t, task: i } : { t })));
}

/** One piece of work: the phrase restated, the narrowing Athena proposed (and
 *  the one you change), and what it came back with. */
export type Task = Translations["athenaPage"]["fleet"]["tasks"][number];
