/**
 * WHICH mono console readout sits in the app window's footer — the only words
 * in the scene that are neither a UI label nor her caption.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * The words themselves live in `src/i18n`; what is left here is only the
 * beat→line mapping and the step counter it fills in. These stay pure phase
 * functions — the copy arrives as a parameter from the component, which is
 * the thing that holds `t`.
 */

import type { Translations } from "@/i18n/en";
import { STOPS, activeStopAt } from "./data";

const CLOSER = STOPS[STOPS.length - 1];

/** Which step of the route is on screen (1-based). */
function stepAt(phase: number): number {
  const stop = activeStopAt(phase);
  return stop ? STOPS.indexOf(stop) + 1 : STOPS.length;
}

/** Fill a `{n}` / `{total}` step line with where the route has got to. */
function countIn(line: string, phase: number): string {
  return line.replace("{n}", String(stepAt(phase))).replace("{total}", String(STOPS.length));
}

/** Full status line — before the route, during it, after the agent is live. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["onboarding"]["status"],
): string {
  if (phase < STOPS[0].revealAt) return c.setup;
  if (phase >= CLOSER.chooseAt) return c.live;
  return countIn(c.step, phase);
}

/** Compact status for narrow viewports — the step counter alone. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["onboarding"]["status"],
): string {
  if (phase < STOPS[0].revealAt) return c.setupShort;
  if (phase >= CLOSER.chooseAt) return c.liveShort;
  return countIn(c.stepShort, phase);
}
