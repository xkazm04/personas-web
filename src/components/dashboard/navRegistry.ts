/**
 * The dashboard's menu as data: sections, their level-2 groups, and the view
 * each entry opens. Labels are i18n keys under `t.dashboard`.
 */
import {
  Activity,
  Bot,
  Brain,
  ClipboardCheck,
  Clapperboard,
  HeartPulse,
  LayoutDashboard,
  Mail,
  Radio,
  Radar,
  Settings,
  Shield,
  Siren,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DashboardViewId } from "@/components/dashboard/spa/views";

export type DashboardLabelKey =
  | "personas"
  | "overview"
  | "missionControl"
  | "reviews"
  | "executions"
  | "events"
  | "observability"
  | "leaderboard"
  | "sla"
  | "incidents"
  | "health"
  | "knowledge"
  | "messages"
  | "director"
  | "settings";

export type NavGroupKey = "mission" | "monitoring" | "reliability" | "memory";

export interface NavLeafDef {
  view: DashboardViewId;
  labelKey: DashboardLabelKey;
  icon: LucideIcon;
}

export interface NavSectionDef {
  key: string;
  labelKey: DashboardLabelKey;
  icon: LucideIcon;
  /**
   * The second level, mirroring the desktop app's sidebar: captioned groups of
   * views. A section without groups is a single view.
   */
  groups?: readonly { key: NavGroupKey; items: readonly NavLeafDef[] }[];
  /** The view a section without groups opens. */
  view?: DashboardViewId;
}

/**
 * The dashboard's menu, the single nav registry. Level 1 is the rail of
 * sections; Overview opens a level-2 panel that packs the analytics views into
 * groups. Section order is product order: Personas is the main view.
 */
export const navSections: readonly NavSectionDef[] = [
  { key: "personas", labelKey: "personas", icon: Bot, view: "personas" },
  {
    key: "overview",
    labelKey: "overview",
    icon: LayoutDashboard,
    groups: [
      {
        key: "mission",
        items: [
          { view: "home", labelKey: "missionControl", icon: Radar },
          { view: "reviews", labelKey: "reviews", icon: ClipboardCheck },
        ],
      },
      {
        key: "monitoring",
        items: [
          { view: "executions", labelKey: "executions", icon: Zap },
          { view: "events", labelKey: "events", icon: Radio },
          { view: "observability", labelKey: "observability", icon: Activity },
        ],
      },
      {
        key: "reliability",
        items: [
          { view: "leaderboard", labelKey: "leaderboard", icon: Trophy },
          { view: "sla", labelKey: "sla", icon: Shield },
          { view: "incidents", labelKey: "incidents", icon: Siren },
          { view: "health", labelKey: "health", icon: HeartPulse },
        ],
      },
      {
        key: "memory",
        items: [{ view: "knowledge", labelKey: "knowledge", icon: Brain }],
      },
    ],
  },
  { key: "messages", labelKey: "messages", icon: Mail, view: "messages" },
  { key: "director", labelKey: "director", icon: Clapperboard, view: "director" },
  { key: "settings", labelKey: "settings", icon: Settings, view: "settings" },
];
