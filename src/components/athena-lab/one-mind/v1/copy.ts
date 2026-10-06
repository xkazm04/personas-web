/**
 * The structural half of "The Return", evolved: which miniature each
 * conversation carries, how it was had (typed or spoken), how long ago, and
 * which of them she answers from. Every word lives in `src/i18n` - the
 * conversation names, question and answer are the live section's own
 * (`athenaPage.oneMind`), the medium and time labels are the lab's
 * (`athenaLab.oneMind.v1`).
 *
 * Three of the conversations are the page's own earlier sections at
 * watermark scale - the team, the portfolio, the workspace - and they are the
 * three she answers FROM. The medium tags carry the rest of the claim without
 * a sentence: some of these you typed, some you said out loud, some are from
 * last week. However you had them, they all end up in the same place.
 *
 * Lockstep: `athenaPage.oneMind.conversations`, GLYPHS, MEDIUM and WHEN are
 * the same length and order.
 */

export type Glyph = "team" | "portfolio" | "workspace" | "talk" | "voice";
export type { Medium } from "../shared/icons";
import type { Medium } from "../shared/icons";

export const GLYPHS: readonly Glyph[] = ["team", "portfolio", "workspace", "voice", "talk", "talk"];

export const MEDIUM: readonly Medium[] = ["typed", "spoken", "typed", "spoken", "typed", "typed"];

/** Which line of the lab's `when` list each conversation wears. */
export const WHEN: readonly number[] = [0, 1, 2, 3, 4, 5];

/** Which conversation each line of her answer came from. */
export const SOURCE_OF = [0, 1, 2] as const;

/** The row of her answer a conversation is quoted in, or -1. */
export const rowOf = (card: number): number => SOURCE_OF.findIndex((s) => s === card);
