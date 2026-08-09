// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for the "Presence" hero (variant A, round 2:
// schematic-of-a-being). Facts are verified against the desktop repo;
// keep them verbatim when extracting.
//
// TYPE FLOOR: nothing on the /athena page renders below `text-base`. Copy
// here is written to be readable at 16px in a ~180px blueprint column —
// keep labels short and facts to ~6 words. Never shrink type to fit.
//
// VISITOR VOICE: every string a visitor or a screen reader can reach names
// what she DOES FOR THEM, never how she is built. No internal vocabulary
// ("orb", op names, pixel/ms thresholds) survives into user-facing or aria
// text — code identifiers and comments below may still use it.

export const COPY = {
  eyebrow: "Your chief of staff",
  /** Landing title idiom — plain lead-in + gradient word (see SectionIntro). */
  headline: "Meet",
  headlineGradient: "Athena",
  tagline: "She says nothing when nothing needs saying.",
  persona:
    "A strategist, not a cheerful assistant — direct, opinionated, warm without performing. “Speed is not your job. Quality is.”",
  ctaPrimary: "See her work",
  ctaSecondary: "Download Personas",
  // Deliberately NOT "constitution revision 51 · 49 gated operations": those
  // are internal maturity metrics, not visitor value. Both halves here are
  // literally true — she runs on-device, and the approval gate plus the
  // autonomy dial are the user's to set. Avoid absolutes like "nothing
  // happens without your say-so": on the default setting a single spoken
  // request can dispatch work with no click in between.
  statWhisper: "Runs entirely on your machine · you decide how far she goes",
  avatarAlt: "Athena, the Personas companion",
  /** The one signature interaction — hover/tap/Enter on the orb. */
  orbAria: "Athena — press Enter and she acknowledges you",
  acknowledgeLine: "I'm listening.",
  calloutsAria: "What Athena does for you",
} as const;

/**
 * Blueprint annotation callouts — each names what the visitor GETS, tied by
 * a leader line to the part of the orb that delivers it. Keep the benefit
 * framing: earlier prototypes were rejected for reading as a spec sheet, so
 * gestures a visitor performs ("hold to speak", the summon shortcut) stay,
 * while internal thresholds and counts do not. `id` keys into
 * CALLOUT_GEOMETRY (same order, same ids) in presence-geometry.ts.
 */
export const CALLOUTS = [
  { id: "talk", label: "Talk to her", fact: "Hold to speak — no typing" },
  { id: "tasks", label: "At a glance", fact: "See what she's working on" },
  { id: "drag", label: "Your desktop", fact: "Drag her where you work" },
  { id: "summon", label: "Always ready", fact: "Cmd/Ctrl+Shift+A, from any app" },
] as const;

export type CalloutId = (typeof CALLOUTS)[number]["id"];
