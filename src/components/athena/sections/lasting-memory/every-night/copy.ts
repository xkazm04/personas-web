/**
 * The authored measurements of the lasting-memory section, variant E — "Every
 * night, a little more". Every word lives in `src/i18n` under
 * `athenaPage.memory`.
 *
 * The rule the words there keep, recorded here because this is where the next
 * editor will look: a visitor must never be taught a word to understand the
 * scene. What builds up through a day is "each day's talk". What she does at
 * the end of a day that had enough in it is "sleeps on it" — a phrase people
 * already use for thinking something over. What survives is "what she keeps".
 * Athena is only ever "Athena", or "she".
 *
 * The four kept sentences (`athenaPage.memory.kept`) are the whole point of
 * the section: ordinary, specific, work-shaped things a colleague would
 * remember about you, written in her own plain words. The FIRST one is
 * deliberately the most useful and the most operational, because it is the one
 * that comes back days later and does work — when it lights up again the
 * visitor should recognise it instantly rather than re-read it. There is one
 * sentence per night that ran (see PASS_DAYS in `./data`).
 */

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
