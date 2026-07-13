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
import type { Translations } from "@/i18n/en";
import type { FlagKey } from "./components/FlagArt";

/** The localized copy for the roadmap section (see `roadmapSection` in en.ts). */
export type RoadmapT = Translations["roadmapSection"];

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
 * server-side from the real catalogs (see `roadmap-area-counts.ts`); `t` is the
 * localized `roadmapSection` copy (threaded from the client `RoadmapAreas`, the
 * repo's client-only `useTranslation`). Everything else (targets, coverage %,
 * motifs, icons) is authored here. Derived numbers stay derived — only the
 * surrounding label text is localized.
 */
export function buildAreas(counts: AreaCounts, t: RoadmapT): AreaDef[] {
  const cat = counts.templatesByCategory;
  const localeDetail = (n: number) =>
    (n === 1 ? t.detail.localeOne : t.detail.localeOther).replace("{n}", String(n));
  return [
    {
      key: "i18n",
      title: t.areas.i18n.title,
      // `localeTotal` renders "14" today — derived from the LANGUAGES registry.
      caption: t.areas.i18n.caption.replace("{count}", String(counts.localeTotal)),
      icon: Languages,
      brand: "cyan",
      // Per-region `detail` counts are derived; the `value` (translation
      // completeness) is hand-authored — the non-en bundles are known-incomplete,
      // so there is no clean data source for coverage %.
      bars: [
        { label: t.bars.europe, value: 0.88, detail: localeDetail(counts.localesByRegion.europe), motif: { kind: "flag", flag: "eu" } },
        { label: t.bars.asiaPacific, value: 0.76, detail: localeDetail(counts.localesByRegion.apac), motif: { kind: "flag", flag: "jp" } },
        { label: t.bars.southAsia, value: 0.64, detail: localeDetail(counts.localesByRegion.southAsia), motif: { kind: "flag", flag: "in" } },
        { label: t.bars.middleEast, value: 0.58, detail: localeDetail(counts.localesByRegion.middleEast), motif: { kind: "flag", flag: "ae" } },
      ],
    },
    {
      key: "devices",
      title: t.areas.devices.title,
      caption: t.areas.devices.caption,
      icon: MonitorSmartphone,
      brand: "purple",
      bars: [
        {
          label: t.bars.windows,
          value: 0.92,
          detail: t.detail.shipped,
          motif: { kind: "image", dark: "/imgs/get-started/platform/windows-dark.png", light: "/imgs/get-started/platform/windows-light.png" },
        },
        {
          label: t.bars.macos,
          value: 0.55,
          detail: t.detail.inDevelopment,
          motif: { kind: "image", dark: "/imgs/get-started/platform/mac-dark.png", light: "/imgs/get-started/platform/mac-light.png" },
        },
        {
          label: t.bars.linux,
          value: 0.45,
          detail: t.detail.inDevelopment,
          motif: { kind: "image", dark: "/imgs/get-started/platform/linux-dark.png", light: "/imgs/get-started/platform/linux-light.png" },
        },
        {
          label: t.bars.web,
          value: 0.8,
          detail: t.detail.thisSite,
          motif: { kind: "image", dark: "/imgs/get-started/platform/web-dark.png", light: "/imgs/get-started/platform/web-light.png" },
        },
        {
          label: t.bars.mobileCompanion,
          value: 0.25,
          detail: t.detail.preview,
          motif: { kind: "image", dark: "/imgs/get-started/platform/mobile-dark.png", light: "/imgs/get-started/platform/mobile-light.png" },
        },
      ],
    },
    {
      key: "collaboration",
      title: t.areas.collaboration.title,
      caption: t.areas.collaboration.caption,
      icon: Users,
      brand: "emerald",
      bars: [
        { label: t.bars.solo, value: 0.95, detail: t.detail.shipped, motif: { kind: "icon", icon: User } },
        { label: t.bars.team, value: 0.4, detail: t.detail.sharedAgents, motif: { kind: "icon", icon: Users } },
        { label: t.bars.enterprise, value: 0.15, detail: t.detail.ssoAudit, motif: { kind: "icon", icon: Building2 } },
      ],
    },
    {
      key: "platform",
      title: t.areas.platform.title,
      caption: t.areas.platform.caption,
      icon: Layers,
      brand: "amber",
      bars: [
        { label: t.bars.devMode, value: 0.85, detail: t.detail.instantPreview, motif: { kind: "icon", icon: Wrench } },
        // Connector count derived from the live catalog; 0.85 is the fulfillment
        // target — the integrations phase is effectively shipped (no data source).
        { label: t.bars.connectors, value: 0.85, detail: t.detail.services.replace("{n}", String(counts.connectors)), motif: { kind: "icon", icon: Plug } },
        { label: t.bars.cloudExecution, value: 0.5, detail: t.detail.runs247, motif: { kind: "icon", icon: Cloud } },
        { label: t.bars.installersUpdates, value: 0.35, detail: t.detail.autoUpdate, motif: { kind: "icon", icon: Package } },
      ],
    },
    {
      key: "templates",
      title: t.areas.templates.title,
      caption: t.areas.templates.caption,
      icon: LayoutGrid,
      brand: "blue",
      wide: true,
      // Numerators are DERIVED from the templates catalog (drift-proof); the
      // denominators are the aspirational TEMPLATE_TARGETS above (no data source).
      headline: {
        label: t.bars.allCategories,
        value: counts.templateTotal / TEMPLATE_TARGETS.total,
        detail: t.detail.templatesTotal
          .replace("{n}", String(counts.templateTotal))
          .replace("{total}", String(TEMPLATE_TARGETS.total)),
      },
      bars: [
        {
          label: t.bars.devops,
          value: cat.DevOps / TEMPLATE_TARGETS.DevOps,
          detail: `${cat.DevOps}/${TEMPLATE_TARGETS.DevOps}`,
          motif: { kind: "image", dark: "/imgs/templates/devops-dark.png", light: "/imgs/templates/devops-light.png" },
        },
        {
          label: t.bars.productivity,
          value: cat.Productivity / TEMPLATE_TARGETS.Productivity,
          detail: `${cat.Productivity}/${TEMPLATE_TARGETS.Productivity}`,
          motif: { kind: "image", dark: "/imgs/templates/productivity-dark.png", light: "/imgs/templates/productivity-light.png" },
        },
        {
          label: t.bars.communication,
          value: cat.Communication / TEMPLATE_TARGETS.Communication,
          detail: `${cat.Communication}/${TEMPLATE_TARGETS.Communication}`,
          motif: { kind: "image", dark: "/imgs/templates/communication-dark.png", light: "/imgs/templates/communication-light.png" },
        },
        {
          label: t.bars.marketing,
          value: cat.Marketing / TEMPLATE_TARGETS.Marketing,
          detail: `${cat.Marketing}/${TEMPLATE_TARGETS.Marketing}`,
          motif: { kind: "image", dark: "/imgs/templates/marketing-dark.png", light: "/imgs/templates/marketing-light.png" },
        },
        {
          label: t.bars.research,
          value: cat.Research / TEMPLATE_TARGETS.Research,
          detail: `${cat.Research}/${TEMPLATE_TARGETS.Research}`,
          motif: { kind: "image", dark: "/imgs/templates/research-dark.png", light: "/imgs/templates/research-light.png" },
        },
        {
          label: t.bars.security,
          value: cat.Security / TEMPLATE_TARGETS.Security,
          detail: `${cat.Security}/${TEMPLATE_TARGETS.Security}`,
          motif: { kind: "image", dark: "/imgs/templates/security-dark.png", light: "/imgs/templates/security-light.png" },
        },
        {
          label: t.bars.financeCluster,
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
