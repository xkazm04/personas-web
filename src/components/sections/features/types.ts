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

export interface Feature {
  icon: LucideIcon;
  /**
   * Single source of truth for this feature's color identity.
   * Resolves to icon bg/text/ring/glow via ACCENT_ICON_CLASSES from
   * @/lib/brand-theme.
   */
  accent: BrandAccent;
  number: string;
  title: string;
  proof: string;
  description: string;
  visual: ReactNode;
  guideTopics: GuideTopicRef[];
}
