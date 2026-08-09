// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for section 2 — "Two surfaces. Nothing else.",
// variant C ("The Collapse"): six legacy notification panels compress into
// the single two-level attention bar; every badge count is conserved.

import type { BrandKey } from "@/lib/brand-theme";

export const COPY = {
  eyebrow: "Interface archaeology",
  headline: "Two surfaces. Nothing else.",
  sub: "Six panels became one quiet row. Chat and a floating orb — every other notification surface was deleted by written doctrine.",
  windowTitle: "athena · attention",
  ledger: "6 panels → 1 bar · every count kept",
  barAria: "Attention bar — six chips, one per retired panel",
  transcriptAria: "Chat transcript reclaiming the freed space",
} as const;

/**
 * The six competing surfaces that used to stack above the transcript.
 * Each panel's badge `count` is inherited verbatim by its chip in the
 * collapsed attention bar — the ledger line confirms conservation.
 */
export const SURFACES: readonly {
  id: string;
  label: string;
  count: number;
  peek: string;
  accent: BrandKey;
}[] = [
  { id: "blocked", label: "blocked", count: 2, peek: "2 sessions parked · needs you", accent: "rose" },
  { id: "errors", label: "errors", count: 1, peek: "1 failed run · log kept, retry queued", accent: "amber" },
  { id: "warnings", label: "warnings", count: 3, peek: "3 drift notices · none urgent", accent: "amber" },
  { id: "nudges", label: "nudges", count: 2, peek: "2 gentle reminders · when you're ready", accent: "cyan" },
  { id: "assignments", label: "assignments", count: 4, peek: "4 tasks routed to agents · running", accent: "purple" },
  { id: "activity", label: "activity", count: 12, peek: "12 events · all quiet, all logged", accent: "emerald" },
] as const;

/** Miniature transcript. `extra` messages only surface once space returns. */
export const MESSAGES: readonly { from: "athena" | "you"; text: string; extra: boolean }[] = [
  { from: "athena", text: "Morning. Three things actually need you — the rest can wait.", extra: false },
  { from: "you", text: "Show me the blocked ones.", extra: false },
  { from: "athena", text: "Two sessions parked on your approval. Everything else stays quiet.", extra: true },
  { from: "you", text: "Good. Keep it that way.", extra: true },
] as const;
