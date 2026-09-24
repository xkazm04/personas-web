// ── Desktop plugin manifest ─────────────────────────────────────────
// The one authority on which plugins the Personas desktop app ships. The
// /features plugin showcase (feature-sections/plugins/roster.ts), the guide's
// Find-in-App Plugins node (guide/desktop-modules.ts) and the showcase intro
// count are all projections of this list, so a plugin cannot be sold on the
// website unless it is `shipped` here.
//
// Mirrors, on the desktop side (re-verify on every sync, and whenever
// docs/parity-backlog/PARITY-MATRIX.md is refreshed):
//   src/features/shared/chrome/sidebar/sections/PluginsSidebarNav.tsx
//     (the `allPlugins` catalog; `devOnly: true` means dev builds only)
//   CHANGELOG.md (a plugin's removal lands under "### Removed")
// `Browse` is a management surface, not a plugin, so it is not listed here.
// Order: shipped plugins sorted by label, as the desktop sidebar sorts them.
// ────────────────────────────────────────────────────────────────────

export type DesktopPluginStatus = "shipped" | "dev-only" | "removed";

export interface DesktopPlugin {
  id: string;
  label: string;
  status: DesktopPluginStatus;
  /** Where the status was read: a desktop file:line or CHANGELOG line. */
  source: string;
  /** ISO date the entry was last checked against `source`. */
  verifiedAgainst: string;
}

const CATALOG = "desktop src/features/shared/chrome/sidebar/sections/PluginsSidebarNav.tsx";

export const DESKTOP_PLUGINS = [
  { id: "dev-tools", label: "Dev Tools", status: "shipped", source: `${CATALOG}:78`, verifiedAgainst: "2026-09-23" },
  { id: "drive", label: "Drive", status: "shipped", source: `${CATALOG}:80`, verifiedAgainst: "2026-09-23" },
  { id: "obsidian-brain", label: "Obsidian Brain", status: "shipped", source: `${CATALOG}:79`, verifiedAgainst: "2026-09-23" },
  { id: "twin", label: "Twin", status: "shipped", source: `${CATALOG}:81`, verifiedAgainst: "2026-09-23" },
  { id: "scraper", label: "Scraper", status: "dev-only", source: `${CATALOG}:82 (devOnly: true)`, verifiedAgainst: "2026-09-23" },
  {
    id: "artist",
    label: "Artist",
    status: "removed",
    source: "desktop CHANGELOG.md:45 [Unreleased] Removed: 'The Artist and Research Lab plugins are gone.'",
    verifiedAgainst: "2026-09-23",
  },
  {
    id: "research-lab",
    label: "Research Lab",
    status: "removed",
    source: "desktop CHANGELOG.md:45 [Unreleased] Removed: 'The Artist and Research Lab plugins are gone.'",
    verifiedAgainst: "2026-09-23",
  },
] as const satisfies readonly DesktopPlugin[];

type Entry = (typeof DESKTOP_PLUGINS)[number];

/** Ids of the plugins a release build of the desktop app ships. */
export type ShippedPluginId = Extract<Entry, { status: "shipped" }>["id"];

export type ShippedDesktopPlugin = Extract<Entry, { status: "shipped" }>;

export const SHIPPED_DESKTOP_PLUGINS: readonly ShippedDesktopPlugin[] =
  DESKTOP_PLUGINS.filter((p): p is ShippedDesktopPlugin => p.status === "shipped");
