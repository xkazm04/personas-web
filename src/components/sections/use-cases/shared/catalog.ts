/**
 * The tools the use-case animations choose between: a curated slice of the
 * real connector catalog (`src/data/connectors.ts`), copied here so the landing
 * chunk does not pull the whole 100 KB catalog in. `catalog.test.ts` holds every
 * entry to its catalog row (label, icon file, brand colour), so a renamed or
 * removed connector fails the unit run instead of drawing a stale logo.
 *
 * Glyphs are the catalog's own monochrome brand SVGs under `/public/tools/`.
 */

export interface LabTool {
  /** The connector's `name` in the catalog. */
  id: string;
  label: string;
  /** SVG basename in /public/tools/. */
  icon: string;
  /** Catalog brand colour; used only through color-mix tints. */
  color: string;
}

export const TOOLS = {
  gmail: { id: "gmail", label: "Gmail", icon: "gmail", color: "#EA4335" },
  microsoft_outlook: { id: "microsoft_outlook", label: "Microsoft Outlook", icon: "microsoft-outlook", color: "#0078D4" },
  slack: { id: "slack", label: "Slack", icon: "slack", color: "#4A154B" },
  microsoft_teams: { id: "microsoft_teams", label: "Microsoft Teams", icon: "microsoft-teams", color: "#6264A7" },
  discord: { id: "discord", label: "Discord", icon: "discord", color: "#5865F2" },
  telegram: { id: "telegram", label: "Telegram", icon: "telegram", color: "#26A5E4" },
  notion: { id: "notion", label: "Notion", icon: "notion", color: "#000000" },
  obsidian: { id: "obsidian", label: "Obsidian", icon: "obsidian", color: "#7C3AED" },
  confluence: { id: "confluence", label: "Confluence", icon: "confluence", color: "#172B4D" },
  sharepoint: { id: "sharepoint", label: "SharePoint", icon: "sharepoint", color: "#038387" },
  airtable: { id: "airtable", label: "Airtable", icon: "airtable", color: "#18BFFF" },
  google_calendar: { id: "google_calendar", label: "Google Calendar", icon: "google-calendar", color: "#4285F4" },
  microsoft_calendar: { id: "microsoft_calendar", label: "Microsoft Outlook Calendar", icon: "microsoft-calendar", color: "#0078D4" },
  calendly: { id: "calendly", label: "Calendly", icon: "calendly", color: "#006BFF" },
  cal_com: { id: "cal_com", label: "Cal.com", icon: "cal-com", color: "#292929" },
  linear: { id: "linear", label: "Linear", icon: "linear", color: "#5E6AD2" },
  jira: { id: "jira", label: "Jira", icon: "jira", color: "#0052CC" },
  asana: { id: "asana", label: "Asana", icon: "asana", color: "#F06A6A" },
  clickup: { id: "clickup", label: "ClickUp", icon: "clickup", color: "#7B68EE" },
  monday: { id: "monday", label: "Monday.com", icon: "monday", color: "#FF3D57" },
  github: { id: "github", label: "GitHub", icon: "github", color: "#1F2937" },
  gitlab: { id: "gitlab", label: "GitLab", icon: "gitlab", color: "#FC6D26" },
  azure_devops: { id: "azure_devops", label: "Azure DevOps", icon: "azure-devops", color: "#0078D7" },
  circleci: { id: "circleci", label: "CircleCI", icon: "circleci", color: "#343434" },
  stripe: { id: "stripe", label: "Stripe", icon: "stripe", color: "#635BFF" },
  lemonsqueezy: { id: "lemonsqueezy", label: "Lemon Squeezy", icon: "lemonsqueezy", color: "#FFC233" },
  ramp: { id: "ramp", label: "Ramp", icon: "ramp", color: "#FFCD1C" },
  woocommerce: { id: "woocommerce", label: "WooCommerce", icon: "woocommerce", color: "#96588A" },
  // Never chosen: the rest of the field the persona could have reached for.
  hubspot: { id: "hubspot", label: "HubSpot", icon: "hubspot", color: "#FF7A59" },
  attio: { id: "attio", label: "Attio", icon: "attio", color: "#4F46E5" },
  pipedrive: { id: "pipedrive", label: "Pipedrive", icon: "pipedrive", color: "#017737" },
  google_drive: { id: "google_drive", label: "Google Drive", icon: "google-drive", color: "#1FA463" },
  dropbox: { id: "dropbox", label: "Dropbox", icon: "dropbox", color: "#0061FF" },
  onedrive: { id: "onedrive", label: "OneDrive", icon: "onedrive", color: "#0078D4" },
  figma: { id: "figma", label: "Figma", icon: "figma", color: "#F24E1E" },
  canva: { id: "canva", label: "Canva", icon: "canva", color: "#00C4CC" },
  sentry: { id: "sentry", label: "Sentry", icon: "sentry", color: "#362D59" },
  posthog: { id: "posthog", label: "PostHog", icon: "posthog", color: "#F9BD2B" },
  mixpanel: { id: "mixpanel", label: "Mixpanel", icon: "mixpanel", color: "#7856FF" },
  supabase: { id: "supabase", label: "Supabase", icon: "supabase", color: "#3ECF8E" },
  zapier: { id: "zapier", label: "Zapier", icon: "zapier", color: "#FF4A00" },
  google_sheets: { id: "google_sheets", label: "Google Sheets", icon: "google-sheets", color: "#34A853" },
  sendgrid: { id: "sendgrid", label: "SendGrid", icon: "sendgrid", color: "#1A82E2" },
  resend: { id: "resend", label: "Resend", icon: "resend", color: "#000000" },
  twilio_sms: { id: "twilio_sms", label: "Twilio", icon: "twilio", color: "#F22F46" },
} satisfies Record<string, LabTool>;

export type ToolKey = keyof typeof TOOLS;

/** One job the persona meets: the need (copy key), the tools that could do it, the one it picks. */
export interface LabCase {
  need: NeedKey;
  candidates: ToolKey[];
  chosen: ToolKey;
}

export type NeedKey = "reach" | "notes" | "book" | "track" | "code" | "pay";

/** The scripted sequence, in play order. Candidates are in display order; the chosen one is never first. */
export const CASES: LabCase[] = [
  { need: "reach", candidates: ["slack", "microsoft_outlook", "gmail", "microsoft_teams", "discord", "telegram"], chosen: "gmail" },
  { need: "notes", candidates: ["obsidian", "confluence", "notion", "sharepoint", "airtable"], chosen: "notion" },
  { need: "book", candidates: ["calendly", "microsoft_calendar", "google_calendar", "cal_com"], chosen: "google_calendar" },
  { need: "track", candidates: ["jira", "asana", "linear", "clickup", "monday"], chosen: "linear" },
  { need: "code", candidates: ["gitlab", "github", "azure_devops", "circleci"], chosen: "github" },
  { need: "pay", candidates: ["lemonsqueezy", "ramp", "stripe", "woocommerce"], chosen: "stripe" },
];

/** Tools in the field that no case ever considers. */
export const BYSTANDERS: ToolKey[] = [
  "hubspot", "attio", "pipedrive", "google_drive", "dropbox", "onedrive", "figma", "canva", "sentry",
  "posthog", "mixpanel", "supabase", "zapier", "google_sheets", "sendgrid", "resend", "twilio_sms",
];

/** Tint a catalog brand colour for a theme-safe fill. */
export function brandTint(tool: LabTool, pct: number): string {
  return `color-mix(in srgb, ${tool.color} ${pct}%, transparent)`;
}

/**
 * A brand colour pulled toward the theme's text colour, so near-black brands
 * (Notion, GitHub) still read on dark themes and pale ones on light themes.
 */
export function brandInk(tool: LabTool, pct = 62): string {
  return `color-mix(in oklab, ${tool.color} ${pct}%, var(--foreground))`;
}
