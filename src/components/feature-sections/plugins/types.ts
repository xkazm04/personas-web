import type { LucideIcon } from "lucide-react";
import type { ShowcaseKey } from "./roster";

/**
 * A showcased plugin's key. Derived from the roster, whose keys must be
 * `shipped` in the desktop manifest (src/data/desktop-plugins.ts), so a removed
 * plugin is a type error here rather than a tab on the page.
 */
export type PluginKey = ShowcaseKey;

export interface VariantDef {
  key: string;
  label: string;
  blurb: string;
  component: React.ComponentType;
}

export interface PluginDef {
  key: PluginKey;
  label: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  /** 1 or 2 variants. When only 1, the nested switcher is hidden. */
  variants: VariantDef[];
}
