// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word (and every authored measurement) in "The Wall" — the
 * her-workshop section, variant A.
 *
 * The rule this file exists to keep: nothing on this wall is named the way a
 * machine would name it. Each tile carries the words the person who started
 * that piece of work would use for it — "invoices", "billing", "blog post" —
 * so a visitor can read the whole wall without being taught a single term.
 * Athena is only ever "Athena", or "she".
 *
 * The verdict words are the section's spine, and they are all plain:
 *
 *   working     something is still coming out of it. That is the whole test.
 *   no output   nothing is coming out of it. An observation, not a diagnosis —
 *               which is exactly why it has to split into four.
 *   done · needs you · stuck · not sure
 *               what "no output" turns out to mean. The last one is the
 *               important one: when the evidence is thin she says so instead
 *               of picking the likeliest answer.
 */

/** What she can say about one piece of work after she has looked at it. */
export type Verdict = "working" | "noOutput" | "done" | "needsYou" | "stuck" | "unknown";

export interface Job {
  /** The work, in its owner's own words. */
  name: string;
  /** Which wave of the wall's composition this one belongs to. Authored as a
   *  diagonal across the wide grid — never rolled, never index % n. */
  wave: number;
}

/**
 * The wall. Wide fields show all of them; narrow fields show the first twelve,
 * which is why every tile the story needs lives inside that first twelve.
 */
export const JOBS: readonly Job[] = [
  { name: "tests", wave: 0 },
  { name: "signup", wave: 1 },
  { name: "notes", wave: 2 },
  { name: "invoices", wave: 0 },
  { name: "search", wave: 1 },
  { name: "docs", wave: 1 },
  { name: "changelog", wave: 2 },
  { name: "digest", wave: 0 },
  { name: "billing", wave: 1 },
  { name: "images", wave: 2 },
  { name: "prices", wave: 2 },
  { name: "blog post", wave: 0 },
  { name: "sitemap", wave: 1 },
  { name: "map tiles", wave: 2 },
  { name: "log sweep", wave: 0 },
  { name: "cache", wave: 0 },
  { name: "fonts", wave: 1 },
  { name: "photos", wave: 2 },
  { name: "links", wave: 0 },
  { name: "backups", wave: 1 },
];

/** The ones with nothing on screen when she looks — the amber bucket. */
export const QUIET: readonly number[] = [1, 3, 5, 8, 10];

/** What each of them turns out to be, in the same order. Two were simply
 *  finished, one is holding a question for a person, one really has stopped,
 *  and the last one she will not call. */
export const QUIET_INTO: readonly Verdict[] = ["done", "needsYou", "done", "stuck", "unknown"];

/** Three pieces of one job. They finish one at a time and say nothing; the
 *  announcement waits for the last of them. */
export const BATCH: readonly number[] = [2, 6, 11];

export const COPY = {
  intro: {
    eyebrow: "However much you have running",
    heading: "It still takes",
    gradient: "one look",
  },
  state: {
    working: "working",
    noOutput: "no output",
    done: "done",
    needsYou: "needs you",
    stuck: "stuck",
    unknown: "not sure",
  },
  /** The question sitting on one screen. No record of the work would ever
   *  show it — which is why what is on screen is what she goes by. */
  prompt: "Send it?",
  report: {
    /** Why it comes now and not sooner: the group waits for its slowest piece. */
    badge: "the last one just landed",
    title: "The release write-up is ready",
    /** The same three names that are on the wall, so the tie is unmistakable. */
    rows: ["notes", "changelog", "blog post"],
    footer: "one message, not three",
  },
} as const;

/**
 * Line lengths for a tile's output, as a fraction of the tile. A long enough
 * run that no two tiles ever draw the same texture, read from a per-tile
 * offset — deterministic, so a reload never reshuffles the wall.
 */
const INK: readonly number[] = [0.74, 0.42, 0.9, 0.55, 0.66, 0.36, 0.82, 0.5, 0.62, 0.88, 0.46, 0.7];

export const inkAt = (job: number, line: number): number => INK[(job * 5 + line) % INK.length];

/**
 * How long one line of output takes to come out, per tile. Authored so the
 * wall never pulses in unison — a wall of processes writing at one shared
 * rhythm would be the one thing a real machine never does.
 */
const PACE: readonly number[] = [1.7, 2.4, 1.35, 2.8, 1.95, 3.1, 1.5, 2.15];

export const paceAt = (job: number): number => PACE[job % PACE.length];
