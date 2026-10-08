/**
 * The connectors this section draws, as a curated slice of the real catalog
 * (`src/data/connectors.ts`), copied here so the /features chunk does not pull
 * the whole ~100 KB catalog in. `catalog.test.ts` holds every entry to its
 * catalog row (label, icon file, brand colour) and both counts to the
 * catalog's own length, so a renamed connector or a grown catalog fails the
 * unit run instead of drawing a stale logo or stating a stale number.
 *
 * Logos are the catalog's own SVGs under `/public/tools/`.
 */

export interface LogoTool {
  /** The connector's `name` in the catalog. */
  id: string;
  label: string;
  /** SVG basename in /public/tools/. */
  icon: string;
  /** Catalog brand colour; used only through color-mix (see `brandInk`). */
  color: string;
}

export const TOOLS = {
  slack: { id: "slack", label: "Slack", icon: "slack", color: "#4A154B" },
  gmail: { id: "gmail", label: "Gmail", icon: "gmail", color: "#EA4335" },
  github: { id: "github", label: "GitHub", icon: "github", color: "#1F2937" },
  linear: { id: "linear", label: "Linear", icon: "linear", color: "#5E6AD2" },
  notion: { id: "notion", label: "Notion", icon: "notion", color: "#000000" },
  google_drive: { id: "google_drive", label: "Google Drive", icon: "google-drive", color: "#1FA463" },
  jira: { id: "jira", label: "Jira", icon: "jira", color: "#0052CC" },
  figma: { id: "figma", label: "Figma", icon: "figma", color: "#F24E1E" },
  stripe: { id: "stripe", label: "Stripe", icon: "stripe", color: "#635BFF" },
  postgres: { id: "postgres", label: "PostgreSQL", icon: "postgres", color: "#336791" },
  discord: { id: "discord", label: "Discord", icon: "discord", color: "#5865F2" },
  hubspot: { id: "hubspot", label: "HubSpot", icon: "hubspot", color: "#FF7A59" },
  linkedin: { id: "linkedin", label: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
  microsoft_teams: { id: "microsoft_teams", label: "Microsoft Teams", icon: "microsoft-teams", color: "#6264A7" },
  telegram: { id: "telegram", label: "Telegram", icon: "telegram", color: "#26A5E4" },
  x_twitter: { id: "x_twitter", label: "X (Twitter)", icon: "x-twitter", color: "#000000" },
} satisfies Record<string, LogoTool>;

export type ToolKey = keyof typeof TOOLS;

/** The size of the whole catalog: `connectors.length`, pinned by the test. */
export const CONNECTOR_COUNT = 125;

/** The reach plate under the cartridges: a recognisable cross-section, one or two per category. */
export const REACH_TOOLS: ToolKey[] = [
  "slack", "gmail", "github", "linear", "notion", "google_drive",
  "jira", "figma", "stripe", "postgres", "discord", "hubspot",
];

/** The channels the Twin mirrors one message into, and the ones it could also reach. */
export const TWIN_CHANNELS = ["slack", "gmail", "linkedin"] as const satisfies readonly ToolKey[];
export const TWIN_MORE_CHANNELS = ["microsoft_teams", "telegram", "discord", "x_twitter"] as const satisfies readonly ToolKey[];

/**
 * A brand colour pulled toward the theme's text colour, so near-black brands
 * still read on dark themes and pale ones on light themes.
 */
export function brandInk(tool: LogoTool, pct = 62): string {
  return `color-mix(in oklab, ${tool.color} ${pct}%, var(--foreground))`;
}
