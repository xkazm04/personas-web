// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word (and every authored texture) in the lasting-memory section,
 * variant D — "The Anatomy".
 *
 * The rule this file keeps: a visitor must never be taught a word to read the
 * scene. The three zones are named for what they ARE to the person watching —
 * what she is working from *right now*, what she does while *resting*, and
 * what is *kept for good* — never for the machinery underneath. Athena is only
 * ever "Athena", or "she".
 *
 * The things on the shelf are the payoff, so they are real: small, ordinary,
 * true-sounding facts and habits about the person she works with. One of them
 * goes out of date on purpose — it is not removed, it stays on the shelf and
 * stops being recalled, with its replacement landing beside it.
 */

/** One durable thing she kept. `short` is the same thing, fewer characters. */
export interface Kept {
  full: string;
  short: string;
}

/**
 * Six things, three per pass. The fifth (`ships on Tuesdays now`) supersedes
 * the second, which is why they read as a pair on the shelf: the old one is
 * still there, quiet, and the new one sits two slots along.
 */
export const KEPT: readonly Kept[] = [
  { full: "prefers short answers", short: "short answers" },
  { full: "ships on Fridays", short: "ships Fridays" },
  { full: "reviews before merging", short: "reviews first" },
  { full: "mornings for deep work", short: "deep mornings" },
  { full: "ships on Tuesdays now", short: "ships Tuesdays" },
  { full: "asks for the diff first", short: "diff first" },
];

/** How many land in one pass. Much goes in; this comes out. */
export const PER_PASS = 3;

/** The one a later pass finds out of date. Never removed — it keeps its slot
 *  and simply stops being recalled. */
export const SUPERSEDED = 1;

/** Which scrap of the conversation each kept thing came from. Every one has an
 *  answer here, and the scene lights the link when it lands: nothing reaches
 *  the shelf without one. */
export const SOURCE: readonly number[] = [1, 4, 7, 0, 3, 6];

/**
 * The texture of the working surface: authored bar widths (percent of a scrap)
 * for one generation of one scrap. Rolled values would not survive a rewind,
 * and this surface rewrites itself constantly — it has to rewrite the same way
 * every loop.
 */
export const SCRAPS: readonly (readonly number[])[] = [
  [86, 54, 30],
  [64, 88],
  [42, 74, 58, 26],
  [90, 38],
  [56, 82, 34],
  [78, 46, 62],
  [50, 90, 28],
  [70, 40, 84, 22],
];

export const COPY = {
  /** The page's landing idiom — plain lead-in, one gradient word. It carries
   *  the promise (she gets better the longer you stay) rather than naming any
   *  part of the machinery that delivers it. */
  intro: {
    eyebrow: "The longer you work together",
    heading: "The more she",
    gradient: "carries",
  },
  zones: {
    now: { label: "right now", caption: "not the record" },
    /** The middle zone is named by her STATE, which is the point: resting is a
     *  thing she does, not a gap between things she does. Two words, one
     *  pair, no ambiguity about which one is which. */
    chamber: { awake: "awake", asleep: "resting" },
    kept: { label: "kept for good", caption: "each one links back", captionShort: "links back" },
  },
  /** One caption at a time, beside her — the beat, in five words or fewer. */
  beats: {
    rest: "she rests, on her own",
    again: "hours later, again",
    much: "much in",
    little: "little kept",
    /** Deliberately NOT the shelf's own caption: two identical lines on screen
     *  at the same moment reads as a bug rather than as emphasis. */
    links: "linked to what you said",
    stale: "out of date now",
    sourced: "nothing without a source",
    noted: "she notes what she learned",
    quiet: "nothing builds up",
    more: "more than last time",
  },
  /** The one tag on the art itself. The turned-away candidate needs no tag of
   *  its own — the beat caption is already saying it at exactly that tick, and
   *  two labels for one gesture is one too many. */
  hushed: "no longer recalled",
  hushedShort: "not recalled",
} as const;
