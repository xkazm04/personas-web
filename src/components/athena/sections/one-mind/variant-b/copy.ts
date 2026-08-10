// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 6 ("One mind"), variant B — "Pick it up where you
 * left it".
 *
 * The rule this file exists to keep: the visitor must be able to work out
 * what happened WITHOUT being told. So one ordinary thing gets said once, in
 * passing, inside a conversation about something else — and then two later
 * conversations, about entirely different subjects, quietly depend on it.
 * Nobody ever recaps, nobody ever says "as I mentioned", and Athena is only
 * ever Athena.
 *
 * The three subjects are deliberately three DIFFERENT words. That is the
 * whole evidence that these are separate conversations rather than one long
 * one, and it costs no explanation at all.
 *
 * The draft in the second conversation is the point of the section: it is the
 * message you would have had to type — the same words you already said — and
 * it clears itself before you ever send it.
 */

/** A run of a message. `thread` marks a run that is load-bearing later (or,
 *  downstream, a run that is only right because of something said earlier). */
export interface Run {
  t: string;
  thread?: number;
  /** Steps aside on narrow viewports, where the opening line it leans on is
   *  gone too. The remaining runs must still read as a whole sentence. */
  wideOnly?: boolean;
}

/** One message. `at` is the stage of its own conversation that it lands on. */
export interface Line {
  who: "you" | "her";
  at: "body" | "detail" | "chosen";
  runs: readonly Run[];
  wideOnly?: boolean;
}

export interface Moment {
  /** What this conversation is about. One word, different every time. */
  subject: string;
  lines: readonly Line[];
  /** The recap you would have had to type here. Only the middle conversation
   *  carries one — once is proof, twice is a gimmick. */
  draft?: string;
  /** Whether the composer is furniture at narrow widths too. Only the
   *  conversation whose draft appears in it needs to be. */
  composerOnCompact?: boolean;
}

export const MOMENTS: readonly Moment[] = [
  {
    subject: "Roadmap",
    lines: [
      { who: "you", at: "body", wideOnly: true, runs: [{ t: "Q3 roadmap looks right." }] },
      { who: "her", at: "body", wideOnly: true, runs: [{ t: "Locking it in." }] },
      {
        who: "you",
        at: "detail",
        runs: [
          { t: "Also — ", wideOnly: true },
          { t: "I'm out from the 12th", thread: 0 },
          { t: ". " },
          { t: "Dana", thread: 1 },
          { t: "'s covering." },
        ],
      },
      { who: "her", at: "chosen", runs: [{ t: "Noted." }] },
    ],
  },
  {
    subject: "Release",
    composerOnCompact: true,
    draft: "I'm out from the 12th, Dana's—",
    lines: [
      { who: "you", at: "body", runs: [{ t: "When should we cut it?" }] },
      {
        who: "her",
        at: "detail",
        runs: [{ t: "The 10th — " }, { t: "out before you go", thread: 0 }, { t: "." }],
      },
    ],
  },
  {
    subject: "Handover",
    lines: [
      { who: "you", at: "body", runs: [{ t: "Anything left to hand over?" }] },
      {
        who: "her",
        at: "detail",
        runs: [{ t: "Just the release sign-off. " }, { t: "Dana", thread: 1 }, { t: " has it." }],
      },
      { who: "you", at: "chosen", wideOnly: true, runs: [{ t: "Perfect." }] },
    ],
  },
];

export const COPY = {
  intro: {
    eyebrow: "However many conversations you keep",
    heading: "You only say it",
    gradient: "once",
  },
  /** The composer, empty, in every conversation — ordinary furniture, which
   *  is exactly why the draft appearing in one of them lands. */
  composer: "Message Athena",
  /** The closing mark. Not a claim about her; a fact about what never
   *  happened to you. */
  close: "never asked you twice",
  closeShort: "never asked twice",
} as const;
