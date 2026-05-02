import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { BrandAccent } from "@/lib/brand-theme";

export interface GuideLink {
  label: string;
  category: string;
  topic: string;
}

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
  guideTopics: GuideLink[];
}
