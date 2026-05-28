import {
  Sparkles,
  Zap,
  GitBranch,
  ShieldCheck,
  BarChart3,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";

/**
 * Stable identity of a feature group. Doubles as the i18n key into
 * `t.compareSection.groups[id]`, where the user-facing title, tagline, and
 * concept bullets live (and get translated across all locales). Only the
 * non-translatable structure — icon, brand color, guide route — stays here.
 */
export type FeatureGroupId =
  | "agents-prompts"
  | "triggers"
  | "pipelines"
  | "credentials"
  | "monitoring"
  | "testing";

export interface FeatureGroup {
  id: FeatureGroupId;
  icon: LucideIcon;
  brand: BrandKey;
  guideHref: string;
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  { id: "agents-prompts", icon: Sparkles,     brand: "purple",  guideHref: "/guide/agents-prompts" },
  { id: "triggers",       icon: Zap,          brand: "amber",   guideHref: "/guide/triggers" },
  { id: "pipelines",      icon: GitBranch,    brand: "cyan",    guideHref: "/guide/pipelines" },
  { id: "credentials",    icon: ShieldCheck,  brand: "rose",    guideHref: "/guide/credentials" },
  { id: "monitoring",     icon: BarChart3,    brand: "blue",    guideHref: "/guide/monitoring" },
  { id: "testing",        icon: FlaskConical, brand: "emerald", guideHref: "/guide/testing" },
];
