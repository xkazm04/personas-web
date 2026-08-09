// PROTOTYPE COPY — extract to src/i18n at assembly

export const COPY = {
  eyebrow: "Athena — hold to talk",
  headline: "Summon her like you will every morning.",
  sub: "The same gesture, every platform: hold 220 ms, speak, release.",
  ctaPrimary: "Get early access",
  ctaSecondary: "See the gesture grammar",
  statWhisper: "hold_to_talk · 220 ms arm · drag cancels · quick replies 1–6",
  promptIdle: "press and hold",
  promptTooQuick: "too quick — hold to speak",
  promptListening: "listening",
  promptThinking: "thinking",
  promptReducedStatic: "she answers when you call",
  resetLabel: "hold again",
  orbAria: "Summon Athena — press and hold, or hold Space",
  youSaidLabel: "you",
  replyLabel: "athena",
  keyHint: "number keys fire the chips",
} as const;

/** The sentence the visitor "speaks" while holding — typed out as if heard. */
export const HEARD_SENTENCE = "what needs me today?";

export interface ReplyChip {
  label: string;
  /** Real desktop op name, rendered in the mono annotation voice. */
  op: string;
  /** Target node id in REPLY_TREE. */
  to: string;
}

export interface ReplyNode {
  line: string;
  chips: ReplyChip[];
}

export const REPLY_ROOT = "root";

/**
 * Tiny canned conversation tree, two levels deep. Constitution voice:
 * direct, warm, no exclamation points.
 */
export const REPLY_TREE: Record<string, ReplyNode> = {
  root: {
    line: "Two builds finished overnight. One decision waits on you.",
    chips: [
      { label: "show me", op: "open_route", to: "show" },
      { label: "dispatch the fix", op: "fleet_spawn", to: "dispatch" },
      { label: "the decision", op: "review_queue", to: "decision" },
    ],
  },
  show: {
    line: "Opening the overview. The green build shipped at 03:12; the second is holding for your review.",
    chips: [],
  },
  dispatch: {
    line: "One operator is on the failing check. I will speak up when it lands.",
    chips: [],
  },
  decision: {
    line: "Staging wants a yes or a rollback on the schema change. I can hold it while you think.",
    chips: [
      { label: "hold it", op: "timer_set", to: "hold" },
      { label: "roll it back", op: "fleet_spawn", to: "rollback" },
    ],
  },
  hold: {
    line: "Held. I will bring it back with your ten o'clock summary.",
    chips: [],
  },
  rollback: {
    line: "Rolling back. The fleet will have the migration reversed in a minute or two.",
    chips: [],
  },
};
