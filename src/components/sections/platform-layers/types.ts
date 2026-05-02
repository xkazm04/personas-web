import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { BrandKey } from "@/lib/brand-theme";

export interface Layer {
  id: string;
  label: string;
  pillar: string;
  icon: LucideIcon;
  /**
   * Single source of truth for this layer's color identity.
   * All bg/border/text/glow values are derived from this via brand-theme helpers
   * (BRAND_VAR, tint, brandShadow) so light and dark themes stay correct.
   */
  brand: BrandKey;
  description: string;
  visual: ReactNode;
}
