import { Brain, Fingerprint, HardDrive, Wrench, type LucideIcon } from "lucide-react";
import { SHIPPED_DESKTOP_PLUGINS, type ShippedPluginId } from "@/data/desktop-plugins";
import type { BrandKey } from "@/lib/brand-theme";
import type { Translations } from "@/i18n/en";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/**
 * Every plugin a release build of the desktop app ships, in the order the bay
 * stacks its cartridges; each one has its own scene in the window. Keyed by the desktop manifest
 * (src/data/desktop-plugins.ts): a plugin the desktop removes is a tsc error
 * here, and its label is the manifest's own. What each one adds is copy,
 * worded from the plugin's real description (showcase taglines, and the
 * catalog rows of the connectors each plugin exposes: obsidian_memory,
 * local_drive, twin).
 */

export type LabPluginKey = ShippedPluginId;

export type LabCopyKey = "devTools" | "brain" | "drive" | "twin";

export interface LabPlugin {
  key: LabPluginKey;
  /** The desktop's own label, shown untranslated (a product name). */
  label: string;
  copyKey: LabCopyKey;
  brand: BrandKey;
  icon: LucideIcon;
}

const DEFS: Record<LabPluginKey, Omit<LabPlugin, "key" | "label">> = {
  "dev-tools": { copyKey: "devTools", brand: "cyan", icon: Wrench },
  "obsidian-brain": { copyKey: "brain", brand: "purple", icon: Brain },
  drive: { copyKey: "drive", brand: "emerald", icon: HardDrive },
  twin: { copyKey: "twin", brand: "amber", icon: Fingerprint },
};

/** Stage order. The site tour clicks `[data-plugin-key="dev-tools"]`, so it leads. */
const ORDER: readonly LabPluginKey[] = ["dev-tools", "obsidian-brain", "drive", "twin"];

export const LAB_PLUGINS: LabPlugin[] = ORDER.map((key) => ({
  key,
  label: SHIPPED_DESKTOP_PLUGINS.find((p) => p.id === key)?.label ?? key,
  ...DEFS[key],
}));

export const DEFAULT_LAB_PLUGIN: LabPluginKey = "dev-tools";

/** One-line tagline: the translated showcase copy for Dev Tools and Brain, the pending namespace for Drive and Twin. */
export function pluginTagline(t: Translations, key: LabCopyKey): string {
  if (key === "devTools" || key === "brain") return t.pluginShowcase.taglines[key];
  return featuresSectionsCopy.plugins.taglines[key];
}
