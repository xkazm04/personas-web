/**
 * The dashboard's menu as data: sections, their level-2 groups, and the view
 * each entry opens. Labels are i18n keys under `t.dashboard`, except the
 * English-only pending ones in `PendingNavLabelKey` (PLAN M4).
 */
import {
  Activity,
  Bot,
  Brain,
  ClipboardCheck,
  Clapperboard,
  HeartPulse,
  LayoutDashboard,
  NotebookPen,
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

/**
 * Nav labels still in the English-only pending `mobile` namespace (PLAN M4):
 * resolved by `navLabel` in DashboardNavigation. A key moves to
 * `DashboardLabelKey` when its namespace is translated.
 */
export type PendingNavLabelKey = "notes";

export type NavLabelKey = DashboardLabelKey | PendingNavLabelKey;

export type NavGroupKey = "mission" | "monitoring" | "reliability" | "memory";

export interface NavLeafDef {
  view: DashboardViewId;
  labelKey: NavLabelKey;
  icon: LucideIcon;
}

export interface NavSectionDef {
  key: string;
  labelKey: NavLabelKey;
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
  // Goal management from the desktop Notepad (PHASE2-SPEC.md 5.1): its own
  // product area next to the agents, not an analytics view under Overview.
  { key: "notes", labelKey: "notes", icon: NotebookPen, view: "notes" },
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

/**
 * The phone bottom bar, in order (PHASE2-SPEC.md 6.2: Personas, Reviews,
 * Notes, Executions, then More). The phone is for managing agents and what
 * waits on them, so the bar is chosen, not the first entries of the menu;
 * every other view sits under More in menu order.
 */
export const PHONE_BAR_VIEWS: readonly DashboardViewId[] = ["personas", "reviews", "notes", "executions"];
