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
  { id: "playground-split", label: "Playground" },
  { id: "vision", label: "Vision" },
  { id: "pricing", label: "Compare" },
  { id: "faq", label: "FAQ" },
  { id: "download", label: "Download" },
];

/** Sections shown in the Navbar badge (navbar !== false). */
export const NAVBAR_SECTIONS = LANDING_SECTIONS.filter((s) => s.navbar !== false);

/** Sections shown in the scroll-map dots (scrollMap !== false). */
export const SCROLL_MAP_SECTIONS = LANDING_SECTIONS.filter((s) => s.scrollMap !== false);

export const CHART_COLORS = [
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
  "#34d399",
  "#fbbf24",
  "#3b82f6",
  "#ec4899",
  "#f97316",
];
