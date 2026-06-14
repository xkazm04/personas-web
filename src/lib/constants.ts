/* ── Landing page section registry (single source of truth) ──────── */

export interface LandingSection {
  id: string;
  label: string;
  /** Show in the Navbar active-section badge. Default: true */
  navbar?: boolean;
  /** Show in the scroll-map side dots. Default: true */
  scrollMap?: boolean;
}

export const LANDING_SECTIONS: LandingSection[] = [
  { id: "hero", label: "Hero" },
  { id: "use-cases", label: "Tools" },
  { id: "playground-split", label: "Agent Mind" },
  { id: "get-started", label: "Get Started" },
  { id: "pipelines", label: "Orchestration" },
  { id: "team-canvas", label: "Team Canvas" },
  { id: "companion", label: "Companion" },
  { id: "vision", label: "Platform" },
  { id: "pricing", label: "Compare" },
  { id: "faq", label: "FAQ" },
  { id: "download", label: "Download" },
];

/** Sections shown in the Navbar badge (navbar !== false). */
export const NAVBAR_SECTIONS = LANDING_SECTIONS.filter((s) => s.navbar !== false);

/** Sections shown in the scroll-map dots (scrollMap !== false). */
export const SCROLL_MAP_SECTIONS = LANDING_SECTIONS.filter((s) => s.scrollMap !== false);

export const COOKIE_CONSENT_KEY = "personas-cookie-consent";

export const DASHBOARD_LAST_VISIT_KEY = "personas-dashboard-last-visit";

export const KNOWLEDGE_VIEW_KEY = "personas-dashboard-knowledge-view";

export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/personas";

// Categorical chart palette lives in the chart theme module (single source
// of truth for chart tokens). Re-exported here for backward compatibility.
export { CHART_PALETTE as CHART_COLORS } from "@/lib/chart-theme";
