import { Sparkles, Mic, Brain, BellRing } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/**
 * Athena (the Companion) capabilities — copy verified against the desktop
 * `docs/features/companion/` feature so every claim maps to a real behavior.
 * Hardcoded EN for now (Stream-1 i18n descope; see parity-backlog EXECUTION doc).
 */

export interface Capability {
  id: string;
  /** Row title in the capability list. */
  label: string;
  /** Accent color — also tints the orb while this capability is active. */
  brand: BrandKey;
  icon: LucideIcon;
  /** Supporting detail (one real, non-aspirational sentence). */
  blurb: string;
  /** What the orb "says" while this capability is active (the morph-to-panel line). */
  line: string;
}

export const CAPABILITIES: Capability[] = [
  {
    id: "always",
    label: "Always on, never in the way",
    brand: "cyan",
    icon: Sparkles,
    blurb:
      "A floating orb lives on your desktop — her animated face is the interface. Drag it anywhere; it survives restarts and quietly pauses when you look away.",
    line: "I'm right here whenever you need me.",
  },
  {
    id: "voice",
    label: "Hold to talk",
    brand: "purple",
    icon: Mic,
    blurb:
      "Press and hold the orb to speak — voice in, voice out. Runs on-device with local Whisper, or in your browser. No chat window required.",
    line: "Hold to talk — I'm listening.",
  },
  {
    id: "memory",
    label: "Remembers what matters",
    brand: "emerald",
    icon: Brain,
    blurb:
      "Athena keeps a long-term memory of your identity, goals, and how you work — and you're the editor. She never overwrites; every change is yours to approve.",
    line: "I remember your goals and how you work.",
  },
  {
    id: "proactive",
    label: "Reaches out first",
    brand: "amber",
    icon: BellRing,
    blurb:
      "She surfaces what needs you — a goal due soon, an aging backlog, runs that failed overnight — and can even schedule her own check-ins.",
    line: "Heads up — 3 runs failed overnight.",
  },
];

export const AUTO_CYCLE_MS = 4200;
