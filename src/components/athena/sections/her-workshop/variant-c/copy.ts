// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in "Her workshop", variant C — "The Fence".
 *
 * The rule this file exists to keep: nothing here may sound like a warning
 * label. The section's subject is a limit, and a limit described in the
 * vocabulary of limits ("blocked", "denied", "not permitted", "sandbox") turns
 * a reason to trust her into a reason to worry. So every word is the word a
 * person would use about their own workshop: the places you opened, how much
 * she does on her own, the one that waits for you.
 *
 * Ordinary names only. The projects are named the way anyone names a project,
 * the work is named the way anyone names a chore, and Athena is only ever
 * "Athena" or "she" — she is never mentioned by name here at all, because in
 * this scene she is the only person in the yard.
 */

/** One place you opened to her. The work only ever happens in one of these. */
export interface Bed {
  name: string;
  /** Narrow viewports keep the name, never a smaller one. */
  short: string;
}

export const BEDS: readonly Bed[] = [
  { name: "Checkout app", short: "Checkout" },
  { name: "Marketing site", short: "Website" },
  { name: "Billing service", short: "Billing" },
];

/**
 * The work, in the order it is put in motion. Placement and pace live in
 * `./data` — these are only the words, so a job can be re-timed without
 * re-writing it.
 *
 * Deliberately unremarkable chores: the argument is about how MUCH can be in
 * motion inside the line, and dramatic-sounding work would quietly turn the
 * scene into a claim about what she can pull off.
 */
export const JOB_TITLES: readonly string[] = [
  "run the tests",
  "check the links",
  "clean up the warnings",
  "fix the flaky test",
  "refresh the changelog",
  "tidy the old branches",
];

export const COPY = {
  intro: {
    eyebrow: "However much you hand her",
    heading: "The lines you drew",
    gradient: "hold",
  },
  fence: {
    /** The plate that sits astride the line, naming what is inside it. */
    plate: "the places you opened",
    plateShort: "places you opened",
  },
  dial: {
    label: "how much she does on her own",
    labelShort: "how much on her own",
    /** Three stops, low to high. The scene ends on the highest. */
    stops: ["check with me first", "the small stuff", "go ahead"],
    stopsShort: ["ask me first", "small stuff", "go ahead"],
  },
  job: {
    working: "working",
    done: "done",
  },
  outside: {
    name: "Old client work",
    /** Lands the beat after she stops at the line. */
    waits: "waits for you",
  },
} as const;
