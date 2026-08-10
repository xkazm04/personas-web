// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word (and every authored measurement) in the lasting-memory section,
 * variant E — "Every night, a little more".
 *
 * The rule this file exists to keep: a visitor must never be taught a word to
 * understand the scene. What builds up through a day is "each day's talk".
 * What she does at the end of a day that had enough in it is "sleeps on it" —
 * a phrase people already use for thinking something over. What survives is
 * "what she keeps". Athena is only ever "Athena", or "she".
 *
 * The four kept sentences are the whole point of the section: they are
 * ordinary, specific, work-shaped things a colleague would remember about you,
 * written in her own plain words. The FIRST one is deliberately the most
 * useful, because it is the one that comes back days later and does work.
 */

export const COPY = {
  /** Benefit-shaped and short, like every other title on this page: what the
   *  visitor gets out of the days, not the machinery that produced it. */
  intro: {
    eyebrow: "The longer you work together",
    heading: "The more she",
    gradient: "carries",
  },
  /** The three stages, named in the field itself, top to bottom. */
  talk: "each day's talk",
  /** On the line a day's talk has to reach before she bothers. Deliberately
   *  qualitative — the scene shows a height being met, never a number. */
  rail: "enough to sleep on",
  night: "she sleeps on it",
  shelf: "what she keeps",
} as const;

/**
 * How wide each turn in a day's talk sits, as a fraction of the column. A long
 * enough run that no two days draw the same shape (each day reads from its own
 * offset) while every full day still holds exactly the same NUMBER of turns —
 * which is the section's quiet claim: the churn is the same size every day, and
 * only the shelf underneath it ever grows.
 */
export const TURNS: readonly number[] = [
  0.62, 0.86, 0.44, 0.74, 0.55, 0.92, 0.5, 0.68, 0.6, 0.8, 0.47, 0.9, 0.58, 0.72,
];

/**
 * What she wrote down at the end of each night that ran — one plain sentence,
 * in pass order. Never a summary of the day: the durable, reusable thing she
 * now knows about how you work.
 *
 * KEPT[0] is the one that returns. It is the plainest and most operational of
 * the four on purpose — when it lights up again days later, the visitor should
 * recognise it instantly rather than re-read it.
 */
export const KEPT: readonly string[] = [
  "You ship on Thursdays.",
  "Staging is where you try things.",
  "Billing is the one you worry about.",
  "You like the short version first.",
];
