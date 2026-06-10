import {
  Building2,
  Cloud,
  Languages,
  LayoutGrid,
  Layers,
  MonitorSmartphone,
  Package,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { BrandKey } from "@/lib/brand-theme";
import type { FlagKey } from "./components/FlagArt";

/**
 * The roadmap as fulfillment, not chronology: each logical area is a card,
 * each bar fills left → right with how far that slice has come. Bar motifs
 * (flags, device art, category art) sit behind the track and fade in with
 * completion — the picture literally develops as the work lands.
 */

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

export const AREAS: AreaDef[] = [
  {
    key: "i18n",
    title: "Internationalization",
    caption: "14 locales, hand-translated — each flag develops with coverage",
    icon: Languages,
    brand: "cyan",
    bars: [
      { label: "Europe", value: 0.88, detail: "6 locales", motif: { kind: "flag", flag: "eu" } },
      { label: "Asia-Pacific", value: 0.76, detail: "5 locales", motif: { kind: "flag", flag: "jp" } },
      { label: "South Asia", value: 0.64, detail: "2 locales", motif: { kind: "flag", flag: "in" } },
      { label: "Middle East · RTL", value: 0.58, detail: "1 locale", motif: { kind: "flag", flag: "ae" } },
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
    caption: "Dev mode, cloud execution, painless installs",
    icon: Layers,
    brand: "amber",
    bars: [
      { label: "Dev Mode", value: 0.85, detail: "instant preview", motif: { kind: "icon", icon: Wrench } },
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
    headline: { label: "All categories", value: 57 / 210, detail: "57 / 210 templates" },
    bars: [
      {
        label: "DevOps",
        value: 13 / 40,
        detail: "13/40",
        motif: { kind: "image", dark: "/imgs/templates/devops-dark.png", light: "/imgs/templates/devops-light.png" },
      },
      {
        label: "Productivity",
        value: 13 / 35,
        detail: "13/35",
        motif: { kind: "image", dark: "/imgs/templates/productivity-dark.png", light: "/imgs/templates/productivity-light.png" },
      },
      {
        label: "Communication",
        value: 10 / 30,
        detail: "10/30",
        motif: { kind: "image", dark: "/imgs/templates/communication-dark.png", light: "/imgs/templates/communication-light.png" },
      },
      {
        label: "Marketing",
        value: 3 / 25,
        detail: "3/25",
        motif: { kind: "image", dark: "/imgs/templates/marketing-dark.png", light: "/imgs/templates/marketing-light.png" },
      },
      {
        label: "Research",
        value: 3 / 20,
        detail: "3/20",
        motif: { kind: "image", dark: "/imgs/templates/research-dark.png", light: "/imgs/templates/research-light.png" },
      },
      {
        label: "Security",
        value: 3 / 20,
        detail: "3/20",
        motif: { kind: "image", dark: "/imgs/templates/security-dark.png", light: "/imgs/templates/security-light.png" },
      },
      { label: "Finance · Sales · Support · Legal", value: 12 / 60, detail: "12/60" },
    ],
  },
];

/** Area-level fulfillment: the headline when present, else the bar mean. */
export function areaOverall(area: AreaDef): number {
  return area.headline
    ? area.headline.value
    : area.bars.reduce((sum, bar) => sum + bar.value, 0) / area.bars.length;
}
