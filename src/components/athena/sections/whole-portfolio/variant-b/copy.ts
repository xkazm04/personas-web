// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 5 ("Worst first"), variant B.
 *
 * Two rules this file exists to keep.
 *
 * First, she reports what she actually FOUND. Not "degraded", not "warning" —
 * a sentence a colleague would say out loud. Every surfaced reading therefore
 * carries its own finding, and no two are phrased from a template.
 *
 * Second, the ranking has to be arguable. The order below is not the order she
 * came across them (that is `found`), and it is not alphabetical or newest —
 * it is how much each one is about to cost you, which is the only ordering
 * worth putting a person in front of. `found` and `rank` are deliberately a
 * full shuffle of each other so every item visibly overtakes another.
 *
 * Ordinary words only. Athena is only ever "Athena".
 */

/** The portfolio. Order is the lattice's top-to-bottom order at md+. */
export const PROJECTS = [
  "Checkout API",
  "Billing service",
  "Mobile app",
  "Search index",
  "Docs site",
  "Data pipeline",
  "Admin console",
  "Auth service",
  "Email worker",
] as const;

/**
 * <md keeps six of the nine. The four that surface are all in here and in the
 * same relative order, so the beat a finding lands on is the same story at
 * both breakpoints — only the density changes.
 */
export const COMPACT_ROWS = [0, 4, 2, 5, 8, 7] as const;

export interface Finding {
  /** Index into PROJECTS. */
  project: number;
  /** Which of that project's checks is the one that is not fine. */
  col: number;
  /** The order she came across it, sweeping top to bottom. */
  found: number;
  /** 0 = the one that deserves you right now. */
  rank: number;
  /** The single dimension that is off — the rest of the row is fine. */
  dimension: string;
  /** What she actually found, in the fewest honest words. */
  short: string;
  /** How long it has been sliding, unmentioned by anything. */
  age: string;
}

export const FINDINGS: readonly Finding[] = [
  {
    project: 0,
    col: 3,
    found: 0,
    rank: 2,
    dimension: "errors",
    short: "2 in a thousand became 19",
    age: "9 days",
  },
  {
    project: 4,
    col: 6,
    found: 1,
    rank: 3,
    dimension: "links",
    short: "14 links point at pages that moved",
    age: "3 weeks",
  },
  {
    project: 5,
    col: 2,
    found: 2,
    rank: 1,
    dimension: "nightly run",
    short: "failing quietly since Tuesday",
    age: "5 days",
  },
  {
    project: 7,
    col: 5,
    found: 3,
    rank: 0,
    dimension: "certificate",
    short: "expires in six days",
    age: "3 weeks",
  },
] as const;

/** The one she opens — the worst of them. */
export const TOP = FINDINGS.find((f) => f.rank === 0) ?? FINDINGS[0];

export const COPY = {
  intro: {
    eyebrow: "She holds all of it at once",
    heading: "Your whole portfolio,",
    gradient: "worst first",
  },
  lattice: {
    title: "Everything you own",
    waiting: "nothing checked yet",
  },
  list: {
    title: "What needs you",
    /** Most days this is the entire report, and it should read like a result. */
    empty: "she has been through all of it and has not needed you",
    /** Sits under the ranks until she has sorted them. */
    unsorted: "in the order she found them",
    sorted: "in the order they will cost you",
  },
  card: {
    /** The sentence the whole section is built to earn. */
    finding: "The certificate it signs logins with expires in six days.",
    drift: "sliding for",
    action: "Take me to it",
    committed: "Opened",
  },
} as const;

/**
 * Counts read off the geometry, so the claim is never larger than the field.
 * Each has a narrow twin: below lg the lattice header has no room for the long
 * form, and the answer to that is fewer words, never smaller type.
 */
export const fmt = {
  checked: (n: number, total: number) => `${n} of ${total} checked`,
  checkedShort: (n: number, total: number) => `${n}/${total}`,
  verdict: (fine: number, bad: number) => `${fine} fine · ${bad} not`,
  verdictShort: (bad: number) => `${bad} not fine`,
  rank: (i: number) => `${i + 1}`,
} as const;
