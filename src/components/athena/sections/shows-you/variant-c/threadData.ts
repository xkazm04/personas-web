// PROTOTYPE COPY — extract to src/i18n at assembly
/*
 * Data + clock for "The Thread" — /athena section 3, variant C.
 *
 * The whole onboarding journey as a wide shot: five miniature product
 * screens scattered across the viewport, and Athena's walkthrough drawn
 * as one continuous luminous thread that draws itself from screen to
 * screen. Where the thread arrives, the panel lifts, four corner
 * brackets lock onto the exact control, and a ≤5-word caption marks the
 * step. Passed panels keep a checked tick and stay lit; upcoming ones
 * wait dim-but-readable. The loop ends on a pulsing "Run it" control,
 * then the thread retracts and redraws.
 *
 * Mirrors athenaFleetData.ts: one deterministic CYCLE, choreography as
 * data (arrive/depart ticks per stop), pure state functions of phase.
 */

export interface Vec {
  x: number;
  y: number;
}

/** Full loop length in ticks. */
export const CYCLE = 26;

/** Tick the last stop releases and the thread starts retracting. */
export const RETRACT_AT = 24;

export const STEP_COUNT = 5;

export type PanelState = "upcoming" | "active" | "visited";

export interface JourneyPanelDef {
  id: string;
  /** 1–2 word screen label (words live inside the illustration). */
  label: string;
  /** Sketch rows inside the mini screen — 1-word items. */
  rows: string[];
  /** The exact control the corner brackets lock onto. */
  control: string;
  /** ≤5-word step caption narrated at arrival. */
  caption: string;
  /** Panel center, % of the scene — desktop zigzag left→right. */
  desktop: Vec;
  /** Panel center, % of the scene — mobile vertical serpentine. */
  mobile: Vec;
  /** Tick the thread reaches this screen (brackets lock). */
  arrive: number;
  /** Tick the thread moves on (tick appears, panel stays lit). */
  depart: number;
}

export const PANELS: JourneyPanelDef[] = [
  {
    id: "templates",
    label: "Templates",
    rows: ["Digest", "Triage", "Review"],
    control: "Use template",
    caption: "start from a template",
    desktop: { x: 13, y: 22 },
    mobile: { x: 30, y: 9 },
    arrive: 1,
    depart: 4,
  },
  {
    id: "agents",
    label: "Agents",
    rows: ["Scout", "Writer", "Critic"],
    control: "Add agent",
    caption: "name your agents",
    desktop: { x: 33, y: 63 },
    mobile: { x: 70, y: 27 },
    arrive: 6,
    depart: 9,
  },
  {
    id: "connections",
    label: "Connections",
    rows: ["Slack", "GitHub", "Linear"],
    control: "Connect",
    caption: "wire up your tools",
    desktop: { x: 53, y: 21 },
    mobile: { x: 30, y: 46 },
    arrive: 11,
    depart: 14,
  },
  {
    id: "triggers",
    label: "Triggers",
    rows: ["Schedule", "Webhook"],
    control: "Daily · 9:00",
    caption: "set the trigger",
    desktop: { x: 72, y: 63 },
    mobile: { x: 70, y: 64 },
    arrive: 16,
    depart: 19,
  },
  {
    id: "monitor",
    label: "Monitoring",
    rows: ["Timeline", "Live log"],
    control: "Run it",
    caption: "run it — she watches",
    desktop: { x: 89, y: 26 },
    mobile: { x: 50, y: 84 },
    arrive: 21,
    depart: 24,
  },
];

/** Where the thread enters the scene before the first screen. */
const ORIGIN_DESKTOP: Vec = { x: 1, y: 5 };
const ORIGIN_MOBILE: Vec = { x: 50, y: 0 };

/** Waypoint route: origin, then every panel center. Index i+1 = panel i. */
export const DESKTOP_POINTS: Vec[] = [ORIGIN_DESKTOP, ...PANELS.map((p) => p.desktop)];
export const MOBILE_POINTS: Vec[] = [ORIGIN_MOBILE, ...PANELS.map((p) => p.mobile)];

/**
 * Cumulative path-length fraction at each waypoint (straight polyline in
 * viewBox units — exactly the geometry the SVG normalizes over), so the
 * thread tip rests precisely on a panel while its brackets are locked.
 */
function fractionsOf(points: Vec[]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1];
  return cum.map((v) => v / total);
}

export const DESKTOP_FRACTIONS = fractionsOf(DESKTOP_POINTS);
export const MOBILE_FRACTIONS = fractionsOf(MOBILE_POINTS);

/** The panel's state at a phase tick (phase = tick % CYCLE). */
export function panelStateAt(i: number, phase: number): PanelState {
  const p = PANELS[i];
  if (phase >= p.arrive && phase < p.depart) return "active";
  if (phase >= p.depart) return "visited";
  return "upcoming";
}

/**
 * How much of the thread is drawn at a phase tick, 0..1.
 * Holds at a waypoint's fraction while brackets are locked, interpolates
 * during travel, and returns 0 during retract (the tween rewinds it).
 */
export function progressAt(phase: number, fractions: number[]): number {
  if (phase >= RETRACT_AT) return 0;
  for (let i = 0; i < PANELS.length; i++) {
    const p = PANELS[i];
    if (phase < p.arrive) {
      const start = i === 0 ? 0 : PANELS[i - 1].depart;
      const from = i === 0 ? 0 : fractions[i];
      const t = Math.max(0, (phase - start) / (p.arrive - start));
      return from + (fractions[i + 1] - from) * t;
    }
    if (phase < p.depart) return fractions[i + 1];
  }
  return 1;
}

/** Where the thread head (Athena's orb) is gliding to at a phase tick. */
export function orbTargetAt(phase: number, points: Vec[]): Vec {
  if (phase >= RETRACT_AT) return points[0];
  for (let i = 0; i < PANELS.length; i++) {
    if (phase < PANELS[i].depart) return points[i + 1];
  }
  return points[points.length - 1];
}

/** True while the orb sits locked on a panel (brackets engaged). */
export function orbLockedAt(phase: number): boolean {
  return PANELS.some((p) => phase >= p.arrive && phase < p.depart);
}

/** Current step number (1-based) for the status line. */
export function stepAt(phase: number): number {
  for (let i = 0; i < PANELS.length; i++) {
    if (phase < PANELS[i].depart) return i + 1;
  }
  return STEP_COUNT;
}

/** Mono console line under the scene — pure function of phase. */
export function statusLineAt(phase: number): string {
  if (phase >= RETRACT_AT) return "journey complete · rewinding the thread";
  return `step ${stepAt(phase)}/${STEP_COUNT} · nothing dimmed, nothing blocked`;
}

export const COPY = {
  eyebrow: "guided walkthrough",
  headline: "She shows you how.",
  autonomousTag: "on your screen",
  visitedTick: "✓",
} as const;
