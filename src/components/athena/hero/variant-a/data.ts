// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for the "Presence" hero (variant A, round 2:
// schematic-of-a-being). Facts are verified against the desktop repo;
// keep them verbatim when extracting.

export const COPY = {
  eyebrow: "Your chief of staff",
  headline: "Meet Athena",
  tagline: "She says nothing when nothing needs saying.",
  persona:
    "A strategist, not a cheerful assistant — direct, opinionated, warm without performing. “Speed is not your job. Quality is.”",
  ctaPrimary: "See her work",
  ctaSecondary: "Download Personas",
  statWhisper:
    "Constitution revision 51 · 49 gated operations · runs entirely local",
  avatarAlt: "Athena, the Personas companion",
  /** The one signature interaction — hover/tap/Enter on the orb. */
  orbAria: "Athena's orb — press Enter and she acknowledges you",
  acknowledgeLine: "I'm listening.",
  calloutsAria: "Orb specification callouts",
} as const;

/**
 * Blueprint annotation callouts — real spec-sheet facts, each tied by a
 * leader line to the exact part of the orb it describes. `id` keys into
 * CALLOUT_GEOMETRY (same order, same ids) in presence-geometry.ts.
 */
export const CALLOUTS = [
  { id: "talk", label: "Push-to-talk", fact: "hold 220ms → speak" },
  { id: "tasks", label: "Task ring", fact: "5 dots · one per background task" },
  { id: "drag", label: "Reposition", fact: "drag ≥6px → relocate" },
  { id: "summon", label: "Summon", fact: "Cmd/Ctrl+Shift+A" },
] as const;

export type CalloutId = (typeof CALLOUTS)[number]["id"];
