/**
 * The mono console readout in the app window's footer — the only words in the
 * scene that are neither a UI label nor her caption.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 */

import { STOPS, activeStopAt } from "./data";

const CLOSER = STOPS[STOPS.length - 1];

/** Which step of the route is on screen (1-based). */
function stepAt(phase: number): number {
  const stop = activeStopAt(phase);
  return stop ? STOPS.indexOf(stop) + 1 : STOPS.length;
}

/** Full status line — before the route, during it, after the agent is live. */
export function statusAt(phase: number): string {
  if (phase < STOPS[0].revealAt) return "workspace · setting up together";
  if (phase >= CLOSER.chooseAt) return "agent live · monitoring on";
  return `step ${stepAt(phase)}/${STOPS.length} · built with you`;
}

/** Compact status for narrow viewports — the step counter alone. */
export function statusShortAt(phase: number): string {
  if (phase < STOPS[0].revealAt) return "setting up";
  if (phase >= CLOSER.chooseAt) return "live";
  return `step ${stepAt(phase)}/${STOPS.length}`;
}
