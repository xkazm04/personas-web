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
  {
    id: "template",
    caption: "pick a starting point",
    rect: { x: 5, y: 10, w: 36, h: 24 },
    orb: { x: 48, y: 22 },
    arrive: 2,
    depart: 7,
  },
  {
    id: "connect",
    caption: "connect your Slack",
    rect: { x: 5, y: 47, w: 27, h: 12 },
    orb: { x: 39, y: 53 },
    arrive: 7,
    depart: 12,
  },
  {
    id: "trigger",
    caption: "set the trigger",
    rect: { x: 5, y: 70, w: 49, h: 12 },
    orb: { x: 61, y: 76 },
    arrive: 12,
    depart: 17,
  },
  {
    id: "action",
    caption: "one click — it's live",
    rect: { x: 63, y: 84, w: 31, h: 11 },
    orb: { x: 57, y: 89 },
    arrive: 17,
    depart: 22,
  },
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

/** Segmented progress rail — a segment fills the moment its stop locks. */
export function railAt(phase: number): boolean[] {
  return STOPS.map((s) => phase >= s.arrive + 1);
}

/** Final-stop action button pulses while she presents it. */
export function actionPulseAt(phase: number): boolean {
  const last = STOPS[STOPS.length - 1];
  return phase >= last.arrive + 1 && phase < last.depart;
}

/** Mono status line — corner console readout. */
export function statusAt(phase: number): string {
  const done = railAt(phase).filter(Boolean).length;
  if (phase < STOPS[0].arrive) return "guided · walkthrough starting";
  if (phase >= STOPS[STOPS.length - 1].depart)
    return `guided · ${STOPS.length}/${STOPS.length} · ended on a real action`;
  return `guided · step ${Math.max(done, 1)}/${STOPS.length} · your screen stays yours`;
}

/** All words in the scene — section title + in-scene UI labels only. */
export const COPY = {
  title: "She shows you how.",
  eyebrow: "a guided walkthrough · nothing blocked",
  chrome: {
    appName: "Personas",
    search: "Search…",
    nav: ["Home", "Agents", "Templates", "Connectors", "Vault", "Settings"],
    navActive: 2,
    newAgent: "New agent",
  },
  canvas: {
    templatesLabel: "Templates",
    templateTitle: "Daily digest",
    templateSub: "summarize · post · every morning",
    templateAltTitle: "Inbox triage",
    templateAltSub: "label · draft · archive",
    connectLabel: "Connect a tool",
    slack: "Slack",
    slackState: "connect",
    github: "GitHub",
    notion: "Notion",
    triggerLabel: "Trigger",
    triggerValue: "Every morning · 9:00",
    triggerHint: "edit",
    activityLabel: "Activity",
    action: "Create agent",
  },
} as const;
