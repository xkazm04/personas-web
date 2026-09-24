/**
 * Playback machine for the orchestration hub - who may move the active
 * trigger, and when. Pure: every action that needs the clock carries `now`,
 * so the reducer is testable and render stays free of `Date.now()`.
 *
 * Three modes, derived from two separately stored kinds of pause:
 *   - "stopped" - the VISITOR's stop: Pause, selecting a trigger, stepping
 *     with Previous/Next, or the reduced-motion preference. Open-ended; only
 *     USER_PLAY lifts it. Nothing re-arms it implicitly (WCAG 2.2.2).
 *   - "held"    - the MACHINE's hold: pointer over the ring, keyboard focus
 *     inside it, or the section being off-screen / the tab hidden. Lifted when
 *     its last holder goes; a pointer hold also self-expires (`holdUntil`), so
 *     a touch tap with no paired pointerleave cannot wedge the cycle.
 *   - "playing" - neither: the active trigger advances every `intervalMs`.
 *
 * Resume rules: a machine resume (held -> playing) spends the remainder it
 * banked when the hold began, floored at MIN_RESUME_MS; a user resume
 * (stopped -> playing) starts a fresh interval.
 */

export type PlaybackMode = "playing" | "held" | "stopped";

export interface PlaybackState {
  mode: PlaybackMode;
  active: number;
  count: number;
  intervalMs: number;
  /** When the next advance is due (meaningful while playing). */
  nextAt: number;
  /** Time left on the interval, banked when a hold began. */
  remainingMs: number;
  /** User-owned stop - stored apart from every transient hold. */
  stopped: boolean;
  /** Pointer hold expiry, or null when the pointer is not holding. */
  holdUntil: number | null;
  focusHeld: boolean;
  systemHeld: boolean;
}

export type PlaybackAction =
  | { type: "TICK"; now: number }
  | { type: "USER_PAUSE" }
  | { type: "USER_PLAY"; now: number }
  | { type: "PREFER_STILL" }
  | { type: "SELECT"; index: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "POINTER_ENTER"; now: number }
  | { type: "POINTER_LEAVE"; now: number }
  | { type: "FOCUS_IN"; now: number }
  | { type: "FOCUS_OUT"; now: number }
  | { type: "SYSTEM_HOLD"; now: number }
  | { type: "SYSTEM_RELEASE"; now: number };

/** A machine resume never advances sooner than this after the hold ends. */
export const MIN_RESUME_MS = 1_000;
/** A pointer hold lapses on its own after this long (touch has no pointerleave). */
export const POINTER_HOLD_MS = 30_000;

export function initialPlayback(
  count: number,
  { still = false, now = 0, intervalMs }: { still?: boolean; now?: number; intervalMs: number },
): PlaybackState {
  return {
    mode: still ? "stopped" : "playing",
    active: 0,
    count,
    intervalMs,
    nextAt: now + intervalMs,
    remainingMs: intervalMs,
    stopped: still,
    holdUntil: null,
    focusHeld: false,
    systemHeld: false,
  };
}

function isHeld(s: PlaybackState): boolean {
  return s.focusHeld || s.systemHeld || s.holdUntil !== null;
}

function modeOf(s: PlaybackState): PlaybackMode {
  if (s.stopped) return "stopped";
  return isHeld(s) ? "held" : "playing";
}

/**
 * Recompute the mode after a change and move the clock across the boundary.
 * `now` is null only for actions that can reach "stopped" alone, where no
 * clock is needed.
 */
function settle(prev: PlaybackState, next: PlaybackState, now: number | null): PlaybackState {
  const mode = modeOf(next);
  if (mode === prev.mode || now === null) return { ...next, mode };
  if (prev.mode === "playing" && mode === "held") {
    return { ...next, mode, remainingMs: Math.max(0, prev.nextAt - now) };
  }
  if (prev.mode === "stopped" && mode === "held") {
    return { ...next, mode, remainingMs: next.intervalMs };
  }
  if (prev.mode === "stopped" && mode === "playing") {
    return { ...next, mode, nextAt: now + next.intervalMs };
  }
  if (prev.mode === "held" && mode === "playing") {
    return { ...next, mode, nextAt: now + Math.max(next.remainingMs, MIN_RESUME_MS) };
  }
  return { ...next, mode };
}

function stopAt(s: PlaybackState, active: number): PlaybackState {
  return { ...s, active, stopped: true, mode: "stopped" };
}

const wrap = (i: number, n: number) => (n > 0 ? ((i % n) + n) % n : 0);

export function reducePlayback(s: PlaybackState, a: PlaybackAction): PlaybackState {
  switch (a.type) {
    case "TICK": {
      const lapsed = s.holdUntil !== null && a.now >= s.holdUntil;
      const cur = lapsed ? settle(s, { ...s, holdUntil: null }, a.now) : s;
      if (cur.mode !== "playing" || cur.count <= 1 || a.now < cur.nextAt) return cur;
      return { ...cur, active: wrap(cur.active + 1, cur.count), nextAt: a.now + cur.intervalMs };
    }
    case "USER_PAUSE":
    case "PREFER_STILL":
      return stopAt(s, s.active);
    case "USER_PLAY":
      return settle(s, { ...s, stopped: false }, a.now);
    case "SELECT":
      return stopAt(s, wrap(a.index, s.count));
    case "NEXT":
      return stopAt(s, wrap(s.active + 1, s.count));
    case "PREV":
      return stopAt(s, wrap(s.active - 1, s.count));
    case "POINTER_ENTER":
      return settle(s, { ...s, holdUntil: a.now + POINTER_HOLD_MS }, a.now);
    case "POINTER_LEAVE":
      return settle(s, { ...s, holdUntil: null }, a.now);
    case "FOCUS_IN":
      return settle(s, { ...s, focusHeld: true }, a.now);
    case "FOCUS_OUT":
      return settle(s, { ...s, focusHeld: false }, a.now);
    case "SYSTEM_HOLD":
      return settle(s, { ...s, systemHeld: true }, a.now);
    case "SYSTEM_RELEASE":
      return settle(s, { ...s, systemHeld: false }, a.now);
  }
}

/** The next moment a TICK can change anything, or null when only an action can. */
export function nextDeadline(s: PlaybackState): number | null {
  if (s.mode === "playing") return s.nextAt;
  if (s.mode === "held" && s.holdUntil !== null) return s.holdUntil;
  return null;
}
