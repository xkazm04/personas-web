// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for section 2 ("Your attention, protected"),
// variant B: "Nothing slips". Benefit-first: the visitor's day, not
// product internals.

export const COPY = {
  eyebrow: "Nothing slips",
  headline: "The one that matters always finds you.",
  subline:
    "Whether you're deep in work or away for the day, Athena carries exactly one thing to your attention — and holds the rest.",

  /** Left / before beat — a generic assistant's aftermath. */
  beforeLabel: "The usual aftermath",
  beforeCount: "47 unread",
  buriedLine: "production deploy needs a decision",
  buriedAria:
    "The one notification that matters, buried mid-pile. Hover or focus: it struggles to surface, but can't.",

  /** Right / after beat — Athena's version of the same day. */
  afterLabel: "The same day, with Athena",
  calmKicker: "Waiting for you",
  calmTitle: "Production deploy needs your go",
  calmSummary: "Staging passed 20 minutes ago. One decision, one line — ready when you are.",
  heldChip: "held · 46",
  heldNote: "Everything else, filed quietly beneath.",

  /** The single micro-interaction hint. */
  tryHint: "Try to find it in the pile —",
} as const;
