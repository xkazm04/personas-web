// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 5 ("Whole portfolio"), variant A.
 *
 * The rule this file exists to keep: a visitor must be able to read the
 * scene without being taught anything. So the plots are named the way a
 * person names their own projects, the health dimensions are the words that
 * project's own team would use, and the finding is a sentence a colleague
 * would actually say out loud. Athena is only ever "Athena".
 *
 * The compact layout renders the first 8 projects, so the three that need
 * attention are all inside that slice — the field says "three need you" at
 * every breakpoint.
 */

export interface Project {
  name: string;
  /** Indices of the health dimensions that are NOT fine. Most carry none. */
  bad: readonly number[];
}

/** How many health dimensions every project carries. */
export const DIMS = 7;

/** The one the camera descends to. */
export const WORST = 7;

export const PROJECTS: readonly Project[] = [
  { name: "Marketing site", bad: [] },
  { name: "Docs", bad: [] },
  { name: "Mobile app", bad: [4] },
  { name: "Design system", bad: [] },
  { name: "Support inbox", bad: [] },
  { name: "Data pipeline", bad: [2] },
  { name: "Admin tools", bad: [] },
  { name: "Payments API", bad: [1, 5] },
  { name: "Search service", bad: [] },
  { name: "Onboarding flow", bad: [] },
  { name: "Notifications", bad: [] },
  { name: "Internal wiki", bad: [] },
];

/** Authored bar heights for a plot's health strip, rotated per plot so no
 *  two parcels carry the same texture. Deterministic — never rolled. */
export const STRIP = [62, 88, 44, 100, 71, 52, 80] as const;

export const COPY = {
  intro: {
    eyebrow: "While you are busy elsewhere",
    heading: "Nothing quietly",
    gradient: "rots",
  },
  field: {
    needs: "needs you",
    handled: "handled",
  },
  panel: {
    badge: "worst first",
    /** Only the dimensions that are not fine. The rest are a footnote. */
    rows: [
      { name: "Dependencies", since: "quiet 11 days" },
      { name: "Nightly build", since: "red since Friday" },
    ],
    rest: "5 other checks fine",
    finding: "Payment library is 3 versions behind, one with a known hole.",
    findingShort: "3 versions behind, one with a hole.",
    action: "Open what fixes it",
    actionShort: "Open the fix",
    done: "Opened",
  },
  /** Beside her, five words at the outside. */
  caption: {
    survey: "Checking every project",
    surfaced: "Three need you",
    worst: "This one first",
    found: "Quiet for 11 days",
    opened: "Opened for you",
  },
} as const;
