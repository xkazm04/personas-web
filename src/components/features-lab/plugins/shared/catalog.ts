import { categories, connectors } from "@/data/connectors";

/**
 * The real connector catalog (src/data/connectors.ts), read as-is: the counts
 * the variants state are derived from it, and every logo is the catalog row's
 * own SVG under /public/tools/. Prototype note: this imports the whole catalog;
 * a promoted variant should take a curated slice with a contract test, as the
 * landing's use-cases catalog does.
 */

export interface LogoTool {
  id: string;
  label: string;
  /** SVG basename in /public/tools/. */
  icon: string;
  category: string;
}

/** Catalog rows that carry a brand mark (a few built-ins have none). */
export const LOGO_TOOLS: LogoTool[] = connectors
  .filter((c) => c.icon !== undefined)
  .map((c) => ({ id: c.name, label: c.label, icon: c.icon as string, category: c.category }));

export const CONNECTOR_COUNT = connectors.length;
export const CATEGORY_COUNT = categories.length;

const BY_ID = new Map(LOGO_TOOLS.map((t) => [t.id, t]));

/** Look tools up by catalog `name`; an id the catalog lacks is dropped, never drawn. */
export function pickTools(ids: readonly string[]): LogoTool[] {
  return ids.flatMap((id) => {
    const tool = BY_ID.get(id);
    return tool ? [tool] : [];
  });
}

/** A recognisable cross-section of the catalog, one or two per category. */
export const FEATURED_IDS = [
  "slack", "gmail", "github", "linear", "notion", "google_drive", "jira", "figma",
  "stripe", "postgres", "discord", "hubspot", "sentry", "vercel", "airtable", "google_calendar",
  "dropbox", "telegram", "gitlab", "supabase", "posthog", "confluence", "asana", "zapier",
] as const;
