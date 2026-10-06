/**
 * The cast every fleet-lab variant stages: the same request, the same four
 * tasks, the same answer - all words from `t.athenaPage.fleet` (translated in
 * 14 locales) - plus who does each task.
 *
 * The request is authored as five clauses of three parts each; the middle part
 * is the phrase that becomes something. Clause i owns task i, and the fifth
 * phrase is the answer itself. Re-word a clause freely, but never add, drop or
 * re-order one.
 */

import type { BrandKey } from "@/lib/brand-theme";
import type { Translations } from "@/i18n/en";

export type Task = Translations["athenaPage"]["fleet"]["tasks"][number];

/** A run of the sentence. `task` marks the phrase that becomes something. */
export interface Segment {
  t: string;
  task?: number;
}
export type Clause = readonly Segment[];

export const CLAUSE_COUNT = 5;
export const TASK_COUNT = 4;
/** The phrase that becomes the answer rather than a task. */
export const ANSWER_PHRASE = 4;

/** Rebuild the request from the localized clauses - clause i carries task i. */
export function requestFrom(clauses: readonly (readonly string[])[]): readonly Clause[] {
  return clauses
    .slice(0, CLAUSE_COUNT)
    .map((parts, i) => parts.map((t, k) => (k === 1 ? { t, task: i } : { t })));
}

/**
 * The agent each task is handed to, shown by the real tool it works in - every
 * one a connector in `src/data/connectors.ts` with its mark in `public/tools`.
 * Tickets come out of the help desk, the repeat complaints are grouped across
 * the inbox too, "already fixed" is checked against the issue tracker, and the
 * people affected are counted in product analytics. The answer goes to Slack.
 */
export const TOOLS = ["crisp", "gmail", "linear", "posthog"] as const;
export const ANSWER_TOOL = "slack";

/** One hue per teammate, so a phrase, its agent and its work share a colour. */
export const HUES: readonly BrandKey[] = ["cyan", "purple", "emerald", "amber"];
