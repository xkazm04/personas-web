// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in the "lasting memory" section, variant A — "The Tide".
 *
 * The rule this file exists to keep: a visitor must never be taught a word to
 * understand the picture. So what she keeps is written the way a colleague
 * would say it out loud ("You ship on Thursdays"), where she heard it is
 * simply the name of a conversation, and Athena is only ever "Athena" or
 * "she". Nothing in here names a mechanism, a schedule, or a size.
 *
 * Three of the conversation names are the page's own later section's names,
 * planted here — the same threads, seen earlier.
 */

/** One pill of talk in the basin. `side` 0 is you, 1 is her; `w` is percent
 *  of the basin's inner width. Authored, never rolled — a tide has to be the
 *  same tide on every loop. */
export interface TalkRow {
  side: 0 | 1;
  w: number;
}

/** Twenty authored rows covers the fullest the basin ever gets (16) plus the
 *  three that arrive again on the way out of the loop. */
export const ROWS: readonly TalkRow[] = [
  { side: 0, w: 46 },
  { side: 1, w: 34 },
  { side: 0, w: 58 },
  { side: 1, w: 41 },
  { side: 0, w: 29 },
  { side: 1, w: 52 },
  { side: 0, w: 38 },
  { side: 1, w: 47 },
  { side: 0, w: 55 },
  { side: 1, w: 31 },
  { side: 0, w: 43 },
  { side: 1, w: 36 },
  { side: 0, w: 50 },
  { side: 1, w: 44 },
  { side: 0, w: 33 },
  { side: 1, w: 56 },
  { side: 0, w: 40 },
  { side: 1, w: 48 },
  { side: 0, w: 35 },
  { side: 1, w: 51 },
];

/**
 * What one pass leaves behind. Four of them, because "the few" has to be
 * countable at a glance — and each carries the conversation it came from,
 * which is the section's second claim and the reason every card has a thread.
 */
export interface Kept {
  label: string;
  from: string;
}

/** Deliberately short enough to survive one line at the narrowest breakpoint:
 *  the claim and the place she heard it stack, and neither ever truncates. */
export const KEPT: readonly Kept[] = [
  { label: "You ship on Thursdays", from: "The rewrite" },
  { label: "Billing is Dana's call", from: "The pricing page" },
  { label: "Short updates, no preamble", from: "Monday review" },
  { label: "Staging before every merge", from: "The outage" },
];

export const COPY = {
  intro: {
    eyebrow: "Say as much as you like",
    heading: "Her memory keeps",
    gradient: "itself",
  },
  basin: {
    /** On the line the level has to reach before anything happens. */
    threshold: "when there's enough",
    /** On the part one pass could not reach. */
    deferred: "stays for next time",
  },
  kept: {
    /** Reads as "…, from Monday review". */
    from: "from",
  },
  /** The short plain account a pass ends by writing. */
  note: {
    full: "Kept four things. Threw nothing away.",
    short: "Kept 4 · threw nothing away",
  },
  /** Beside her, five words at the outside. */
  caption: {
    quiet: "Nothing new. Nothing runs.",
    cross: "That's enough to sort.",
    reach: "The oldest part first.",
    settle: "The many become a few.",
    keep: "Each keeps its source.",
    defer: "The rest waits its turn.",
    note: "Nothing was thrown away.",
  },
} as const;
