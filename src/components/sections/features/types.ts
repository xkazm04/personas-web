import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { BrandAccent } from "@/lib/brand-theme";
import type { GuideTopicRef } from "@/lib/guide-link";

/**
 * Re-export so older imports `import type { GuideLink } from "../types"`
 * continue to work; new code should import GuideTopicRef from
 * @/lib/guide-link directly.
 */
export type GuideLink = GuideTopicRef;

/**
 * Animation entrance for a feature card. Decoupled from card position
 * so reordering features doesn't silently re-shuffle entrance variants
 * (the previous gridCardVariants[i] index lookup would). The hero card
 * uses heroSlideIn directly and ignores this field.
 */
export type FeatureEntrance = "slideLeft" | "fadeUp" | "slideRight";

export interface Feature {
  icon: LucideIcon;
  /**
   * Single source of truth for this feature's color identity.
   * Resolves to icon bg/text/ring/glow via ACCENT_ICON_CLASSES from
   * @/lib/brand-theme.
   */
  accent: BrandAccent;
  /** Grid-card entrance animation. Hero card ignores this. */
  entrance: FeatureEntrance;
  number: string;
  title: string;
  proof: string;
  description: string;
  visual: ReactNode;
  guideTopics: GuideTopicRef[];
}
