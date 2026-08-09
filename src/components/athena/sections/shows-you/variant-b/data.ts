// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Data + deterministic clock for "She shows you how" — variant B,
 * "First person" (modeled on dev-tools-grid/athenaFleetData.ts).
 *
 * The stylized app UI is an SVG world LARGER than the frame; the camera
 * (a translate+scale on the world group) travels with Athena. Choreography
 * is pure data: each stop has arrive/depart ticks, a target control, a
 * ≤5-word caption, and a zoom. Between stops the camera pulls back to the
 * whole UI (orientation), then pushes in again (focus). `cameraAt` and
 * `orbAt` derive everything from `phase = tick % CYCLE` — no stored
 * animation state, fully deterministic, loops forever.
 */

/** Overlay copy — HEADLINE corner + mono status line (the only text
 *  allowed outside the illustration). */
export const COPY = {
  eyebrow: "guided walkthrough",
  headline: "She shows you how.",
  statusLine: "she leads · you keep the wheel",
  sceneAria:
    "Athena guides a walkthrough across a live app screen, framing each control up close: the Connectors tab, the auto-sync toggle, the region picker, then the Deploy button.",
} as const;

export const WORLD = { w: 1600, h: 1000 } as const;
export const CYCLE = 26;
export const TICK_MS = 1100;
/** Reduced-motion pin: mid stop 2 — camera locked on the auto-sync toggle,
 *  brackets snapped, caption up, inset map showing where we are. The whole
 *  "she leads your eyes across a live UI" story in one frame. */
export const INITIAL_TICK = 9;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Stop {
  id: "nav" | "toggle" | "region" | "deploy";
  /** The exact control the brackets lock onto, in world coordinates. */
  target: Rect;
  arrive: number;
  depart: number;
  /** ≤5 words, narrated beside the orb while locked. */
  caption: string;
  /** Pill width in world units (caption pills are pre-measured, not layout). */
  captionW: number;
  /** Camera push-in factor while locked on this stop. */
  zoom: number;
  /** Which side of the target Athena perches on. */
  orbSide: "left" | "right";
}

/** The walkthrough route — sidebar → toggle → region → the action button. */
export const STOPS: Stop[] = [
  { id: "nav", target: { x: 104, y: 236, w: 272, h: 48 }, arrive: 2, depart: 6, caption: "Start here", zoom: 2.3, captionW: 122, orbSide: "right" },
  { id: "toggle", target: { x: 948, y: 272, w: 128, h: 56 }, arrive: 8, depart: 12, caption: "Flip auto-sync on", zoom: 2.6, captionW: 182, orbSide: "left" },
  { id: "region", target: { x: 716, y: 494, w: 312, h: 64 }, arrive: 14, depart: 18, caption: "Pick your region", zoom: 2.6, captionW: 170, orbSide: "left" },
  { id: "deploy", target: { x: 1288, y: 790, w: 224, h: 80 }, arrive: 20, depart: 24, caption: "Now press this", zoom: 2.3, captionW: 156, orbSide: "left" },
];

/** The pulled-back orientation framing — whole UI in view. */
export const WIDE = { x: WORLD.w / 2, y: WORLD.h / 2, zoom: 1 } as const;

export function rectCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/** Index of the stop the camera is locked on, or -1 while pulled back. */
export function activeStopIndex(phase: number): number {
  return STOPS.findIndex((s) => phase >= s.arrive && phase < s.depart);
}

/**
 * Camera position + zoom at a phase tick. Locked stops frame the target
 * up close; every gap between stops is a pull-back to the whole UI.
 * (The framer transition supplies the ease-out arrival / push-off feel.)
 */
export function cameraAt(phase: number): { x: number; y: number; zoom: number } {
  const i = activeStopIndex(phase);
  if (i === -1) return WIDE;
  const stop = STOPS[i];
  return { ...rectCenter(stop.target), zoom: stop.zoom };
}

/** Athena's perch beside a stop's target control. */
function perchAt(stop: Stop): { x: number; y: number } {
  const c = rectCenter(stop.target);
  const x = stop.orbSide === "left" ? stop.target.x - 64 : stop.target.x + stop.target.w + 64;
  return { x, y: c.y - 8 };
}

/**
 * Orb position + narration at a phase tick. She LEADS the camera: during
 * each pull-back she is already perched at the next control, so the wide
 * frame reads as "there — that's where we go next".
 */
export function orbAt(phase: number): {
  x: number;
  y: number;
  caption: string | null;
  locked: boolean;
} {
  for (const stop of STOPS) {
    if (phase < stop.depart) {
      const locked = phase >= stop.arrive;
      return { ...perchAt(stop), caption: locked ? stop.caption : null, locked };
    }
  }
  // Route complete — she rests by the action button while the loop resets.
  return { ...perchAt(STOPS[STOPS.length - 1]), caption: null, locked: false };
}

/** Segments resolved so far, for the fixed progress rail. */
export function resolvedCount(phase: number): number {
  return STOPS.filter((s) => phase >= s.depart).length;
}
