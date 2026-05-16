import type { LucideIcon } from "lucide-react";

export type PluginKey =
  | "artist"
  | "dev-tools"
  | "obsidian-brain"
  | "research-lab";

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
