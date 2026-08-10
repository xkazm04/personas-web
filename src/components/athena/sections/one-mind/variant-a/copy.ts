// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 6 ("One mind"), variant A — the closing section.
 *
 * The rule this file exists to keep: a visitor must be able to read the scene
 * without being taught anything. So the conversations are named the way a
 * person names their own, every line is a sentence someone would actually
 * type, and the thing she learns is one small concrete fact in plain words.
 * Athena is only ever "she" or "Athena".
 *
 * The fact appears three times — said in one conversation, at rest in what she
 * knows, and used in a conversation that was never told it — and the wording
 * is deliberately near-identical each time so a viewer can point at it and
 * follow it. That single chain is the whole argument of the section.
 *
 * The compact layout renders the first three conversations, so the one that is
 * told (index 0) and the one that answers (index 2) survive every breakpoint.
 */

export type Speaker = "you" | "her";

/** Which beat of the clock puts a line on screen. */
export type Beat = "opening" | "learn" | "kept" | "ask" | "answer";

/** How a conversation reads when nothing is happening in it. */
export type StateKey = "you" | "working" | "quiet" | "home";

export interface Line {
  from: Speaker;
  text: string;
  at: Beat;
  /** The run inside `text` that IS the fact. Highlighted identically in the
   *  conversation it was told in and the one that later answers with it. */
  fact?: string;
}

export interface Conversation {
  subject: string;
  state: StateKey;
  lines: readonly Line[];
}

/** The conversation you tell the new thing to. */
export const TOLD = 0;
/** The conversation that later answers with it, having never been told. */
export const ASKED = 2;

export const CONVERSATIONS: readonly Conversation[] = [
  {
    subject: "Payments launch",
    state: "you",
    lines: [
      { from: "you", text: "Can we go live Thursday?", at: "opening" },
      { from: "her", text: "Checks done Wednesday.", at: "opening" },
      {
        from: "you",
        text: "We ship on Thursdays now.",
        at: "learn",
        fact: "We ship on Thursdays",
      },
      { from: "her", text: "Got it.", at: "kept" },
    ],
  },
  {
    subject: "Support backlog",
    state: "working",
    lines: [
      { from: "you", text: "Sort by what is broken.", at: "opening" },
      { from: "her", text: "Working — 40 left.", at: "opening" },
    ],
  },
  {
    subject: "Launch note",
    state: "quiet",
    lines: [
      { from: "you", text: "Draft the launch note.", at: "opening" },
      { from: "her", text: "Drafted. Want it shorter?", at: "opening" },
      { from: "you", text: "When should it go out?", at: "ask" },
      {
        from: "her",
        text: "Wednesday — you ship Thursdays.",
        at: "answer",
        fact: "you ship Thursdays",
      },
    ],
  },
  {
    subject: "Odds and ends",
    state: "home",
    lines: [
      { from: "you", text: "Remind me to renew the domain.", at: "opening" },
      { from: "her", text: "Noted. Nothing else is waiting.", at: "opening" },
    ],
  },
];

/** What she already knew before this loop started. The compact field shows
 *  fewer of them; the sentence the section makes is true of both. */
export const KNOWN = [
  "Nadia approves spend",
  "Design review is Monday",
  "Support hours end at six",
] as const;

/** The new thing — the same words in the conversation, in flight, and at rest. */
export const LEARNED = "We ship on Thursdays";

export const COPY = {
  intro: {
    eyebrow: "As many conversations as you like",
    heading: "She is the same person in",
    gradient: "every one",
  },
  memory: {
    label: "Everything she knows",
    shared: "every conversation draws on this",
  },
  /** The chip on a conversation — what it is doing while you are not in it. */
  state: {
    you: "your turn",
    working: "working",
    quiet: "quiet",
    home: "anything else",
    here: "she is here",
    caught: "caught up",
    answered: "answered",
  },
  /** Under the answer she gave in a conversation that was never told. */
  mark: "learned in another conversation",
  markShort: "learned elsewhere",
} as const;
