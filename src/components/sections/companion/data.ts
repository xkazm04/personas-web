import { Sparkles, Mic, Brain, BellRing } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { Translations } from "@/i18n/en";

/**
 * Athena (the Companion) capabilities — copy verified against the desktop
 * `docs/features/companion/` feature so every claim maps to a real behavior.
 * Each capability's label, blurb and line is translated copy in
 * `t.companionSection.capabilities[id]`.
 */

export type CapabilityId = keyof Translations["companionSection"]["capabilities"];

export interface Capability {
  id: CapabilityId;
  /** Accent color — also tints the orb while this capability is active. */
  brand: BrandKey;
  icon: LucideIcon;
}

export const CAPABILITIES: Capability[] = [
  {
    id: "always",
    brand: "cyan",
    icon: Sparkles,
  },
  {
    id: "voice",
    brand: "purple",
    icon: Mic,
  },
  {
    id: "memory",
    brand: "emerald",
    icon: Brain,
  },
  {
    id: "proactive",
    brand: "amber",
    icon: BellRing,
  },
];

export const AUTO_CYCLE_MS = 4200;
