// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Data + clock for "The Glide" — section 3 ("She shows you how"), variant A.
 * Modeled on dev-tools-grid/athenaFleetData.ts: one deterministic CYCLE,
 * choreography as data (stops with arrive/depart ticks + target rects), and
 * pure phase functions the scene derives everything from.
 *
 * The scene: a stylized desktop app plays a complete guided walkthrough.
 * Athena's orb glides stop to stop; at each stop four corner brackets lock
 * onto the exact control, the control glows (the rest of the UI is never
 * dimmed or blocked), a ≤5-word caption narrates, and a segmented progress
 * rail advances. The final stop is a real action button. Loop.
 */

import {
  Activity,
  Bell,
  Bot,
  Clock3,
  FileText,
  GitBranch,
  Home,
  Inbox,
  KeyRound,
  LayoutTemplate,
  MessagesSquare,
  Newspaper,
  Pencil,
  Plug,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const CYCLE = 24;
export const TICK_MS = 1100;
/** Reduced-motion pinned frame: mid-walkthrough — brackets locked on stop 2
 *  (Slack connector), rail at 2/4, caption visible. The story in one image. */
export const INITIAL_TICK = 9;

export type StopId = "template" | "connect" | "trigger" | "action";

/** Percent coordinates within the app's main canvas. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GlideStop {
  id: StopId;
  /** ≤5-word caption narrated beside the orb while locked. */
  caption: string;
  /** The control the brackets lock onto. */
  rect: Rect;
  /** Where the orb hovers while narrating this stop. */
  orb: { x: number; y: number };
  arrive: number;
  depart: number;
}

/** The walkthrough route — pick a template → connect a tool → set the
 *  trigger → end on a real action button. */
export const STOPS: GlideStop[] = [
  { id: "template", caption: "pick a starting point", rect: { x: 5, y: 10, w: 36, h: 24 }, orb: { x: 48, y: 22 }, arrive: 2, depart: 7 },
  { id: "connect", caption: "connect your Slack", rect: { x: 5, y: 47, w: 33, h: 12 }, orb: { x: 45, y: 53 }, arrive: 7, depart: 12 },
  { id: "trigger", caption: "set the trigger", rect: { x: 5, y: 70, w: 49, h: 12 }, orb: { x: 61, y: 76 }, arrive: 12, depart: 17 },
  { id: "action", caption: "one click — it's live", rect: { x: 63, y: 84, w: 31, h: 11 }, orb: { x: 57, y: 89 }, arrive: 17, depart: 22 },
];

/** Where the orb rests before/after a walkthrough — upper right, off the UI. */
export const DOCK = { x: 88, y: 6 };

/** The stop the orb is working (arrived, not yet departed) at a phase tick. */
export function activeStopAt(phase: number): GlideStop | null {
  return STOPS.find((s) => phase >= s.arrive && phase < s.depart) ?? null;
}

/** The stop whose brackets have snapped on (one tick after arrival — the
 *  glide lands first, then the lock). */
export function lockedStopAt(phase: number): GlideStop | null {
  const stop = activeStopAt(phase);
  return stop && phase >= stop.arrive + 1 ? stop : null;
}

/** Orb position at a phase tick — at the active stop, else docked. */
export function orbAt(phase: number): { x: number; y: number } {
  return activeStopAt(phase)?.orb ?? DOCK;
}

/** True on the arrival tick — she is mid-glide / just landing, not locked.
 *  The orb swells while traveling and settles when the brackets snap. */
export function travelingAt(phase: number): boolean {
  const stop = activeStopAt(phase);
  return stop !== null && phase < stop.arrive + 1;
}

/** Segmented progress rail — a segment fills the moment its stop locks. */
export function railAt(phase: number): boolean[] {
  return STOPS.map((s) => phase >= s.arrive + 1);
}

/** Final-stop action button pulses while she presents it. */
export function actionPulseAt(phase: number): boolean {
  const last = STOPS[STOPS.length - 1];
  return phase >= last.arrive + 1 && phase < last.depart;
}

/** Mono status line — corner console readout (≤5 words). */
export function statusAt(phase: number): string {
  if (phase < STOPS[0].arrive) return "guided · walkthrough starting";
  if (phase >= STOPS[STOPS.length - 1].depart) return "ended on a real action";
  const done = Math.max(railAt(phase).filter(Boolean).length, 1);
  return `step ${done}/${STOPS.length} · screen stays yours`;
}

/** Compact status for narrow viewports — the step counter alone. */
export function statusShortAt(phase: number): string {
  if (phase < STOPS[0].arrive) return "starting";
  if (phase >= STOPS[STOPS.length - 1].depart) return "live";
  return `step ${Math.max(railAt(phase).filter(Boolean).length, 1)}/${STOPS.length}`;
}

/** Decorative activity chart — one deterministic week of run counts. */
export const CHART_POINTS = [20, 16, 18, 10, 13, 6, 9, 3] as const;

/** All words in the scene — section intro + in-scene UI labels only. */
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
    templatesLabel: "Templates",
    template: { icon: Newspaper as LucideIcon, title: "Daily digest", meta: "summarize · post · 9:00", pill: "popular" },
    templateAlt: { icon: Inbox as LucideIcon, title: "Inbox triage", meta: "label · draft · archive", pill: "new" },
    connectLabel: "Connect a tool",
    slack: { icon: MessagesSquare as LucideIcon, name: "Slack", state: "connect" },
    chips: [
      { icon: GitBranch as LucideIcon, name: "GitHub", state: "linked" },
      { icon: FileText as LucideIcon, name: "Notion", state: "linked" },
    ],
    triggerLabel: "Trigger",
    triggerIcon: Clock3 as LucideIcon,
    triggerValue: "Every morning · 9:00",
    triggerHint: "edit",
    triggerHintIcon: Pencil as LucideIcon,
    activityLabel: "Monitoring",
    activityIcon: Activity as LucideIcon,
    activityStat: "24 runs",
    activityPill: "live",
    actionIcon: Sparkles as LucideIcon,
    action: "Create agent",
  },
} as const;
