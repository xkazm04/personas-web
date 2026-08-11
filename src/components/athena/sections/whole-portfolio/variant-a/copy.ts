/**
 * The structural half of section 5 ("Whole portfolio"), variant A: how many
 * health dimensions a project carries, which of them are not fine, and which
 * plot the camera descends to. Every word lives in `src/i18n` under
 * `athenaPage.portfolio`.
 *
 * The rule the words there keep, recorded here because this is where the next
 * editor will look: a visitor must be able to read the scene without being
 * taught anything. The plots are named the way a person names their own
 * projects, the health dimensions are the words that project's own team would
 * use, and the finding is a sentence a colleague would actually say out loud.
 * Athena is only ever "Athena".
 *
 * `athenaPage.portfolio.projects` must stay in lockstep with `PROJECTS` below
 * — same length, same order. The compact layout renders the first 8, so the
 * three that need attention are all inside that slice and the field says
 * "three need you" at every breakpoint.
 */

export interface Project {
  /** Indices of the health dimensions that are NOT fine. Most carry none. */
  bad: readonly number[];
}

/** How many health dimensions every project carries. */
export const DIMS = 7;

/** The one the camera descends to. */
export const WORST = 7;

export const PROJECTS: readonly Project[] = [
  { bad: [] },
  { bad: [] },
  { bad: [4] },
  { bad: [] },
  { bad: [] },
  { bad: [2] },
  { bad: [] },
  { bad: [1, 5] },
  { bad: [] },
  { bad: [] },
  { bad: [] },
  { bad: [] },
];

/** Authored bar heights for a plot's health strip, rotated per plot so no
 *  two parcels carry the same texture. Deterministic — never rolled. */
export const STRIP = [62, 88, 44, 100, 71, 52, 80] as const;
