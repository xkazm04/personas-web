/**
 * The structural half of section 6 ("One mind"), variant C — "The Return":
 * which miniature each conversation carries, which of them she answers from,
 * and how lived-in each thread looks. Every word lives in `src/i18n` under
 * `athenaPage.oneMind`.
 *
 * This is the last section of the page, so the rule the words there keep is
 * stricter than usual: nothing may teach a visitor a word they did not already
 * have. Conversations are named the way a person names their own ("Monday
 * review", "Getting set up"), a claim is a sentence a colleague would say out
 * loud, and the source beside it is simply where she heard it. Athena is only
 * ever "Athena", or "she".
 *
 * Three of the conversations are the page's own earlier sections, seen from far
 * enough away to be texture rather than detail — the workspace she set up with
 * you, the team she built out of one sentence, the projects she keeps in view.
 * They are the three she answers FROM, which is the closing argument:
 * everything this page showed you, she was holding the whole time. The compact
 * layout renders the first four, so those three are the first three and the
 * section makes the same argument at every breakpoint.
 *
 * `athenaPage.oneMind.conversations` must stay in lockstep with GLYPHS below —
 * same length, same order.
 */

import type { Translations } from "@/i18n/en";

/** Which miniature a conversation carries. Three are callbacks; the rest are
 *  the ordinary texture of a thread you have been typing in. */
export type Glyph = "team" | "portfolio" | "workspace" | "talk";

/** One conversation you have going — its name, and the short form the source
 *  chip wears on narrow viewports. */
export type Conversation = Translations["athenaPage"]["oneMind"]["conversations"][number];

export const GLYPHS: readonly Glyph[] = [
  "team",
  "portfolio",
  "workspace",
  "talk",
  "talk",
  "talk",
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
