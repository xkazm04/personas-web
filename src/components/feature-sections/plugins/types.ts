import type { LucideIcon } from "lucide-react";
import type { Translations } from "@/i18n/en";
import type { ShowcaseKey } from "./roster";

/**
 * A showcased plugin's key. Derived from the roster, whose keys must be
 * `shipped` in the desktop manifest (src/data/desktop-plugins.ts), so a removed
 * plugin is a type error here rather than a tab on the page.
 */
export type PluginKey = ShowcaseKey;

/** The showcase's translated copy (`t.pluginShowcase`). */
export type ShowcaseCopy = Translations["pluginShowcase"];

export interface VariantDef {
  key: string;
  label: string;
  blurb: string;
  component: React.ComponentType;
}

export interface PluginDef {
  key: PluginKey;
  /** A product name (Dev Tools, Brain), shown untranslated. */
  label: string;
  /** Which translated tagline (`t.pluginShowcase.taglines`) the header shows. */
  taglineKey: keyof ShowcaseCopy["taglines"];
  icon: LucideIcon;
  color: string;
  /** 1 or 2 variants. When only 1, the nested switcher is hidden. */
  variants: VariantDef[];
}
