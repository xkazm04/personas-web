/**
 * The structural half of "Her workshop", variant C — "The Fence": how many
 * places the yard holds, and the type of one of them. Every word lives in
 * `src/i18n` under `athenaPage.workshop`.
 *
 * The rule the words there keep, recorded here because this is where the next
 * editor will look: nothing in this section may sound like a warning label.
 * The section's subject is a limit, and a limit described in the vocabulary of
 * limits ("blocked", "denied", "not permitted", "sandbox") turns a reason to
 * trust her into a reason to worry. Every word is the word a person would use
 * about their own workshop: the places you opened, how much she does on her
 * own, the one that waits for you. The projects are named the way anyone names
 * a project, the work the way anyone names a chore, and the jobs stay
 * deliberately unremarkable — the argument is about how MUCH can be in motion
 * inside the line, and dramatic-sounding work would quietly turn the scene into
 * a claim about what she can pull off.
 *
 * Two lengths are load-bearing. `athenaPage.workshop.beds` must hold BED_COUNT
 * entries, and `athenaPage.workshop.jobTitles` one per `JOBS` spot in `./data`
 * — the tick clock and the field layout are budgeted against both.
 */

import type { Translations } from "@/i18n/en";

/** One place you opened to her. The work only ever happens in one of these,
 *  and narrow viewports keep the `short` name, never a smaller one. */
export type Bed = Translations["athenaPage"]["workshop"]["beds"][number];

/** How many places the yard holds. */
export const BED_COUNT = 3;
