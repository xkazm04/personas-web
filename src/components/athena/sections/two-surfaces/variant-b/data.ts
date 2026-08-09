// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for section 2, variant B — "Never Neither".
// The scene dramatizes the two-surfaces doctrine as an invariant: one
// pending decision, two complementary homes, never zero.

export const COPY = {
  eyebrow: "Two surfaces. Nothing else.",
  headline: "Never neither.",
  sub: "A pending decision is always on exactly one surface — in the chat while it's open, docked at the orb the moment it isn't.",

  /** The visitor's toy — a real switch that flips the chat window. */
  toggleAria: "Chat window — flip it and watch the decision change surfaces",
  toggleOpen: "chat open",
  toggleClosed: "chat closed",

  /** Screen-reader announcements for where the decision currently lives. */
  liveChat: "Decision shown as a card in the chat.",
  liveOrb: "Decision docked as a bubble at the orb.",

  sceneAria:
    "Demonstration: one pending decision moving between Athena's two surfaces",

  chat: {
    title: "Athena · chat",
    closedTag: "window closed",
    messages: [
      "Overnight fleet run finished — 12 commits, all green.",
      "Two low-risk fixes merged themselves. One thing needs you:",
    ],
  },

  decision: {
    title: "Dispatch 3 sessions to personas-web?",
    op: "fleet_dispatch",
    approve: "Approve",
    deny: "Deny",
  },

  orbAlt: "Athena's floating orb",

  /** The condition logic, read in the mono annotation voice like source. */
  logic: {
    chatBranch: "chat open → ChatDecisionCard",
    orbBranch: "chat closed → OrbDecisionBubble",
    sep: "·",
    invariant: "never neither",
  },

  /** Quiet counter beat — the queue itself has no off switch. */
  counterBeat: "The decision queue is always on. No setting gates it.",
} as const;
