// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in the "lasting memory" section, variant B — "The Archive".
 *
 * The rule this file keeps: a visitor must never be taught a word to
 * understand the picture. So the things she knows are written the way you
 * would have said them ("Deploys are Thursdays"), the zones are named for
 * what they are to YOU rather than for what they are to her, and Athena is
 * only ever "Athena", or "I" when she is the one speaking.
 *
 * Nothing here may describe housekeeping. She never removes, clears, prunes
 * or forgets anything — the strongest verb available in this file is "stops
 * coming up", and the picture is built so that the difference between that
 * and "gone" is the only thing the eye can see.
 */

/** One durable thing she knows. */
export interface Known {
  /** How you said it. */
  line: string;
  /** The same thing, for narrow viewports. */
  short: string;
}

/**
 * Index order is the story, not the reading order — the layouts place them.
 *
 *   0, 2   in use, and they stay in use
 *   1      in use, until 3 arrives and says otherwise
 *   3      the new one
 *   4,5,6  already out of use before the loop starts, and still readable
 *
 * 1 and 3 are deliberately the SAME fact twice: you can read the old answer
 * and the new one at the same time, in the same frame, which is the whole
 * section in one glance.
 */
export const KNOWN: readonly Known[] = [
  { line: "Ship notes go to Dana, not the channel", short: "Ship notes go to Dana" },
  { line: "Deploys are Thursdays", short: "Deploys are Thursdays" },
  { line: "Fridays are for review, not shipping", short: "Fridays are for review" },
  { line: "Deploys are Tuesdays now", short: "Deploys are Tuesdays now" },
  { line: "Standup used to be 9:30", short: "Standup was 9:30" },
  { line: "Invoices went to the old address", short: "Invoices, old address" },
  { line: "Logo files live in the brand folder", short: "Logos, brand folder" },
];

/**
 * Authored message-bar widths per conversation in the record, percent of the
 * block. A row of nine that reads as nine different conversations has to be
 * uneven, and an uneven row still has to be deterministic — never rolled.
 */
export const CHATTER: readonly (readonly number[])[] = [
  [78, 52, 66],
  [58, 84, 44],
  [70, 40, 80],
  [46, 76, 60],
  [82, 56, 48],
  [64, 88, 54],
  [50, 68, 82],
  [74, 46, 62],
  [60, 80, 50],
];

export const COPY = {
  intro: {
    eyebrow: "Tidier over time, never emptier",
    heading: "Nothing is",
    gradient: "ever lost",
  },
  /** The three zones, named on the field itself. */
  zones: {
    inUse: "in use",
    kept: "still here, just not in the way",
    keptShort: "still here",
    record: "every conversation, kept",
    recordShort: "every conversation",
  },
  /** Marks that land on a card. Never a status, never a verdict. */
  chips: {
    /** On the one that just stopped being recalled. */
    stillHere: "still here",
    /** On the one she names — and does not touch. */
    firstQuiet: "would go quiet first",
    firstQuietShort: "goes quiet first",
    /** The answer to the chip above, on the same card, one beat later. */
    untouched: "left where it is",
  },
  /**
   * What she says, on the line between in use and still here. One short
   * clause per act — she is narrating her own housekeeping, and the last
   * thing she says is the promise the section exists to make.
   */
  caption: {
    open: "All of it, kept",
    cited: "And where I heard each one",
    newConvo: "You said something new here",
    learned: "So now I work from this",
    quiet: "The older one is out of date",
    descend: "It stops coming up",
    settled: "Still here. Still readable.",
    linked: "Still joined to its source",
    announce: "This would go quiet first",
    left: "And I am leaving it there",
    hold: "Nothing here is thrown away",
  },
} as const;
