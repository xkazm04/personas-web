// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 3 variant A: the SectionIntro trio plus the in-scene
 * UI labels of the stylized app. Nothing here is decorative filler — each
 * string is something a real Personas screen would say.
 *
 * Icons split two ways on purpose:
 *   • real products  → the brand SVGs in `public/icons/connectors`, rendered
 *     through `ConnectorIcon` (flattened to one theme-aware tone).
 *   • generic UI affordances (search, bell, clock, chart, sparkles…) → lucide.
 */

import {
  Activity,
  Bell,
  Bot,
  ChevronRight,
  Clock3,
  Home,
  KeyRound,
  LayoutTemplate,
  Pencil,
  Plug,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** The brand glyphs this scene owns (all present in public/icons/connectors). */
const GLYPH = {
  slack: "/icons/connectors/slack.svg",
  github: "/icons/connectors/github.svg",
  notion: "/icons/connectors/notion.svg",
  gmail: "/icons/connectors/gmail.svg",
} as const;

export const COPY = {
  intro: {
    eyebrow: "Guided walkthroughs",
    heading: "She shows you",
    gradient: "how",
  },
  chrome: {
    appName: "Personas",
    search: "Search…",
    searchIcon: Search as LucideIcon,
    bellIcon: Bell as LucideIcon,
    nav: [
      { label: "Home", icon: Home as LucideIcon },
      { label: "Agents", icon: Bot as LucideIcon },
      { label: "Templates", icon: LayoutTemplate as LucideIcon },
      { label: "Connectors", icon: Plug as LucideIcon },
      { label: "Vault", icon: KeyRound as LucideIcon },
      { label: "Settings", icon: Settings as LucideIcon },
    ],
    navActive: 2,
    usageLabel: "runs today",
    usageValue: "18 / 25",
    usagePct: 72,
    newAgent: "New agent",
  },
  canvas: {
    // Toolbar — breadcrumb + filter chips
    crumbs: ["Workspace", "Automation"] as const,
    crumbIcon: ChevronRight as LucideIcon,
    filters: [
      { label: "All", active: true },
      { label: "Popular", active: false },
      { label: "Scheduled", active: false },
      { label: "New", active: false },
    ],
    // Template cards
    templatesLabel: "Templates",
    templatesHint: "12 templates",
    template: {
      glyph: GLYPH.slack,
      title: "Daily digest",
      meta: "summarize · post · 9:00",
      pill: "popular",
      schedule: "Daily 9:00",
      runs: "142 runs",
      health: "98% ok",
    },
    templateAlt: {
      glyph: GLYPH.gmail,
      title: "Inbox triage",
      meta: "label · draft · archive",
      pill: "new",
      schedule: "On new mail",
      runs: "86 runs",
      health: "94% ok",
    },
    // Recent-runs table
    runsTitle: "Recent runs",
    runsHint: "last 24h",
    runsCols: ["agent", "status", "took"] as const,
    runsRows: [
      { glyph: GLYPH.slack, name: "Daily digest", state: "ok", took: "1.2s" },
      { glyph: GLYPH.github, name: "PR review", state: "ok", took: "0.8s" },
      { glyph: GLYPH.notion, name: "Notes sync", state: "running", took: "—" },
    ],
    // Connector list
    connectLabel: "Connect a tool",
    connectCount: "2 of 9 connected",
    slack: {
      glyph: GLYPH.slack,
      name: "Slack",
      detail: "#general · updates",
      connect: "connect",
      connecting: "connecting…",
      connected: "connected",
    },
    chips: [
      { glyph: GLYPH.github, name: "GitHub", detail: "synced 2m ago", state: "connected" },
      { glyph: GLYPH.notion, name: "Notion", detail: "12 pages", state: "connected" },
    ],
    // Schedule / trigger
    triggerLabel: "Trigger",
    triggerIcon: Clock3 as LucideIcon,
    triggerValue: "Every morning · 9:00",
    triggerValueShort: "Daily · 9:00",
    triggerHint: "edit",
    triggerHintIcon: Pencil as LucideIcon,
    triggerDays: ["S", "M", "T", "W", "T", "F", "S"] as const,
    triggerActiveDays: [1, 2, 3, 4, 5] as readonly number[],
    triggerZone: "UTC+1",
    triggerOn: "on",
    // Monitoring
    activityLabel: "Monitoring",
    activityIcon: Activity as LucideIcon,
    activityStat: "24 runs",
    activityPill: "live",
    stats: [
      { value: "24", label: "runs" },
      { value: "98%", label: "success" },
      { value: "1.4s", label: "avg" },
    ],
    // Final action
    actionIcon: Sparkles as LucideIcon,
    action: "Create agent",
  },
} as const;
