import {
  Building2,
  Cloud,
  Languages,
  LayoutGrid,
  Layers,
  MonitorSmartphone,
  Package,
  Plug,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { BrandKey } from "@/lib/brand-theme";
import type { Category } from "@/lib/templates";
import type { FlagKey } from "./components/FlagArt";

/**
 * The roadmap as fulfillment, not chronology: each logical area is a card,
 * each bar fills left → right with how far that slice has come. Bar motifs
 * (flags, device art, category art) sit behind the track and fade in with
 * completion — the picture literally develops as the work lands.
 *
 * Card *counts* are DERIVED from the real catalog/registry modules at build
 * time (see `roadmap-area-counts.ts`, evaluated server-side) and passed into
 * {@link buildAreas} as plain, serializable numbers — so this module never
 * imports the heavy catalogs and they never reach the client bundle, while the
 * numbers still can't drift from the shipped product. The *targets* those
 * counts fill toward are aspirational roadmap goals with no data source, so
 * they stay hand-authored here and are flagged inline.
 */

/** Serializable, build-time-derived counts injected into {@link buildAreas}. */
export interface AreaCounts {
  /** Live shipped-template count per gallery category. */
  templatesByCategory: Record<Category, number>;
  /** Total shipped templates across every category. */
  templateTotal: number;
  /** Combined count for the grouped long-tail bar (Finance · Sales · Support · Legal). */
  groupedTemplates: number;
  /** Total shipped connectors in the integration catalog. */
  connectors: number;
  /** Total shipped locales in the i18n registry. */
  localeTotal: number;
  /** Shipped-locale counts per editorial region. */
  localesByRegion: { europe: number; apac: number; southAsia: number; middleEast: number };
}

/**
 * Aspirational per-category gallery targets — the denominators the live counts
 * fill toward. These are roadmap goals with NO data source, so they are
 * hand-authored (unlike the numerators, which are derived). Keep every target
 * >= its live count so a bar never overflows (value <= 1).
 */
const TEMPLATE_TARGETS = {
  DevOps: 40,
  Productivity: 35,
  Communication: 30,
  Marketing: 25,
  Research: 20,
  Security: 20,
  grouped: 60,
  total: 210,
} as const;

const localeDetail = (n: number) => `${n} locale${n === 1 ? "" : "s"}`;

export type BarMotif =
  | { kind: "flag"; flag: FlagKey }
  | { kind: "image"; dark: string; light: string }
  | { kind: "icon"; icon: LucideIcon };

export interface AreaBarDef {
  label: string;
  /** Fulfillment 0..1. */
  value: number;
  /** Right-hand detail, e.g. "6 locales" or "13/40". */
  detail: string;
  motif?: BarMotif;
}

export interface AreaDef {
  key: string;
  title: string;
  caption: string;
  icon: LucideIcon;
  brand: BrandKey;
  /** Wide card with a headline bar + a 2-col grid of child bars. */
  wide?: boolean;
  headline?: AreaBarDef;
  bars: AreaBarDef[];
}

/**
 * Build the roadmap area cards with live counts folded in. `counts` is derived
 * server-side from the real catalogs (see `roadmap-area-counts.ts`); everything
 * else (targets, coverage %, labels, motifs, icons) is authored here.
 */
export function buildAreas(counts: AreaCounts): AreaDef[] {
  const t = counts.templatesByCategory;
  return [
    {
      key: "i18n",
      title: "Internationalization",
      // `localeTotal` renders "14" today — derived from the LANGUAGES registry.
      caption: `${counts.localeTotal} locales, hand-translated — each flag develops with coverage`,
      icon: Languages,
      brand: "cyan",
      // Per-region `detail` counts are derived; the `value` (translation
      // completeness) is hand-authored — the non-en bundles are known-incomplete,
      // so there is no clean data source for coverage %.
      bars: [
        { label: "Europe", value: 0.88, detail: localeDetail(counts.localesByRegion.europe), motif: { kind: "flag", flag: "eu" } },
        { label: "Asia-Pacific", value: 0.76, detail: localeDetail(counts.localesByRegion.apac), motif: { kind: "flag", flag: "jp" } },
        { label: "South Asia", value: 0.64, detail: localeDetail(counts.localesByRegion.southAsia), motif: { kind: "flag", flag: "in" } },
        { label: "Middle East · RTL", value: 0.58, detail: localeDetail(counts.localesByRegion.middleEast), motif: { kind: "flag", flag: "ae" } },
      ],
    },
    {
      key: "devices",
      title: "Device Support",
      caption: "Personas on every machine you own",
      icon: MonitorSmartphone,
      brand: "purple",
      bars: [
        {
          label: "Windows",
          value: 0.92,
          detail: "shipped",
          motif: { kind: "image", dark: "/imgs/get-started/platform/windows-dark.png", light: "/imgs/get-started/platform/windows-light.png" },
        },
        {
          label: "macOS",
          value: 0.55,
          detail: "in development",
          motif: { kind: "image", dark: "/imgs/get-started/platform/mac-dark.png", light: "/imgs/get-started/platform/mac-light.png" },
        },
        {
          label: "Linux",
          value: 0.45,
          detail: "in development",
          motif: { kind: "image", dark: "/imgs/get-started/platform/linux-dark.png", light: "/imgs/get-started/platform/linux-light.png" },
        },
        {
          label: "Web",
          value: 0.8,
          detail: "this site",
          motif: { kind: "image", dark: "/imgs/get-started/platform/web-dark.png", light: "/imgs/get-started/platform/web-light.png" },
        },
        {
          label: "Mobile companion",
          value: 0.25,
          detail: "preview",
          motif: { kind: "image", dark: "/imgs/get-started/platform/mobile-dark.png", light: "/imgs/get-started/platform/mobile-light.png" },
        },
      ],
    },
    {
      key: "collaboration",
      title: "Collaboration",
      caption: "From one operator to the whole org",
      icon: Users,
      brand: "emerald",
      bars: [
        { label: "Solo", value: 0.95, detail: "shipped", motif: { kind: "icon", icon: User } },
        { label: "Team", value: 0.4, detail: "shared agents", motif: { kind: "icon", icon: Users } },
        { label: "Enterprise", value: 0.15, detail: "SSO · audit", motif: { kind: "icon", icon: Building2 } },
      ],
    },
    {
      key: "platform",
      title: "Core Platform",
      caption: "Dev mode, cloud execution, connectors, painless installs",
      icon: Layers,
      brand: "amber",
      bars: [
        { label: "Dev Mode", value: 0.85, detail: "instant preview", motif: { kind: "icon", icon: Wrench } },
        // Connector count derived from the live catalog; 0.85 is the fulfillment
        // target — the integrations phase is effectively shipped (no data source).
        { label: "Connectors", value: 0.85, detail: `${counts.connectors} services`, motif: { kind: "icon", icon: Plug } },
        { label: "Cloud execution", value: 0.5, detail: "24/7 runs", motif: { kind: "icon", icon: Cloud } },
        { label: "Installers & updates", value: 0.35, detail: "auto-update", motif: { kind: "icon", icon: Package } },
      ],
    },
    {
      key: "templates",
      title: "Template Gallery",
      caption: "Starter agents by category — live gallery counts",
      icon: LayoutGrid,
      brand: "blue",
      wide: true,
      // Numerators are DERIVED from the templates catalog (drift-proof); the
      // denominators are the aspirational TEMPLATE_TARGETS above (no data source).
      headline: {
        label: "All categories",
        value: counts.templateTotal / TEMPLATE_TARGETS.total,
        detail: `${counts.templateTotal} / ${TEMPLATE_TARGETS.total} templates`,
      },
      bars: [
        {
          label: "DevOps",
          value: t.DevOps / TEMPLATE_TARGETS.DevOps,
          detail: `${t.DevOps}/${TEMPLATE_TARGETS.DevOps}`,
          motif: { kind: "image", dark: "/imgs/templates/devops-dark.png", light: "/imgs/templates/devops-light.png" },
        },
        {
          label: "Productivity",
          value: t.Productivity / TEMPLATE_TARGETS.Productivity,
          detail: `${t.Productivity}/${TEMPLATE_TARGETS.Productivity}`,
          motif: { kind: "image", dark: "/imgs/templates/productivity-dark.png", light: "/imgs/templates/productivity-light.png" },
        },
        {
          label: "Communication",
          value: t.Communication / TEMPLATE_TARGETS.Communication,
          detail: `${t.Communication}/${TEMPLATE_TARGETS.Communication}`,
          motif: { kind: "image", dark: "/imgs/templates/communication-dark.png", light: "/imgs/templates/communication-light.png" },
        },
        {
          label: "Marketing",
          value: t.Marketing / TEMPLATE_TARGETS.Marketing,
          detail: `${t.Marketing}/${TEMPLATE_TARGETS.Marketing}`,
          motif: { kind: "image", dark: "/imgs/templates/marketing-dark.png", light: "/imgs/templates/marketing-light.png" },
        },
        {
          label: "Research",
          value: t.Research / TEMPLATE_TARGETS.Research,
          detail: `${t.Research}/${TEMPLATE_TARGETS.Research}`,
          motif: { kind: "image", dark: "/imgs/templates/research-dark.png", light: "/imgs/templates/research-light.png" },
        },
        {
          label: "Security",
          value: t.Security / TEMPLATE_TARGETS.Security,
          detail: `${t.Security}/${TEMPLATE_TARGETS.Security}`,
          motif: { kind: "image", dark: "/imgs/templates/security-dark.png", light: "/imgs/templates/security-light.png" },
        },
        {
          label: "Finance · Sales · Support · Legal",
          value: counts.groupedTemplates / TEMPLATE_TARGETS.grouped,
          detail: `${counts.groupedTemplates}/${TEMPLATE_TARGETS.grouped}`,
        },
      ],
    },
  ];
}

/** Area-level fulfillment: the headline when present, else the bar mean. */
export function areaOverall(area: AreaDef): number {
  if (area.headline) return area.headline.value;
  // Guard the empty-bars case: 0/0 = NaN would render "NaN%" and break the
  // progressbar aria-valuenow / reveal clip-path downstream.
  if (area.bars.length === 0) return 0;
  return area.bars.reduce((sum, bar) => sum + bar.value, 0) / area.bars.length;
}
