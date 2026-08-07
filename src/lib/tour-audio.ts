/**
 * Leaf module for the tour's static audio paths.
 *
 * Kept OUT of `tour-script.ts` on purpose: `TourProvider` mounts on every
 * page shell and needs this one string, and importing it from the step-script
 * module would drag all four tour scripts into the above-fold chunk. The step
 * arrays themselves are loaded on demand by `TourLauncher`.
 */

/** Athena's spoken greeting, played while the intro pop-up is shown. */
export const INTRO_AUDIO_SRC = "/tour/intro.mp3";
