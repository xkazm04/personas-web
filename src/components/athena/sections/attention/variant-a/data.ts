// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for section 2 ("Your attention, protected"),
// variant A "Focus, kept". Benefit-first: the story is the visitor's day
// surviving intact — no product-internal vocabulary anywhere.

import type { BrandKey } from "@/lib/brand-theme";

export const COPY = {
  eyebrow: "Your attention, protected",
  headline: "Deep work survives.",
  subline:
    "No popups. No toasts. Athena holds everything and tells you when you surface — not before.",
  /** The one annotation-voice garnish allowed in the copy zone. */
  garnish: "held · 7 — nothing dropped",
  /** Counter chip beside the calm glow in the illustration. */
  counter: "7 held for later",
  sceneAria:
    "Your screen mid-flow. Seven interruptions pile on top of the work, then lift off one by one and stream into a single calm glow at the screen's edge. The work area heals, typing resumes, and a counter reads: 7 held for later.",
} as const;

/**
 * The seven interruptions that erupt over the visitor's screen. Illustration
 * copy, but user-visible — extract with the rest. Order matches SPOTS in
 * geometry.ts (same index, same card).
 */
export const NOTIFICATIONS: readonly {
  title: string;
  sub: string;
  tone: BrandKey;
}[] = [
  { title: "Update available", sub: "Restart now?", tone: "amber" },
  { title: "Are you still there?", sub: "Session expiring soon", tone: "rose" },
  { title: "3 new mentions", sub: "@you in #general", tone: "purple" },
  { title: "Meeting in 15 min", sub: "Join early?", tone: "blue" },
  { title: "Storage almost full", sub: "Upgrade today", tone: "amber" },
  { title: "New login detected", sub: "Verify it's you", tone: "rose" },
  { title: "Sync failed", sub: "Tap to retry", tone: "purple" },
];
