// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word and every authored constant in "The Workshop" — the her-workshop
 * section, variant B.
 *
 * The rule this file exists to keep: a visitor is never taught a name. Each
 * bench is labelled by the KIND OF WORK it is, in the words a colleague would
 * use — "hands on it now", "waiting on your go", "on a schedule", "when
 * something happens". Nothing here is a product noun, a setting, or a thing
 * with a version number. Athena is only ever "Athena", or "she".
 *
 * The bench at the edge is the one to be careful with (see `./data`): it is
 * built, paired and ready, and it has never run a piece of work. Every word
 * about it says PRESENT AND READY, and not one of them says busy.
 *
 * Nothing on screen is a measurement. The scene shows a rim crowded with
 * standing orders and a bench with marks arriving on it constantly, and never
 * counts either — a number in an illustration is a spec sheet, not a picture.
 */

export const COPY = {
  /** Benefit-shaped and short, like every other title on this page: the breadth
   *  is the point, and the point is that all of it lands in one place. */
  intro: {
    eyebrow: "She doesn't have one tool",
    heading: "Every kind of work,",
    gradient: "one place",
  },
  /** The five benches, named by the kind of work each one does. */
  bench: {
    hands: "hands on it now",
    queue: "waiting on your go",
    standing: "on a schedule",
    watch: "when something happens",
    next: "the bench next door",
  },
  hands: { done: "done" },
  /** The queue moves because you moved it — the button, and the empty slot it
   *  leaves behind. Never "auto", never "picked up for you". */
  queue: { start: "start", taken: "on the bench now" },
  /** What the dial says when one of its orders comes round. Nobody pressed it,
   *  and the wording says so without claiming she works your backlog at night. */
  standing: { fired: "it was time" },
  watch: { tripped: "started itself" },
  next: { paired: "paired", ready: "ready when you are" },
} as const;

/** The work she already has hands on. Ordinary, specific, work-shaped. */
export const HANDS: readonly string[] = [
  "Fix the checkout retry",
  "Rename the billing fields",
  "Write the release notes",
];

/** The one you hand over from the queue — it becomes a fourth pair of hands. */
export const HANDED_OVER = "Clean up the old exports";

/** Work waiting its turn. The first is the one you start, deliberately. */
export const QUEUED: readonly string[] = [
  "Clean up the old exports",
  "Draft the data migration",
  "Tidy the settings screen",
];
export const STARTED_CARD = 0;

/** Standing orders, named by their rhythm rather than their machinery. */
export const ORDERS: readonly string[] = ["every morning", "on the hour"];
export const FIRED_ORDER = 0;

/** The kinds of thing that can start work on their own. Every one of these is
 *  a real trigger shape: a file changing, an event arriving, a job upstream
 *  finishing and handing on. */
export const WATCHERS: readonly string[] = [
  "a file changed",
  "an event arrived",
  "a job finished",
];
export const TRIPPED_WATCHER = 0;

/** The code that appears on both screens at once when two machines pair. */
export const PAIR_CODE = "418 602";

/** How long one mark takes to cross each watch track, in seconds. Authored and
 *  deliberately unrelated to each other and to the tick: things happen when
 *  they happen, which is the whole difference between this bench and the dial. */
export const WATCH_PERIODS: readonly number[] = [3.1, 2.3, 4.7];
