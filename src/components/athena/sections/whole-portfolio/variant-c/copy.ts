// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 5 ("Whole portfolio"), variant C.
 *
 * The rule this file exists to keep: the scene must say the emotional thing,
 * not the mechanical one. Nobody in it uses a piece of internal vocabulary,
 * nothing is called a metric, a check-run or a health score, and Athena is
 * only ever "Athena". The projects are the ordinary things a person owns and
 * is a bit proud of, named the way they would name them.
 *
 * The finding is the payload: it has to be SPECIFIC (a real number, a real
 * date), plain enough to read at a glance, and it has to name the thing that
 * makes this section worth building — that nothing broke, so nothing shouted,
 * and it slid anyway.
 */

export const COPY = {
  intro: {
    eyebrow: "While you were somewhere else",
    heading: "Nothing fades",
    gradient: "unnoticed",
  },
  /** Six things you own. Index 2 is the one this is about. */
  projects: [
    "Docs site",
    "Billing sync",
    "Onboarding emails",
    "Support triage",
    "Weekly digest",
    "Release notes",
  ],
  /** How long since you last looked — the subject of the whole scene, in
   *  words, whispered under the light while it cools. */
  elapsed: [
    "",
    "one week since you looked",
    "two weeks since you looked",
    "three weeks since you looked",
    "four weeks since you looked",
    "five weeks since you looked",
    "six weeks since you looked",
  ],
  elapsedShort: ["", "1 week", "2 weeks", "3 weeks", "4 weeks", "5 weeks", "6 weeks"],
  /** What she brings you. */
  finding: {
    /** Why this one and not another — worst first, said as a person would. */
    eyebrow: "This one first",
    lead: "Delivery slid from 98% to 61% since June.",
    /** The definition of drift, in a sentence nobody needs explained. */
    drift: "No single day looked wrong.",
    /** Only the two that are not fine. The rest stay where they were. */
    rows: [
      { label: "Delivered", value: "61%" },
      { label: "Bounces", value: "up 4x" },
    ],
    fine: "Four other checks on this one are fine.",
    resolved: "Back to 98%.",
    watching: "Still being watched.",
  },
} as const;
