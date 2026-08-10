// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 6 ("One mind"), variant C — "The Return".
 *
 * This is the last section of the page, so the rule this file keeps is
 * stricter than usual: nothing here may teach a visitor a word they did not
 * already have. Conversations are named the way a person names their own
 * ("Monday review", "Getting set up"), a claim is a sentence a colleague
 * would say out loud, and the source beside it is simply where she heard it.
 * Athena is only ever "Athena", or "she".
 *
 * Three of the conversations are the page's own earlier sections, seen from
 * far enough away to be texture rather than detail — the workspace she set up
 * with you, the team she built out of one sentence, the projects she keeps in
 * view. They are the three she answers FROM, which is the closing argument:
 * everything this page showed you, she was holding the whole time.
 */

/** Which miniature a conversation carries. Three are callbacks; the rest are
 *  the ordinary texture of a thread you have been typing in. */
export type Glyph = "team" | "portfolio" | "workspace" | "talk";

export interface Conversation {
  name: string;
  /** For the source chip on narrow viewports. */
  short: string;
  glyph: Glyph;
}

/**
 * The compact layout renders the first four, so the three she answers from
 * are the first three — the section makes the same argument at every
 * breakpoint.
 */
export const CONVERSATIONS: readonly Conversation[] = [
  { name: "The rewrite", short: "The rewrite", glyph: "team" },
  { name: "Monday review", short: "Monday", glyph: "portfolio" },
  { name: "Getting set up", short: "Setup", glyph: "workspace" },
  { name: "The outage", short: "Outage", glyph: "talk" },
  { name: "The pricing page", short: "Pricing", glyph: "talk" },
  { name: "Invoices", short: "Invoices", glyph: "talk" },
];

/** Which conversation each line of her answer came from. */
export const SOURCE_OF = [0, 1, 2] as const;

/** Authored message-bar widths per conversation, percent of the card. A
 *  thread has to look lived-in, and a rolled width is not deterministic. */
export const CHATTER: readonly (readonly number[])[] = [
  [72, 46],
  [58, 80],
  [66, 40],
  [50, 74],
  [78, 52],
  [62, 44],
];

export const COPY = {
  /** The page's last word, so it is also its shortest. The locked sections
   *  all carry a one-line headline and the art gets the height — a closing
   *  title that wrapped to three lines would be taking room from the frame
   *  the page is meant to end on. */
  intro: {
    eyebrow: "However many conversations",
    heading: "Always the",
    gradient: "same person",
  },
  /** The conversation the visitor is standing in. */
  open: {
    label: "this conversation",
    question: "What else are we working on?",
    from: "from",
    footer: "Nothing else needs you today.",
    footerShort: "Nothing else needs you.",
  },
  /**
   * Her answer. One fact per line, and every line has somewhere it came from
   * — which is why the sources are geometry (see ./layout) and not a
   * footnote.
   *
   * No claim may name its own source. "The rewrite passed its last check —
   * from The rewrite" reads as a label repeating itself; the fact belongs to
   * the line and the place she heard it belongs to the chip, and it is the
   * pair that makes the point.
   */
  rows: [
    {
      claim: "The last check passed about an hour ago",
      short: "Last check passed",
    },
    {
      claim: "Two projects are waiting on you, neither urgent",
      short: "2 waiting, none urgent",
    },
    {
      claim: "Your calendar still isn't connected",
      short: "Calendar not connected",
    },
  ],
} as const;
