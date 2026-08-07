// PROTOTYPE COPY — extract to src/i18n at assembly
//
// Variant C — "The Quiet". Every user-facing string for the hero lives here
// so the i18n extraction pass can lift the whole file into en.ts + 13 locales.

export const COPY = {
  eyebrow: "Athena — design doctrine, article one",
  headlineLine1: "Two surfaces.",
  headlineLine2: "Nothing else.",
  sub: "Athena raises no toasts, no popovers, no corner pop-ups. By written doctrine.",
  orbCaption: "The orb — where status lives",
  chatCaption: "The chat — where conversation lives",
  chatName: "Athena",
  chatPlaceholder: "Say anything…",
  chipsCaption: "Six stacked panels became one quiet row",
  nudgeNote: "3 proactive nudges per day — fewer when you're in flow.",
  ctaPrimary: "Meet Athena",
  ctaSecondary: "Read the doctrine",
} as const;

/** The six attention chips that replaced six stacked panels. */
export const ATTENTION_CHIPS = [
  "blocked",
  "errors",
  "warnings",
  "nudges",
  "assignments",
  "activity",
] as const;

/**
 * The "before" state: UI noise that other assistants raise, and Athena
 * refuses to. Each label rides one noise card that flies into the orb or
 * the chat during the silencing sequence. Decorative — aria-hidden.
 */
export const NOISE_LABELS = [
  "New notification",
  "Update available — restart now?",
  "3 unread alerts",
  "Tip: you can also…",
  "Are you still there?",
  "Sync complete",
  "Rate your experience",
] as const;
