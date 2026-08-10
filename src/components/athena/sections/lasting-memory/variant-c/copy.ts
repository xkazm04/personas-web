// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word (and every authored measurement) in the lasting-memory section,
 * variant C — "The Marker".
 *
 * The rule this file exists to keep: a visitor must never be taught a word to
 * understand the scene. What piles up is "everything you have said to her".
 * How much she can take in at once is "one sitting" — a phrase people already
 * use about reading. Where she stopped is a marker, and what she has not
 * reached yet is "still waiting". Athena is only ever "Athena", or "she".
 *
 * The two accounts are the section's argument in her own plain sentences.
 * They are deliberately near-identical: the SECOND one repeating the third
 * line of the first is the promise being kept rather than made, and the only
 * number that changes between them is how much is still waiting — which is
 * the whole point of a thing that defers instead of dropping.
 */

/**
 * How wide each thing you said sits in the seam, in seam units. Authored, not
 * rolled: an uneven run of messages has to be deterministic, AND the first
 * twelve must sum to exactly the same total as the next twelve — that
 * equality is what lets the two brackets under them be congruent, which is
 * how the section says "the same amount, every time" without a word of copy.
 *
 *   0…11   42 units   the first sitting
 *   12…23  42 units   the next one, exactly as much
 *   24…29  21 units   what is still waiting at the end
 */
export const WEIGHTS: readonly number[] = [
  3, 5, 2, 4, 3, 4, 2, 5, 3, 3, 4, 4,
  4, 3, 3, 5, 2, 4, 4, 3, 5, 3, 2, 4,
  3, 5, 2, 4, 3, 4,
];

/** How many of them one sitting takes in. Both sittings take exactly this. */
export const PER_SITTING = 12;

/** One line of an account. `short` is the same sentence, fewer words. */
export interface AccountLine {
  full: string;
  short: string;
}

/** One thing she wrote down after a sitting. */
export interface Account {
  /** When she wrote it — the two are hours apart, and it shows. */
  label: string;
  lines: readonly AccountLine[];
  /** Which line is the admission. It gets the accent, because a system that
   *  says out loud what it did not reach is the entire promise. */
  admits: number;
}

export const ACCOUNTS: readonly Account[] = [
  {
    label: "this morning",
    admits: 1,
    lines: [
      { full: "Went through the oldest 12.", short: "Read the oldest 12." },
      { full: "18 still waiting — none of them lost.", short: "18 waiting — none lost." },
      { full: "Next time starts right here.", short: "Next time starts here." },
    ],
  },
  {
    label: "this afternoon",
    admits: 1,
    lines: [
      { full: "Picked up exactly where it stopped.", short: "Picked up where it stopped." },
      { full: "12 more read — 6 still waiting.", short: "12 more — 6 waiting." },
      { full: "Next time starts right here.", short: "Next time starts here." },
    ],
  },
];

export const COPY = {
  /** Benefit-shaped and short, like every other title on this page: the
   *  feeling (you are never left guessing) rather than the mechanism. */
  intro: {
    eyebrow: "When more piles up than fits",
    heading: "She tells you",
    gradient: "what she left",
  },
  seam: {
    /** The two ends of everything you have said to her. She always starts at
     *  the left one — which is the only reason nothing in the middle of a
     *  busy stretch can be stranded. */
    oldest: "oldest",
    newest: "newest",
  },
  /** Under each bracket, twice, unchanged — two identical labels under two
   *  identical lengths. */
  brace: "one sitting",
  waiting: "still waiting",
  waitingShort: "waiting",
} as const;
