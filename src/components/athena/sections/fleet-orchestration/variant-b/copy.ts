// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 4 ("Sentence to work"), variant B.
 *
 * The rule this file exists to keep: the tasks must be TRACEABLE. A visitor
 * should be able to point at a phrase in the sentence and then at the card it
 * became. So the sentence is authored as five clauses, each carrying exactly
 * one highlightable phrase, and the four task titles are plainly derived
 * restatements of the first four — the fifth is the answer itself.
 *
 * Ordinary words only. Nobody in this scene says anything a person wouldn't
 * say to a colleague, and Athena is only ever "Athena".
 */

/** A run of the sentence. `task` marks the phrase that becomes something. */
export interface Segment {
  t: string;
  task?: number;
}

/** One clause of the request. Clauses arrive one per tick as it is typed. */
export type Clause = readonly Segment[];

/** The phrase that becomes the answer rather than a task. */
export const ANSWER_PHRASE = 4;

export const REQUEST: readonly Clause[] = [
  [{ t: "Pull " }, { t: "last week's tickets", task: 0 }, { t: "," }],
  [{ t: " find " }, { t: "the complaints that repeat", task: 1 }, { t: "," }],
  [{ t: " check " }, { t: "what we already fixed", task: 2 }, { t: "," }],
  [{ t: " count " }, { t: "how many it hit", task: 3 }, { t: "," }],
  [{ t: " and " }, { t: "tell the team what matters", task: ANSWER_PHRASE }, { t: "." }],
];

export interface Task {
  /** The phrase, restated as a piece of work. */
  title: string;
  /** The narrowing Athena proposed — and the one thing you change. */
  scope: string;
  scopeEdited?: string;
  /** What this task came back with. */
  found: string;
}

export const TASKS: readonly Task[] = [
  {
    title: "Collect the tickets",
    scope: "last 7 days",
    scopeEdited: "last 14 days",
    found: "1,284 tickets",
  },
  { title: "Group the repeat complaints", scope: "all channels", found: "9 clusters" },
  { title: "Check what we already shipped", scope: "since May", found: "4 already fixed" },
  { title: "Count the people affected", scope: "by account", found: "612 accounts" },
];

/** The one task whose scope you change before anything runs. */
export const EDITED_TASK = 0;

export const COPY = {
  intro: {
    eyebrow: "Say it in your own words",
    heading: "Fleet",
    gradient: "orchestration",
  },
  request: {
    /** Sits in the box until the first words land. */
    placeholder: "Ask Athena for anything…",
    /** Both affordances are on the box the whole time — same path either way. */
    voice: "or just say it",
    sent: "sent",
  },
  plan: {
    /** Athena has proposed; nothing has started. */
    hint: "Change anything before it starts",
    hintShort: "Change anything first",
    edited: "Changed",
    start: "Start",
    working: "Working",
    done: "Done",
  },
  task: {
    working: "working",
    finished: "done",
  },
  result: {
    title: "What matters this week",
    rows: [
      { label: "Checkout errors", meta: "214 people" },
      { label: "Slow search", meta: "96 people" },
      { label: "Login loop", meta: "fixed Tuesday" },
    ],
    footer: "sent to the team",
  },
} as const;
