import { CASE_IDS, type CaseId } from "../shared/cases";

/* The prism, in a 1200 x 500 viewBox (20 units = 1em of the art box, which is
 * 60em x 25em). Failed steps enter from the left as one beam, the prism
 * diagnoses them, and each leaves on the beam of its own fix. */

export const VIEW = { w: 1200, h: 500 } as const;
export const BEAM_Y = 250;
export const APEX = { x: 470, y: 96 };
export const BASE_L = { x: 340, y: 404 };
export const BASE_R = { x: 600, y: 404 };
/** Where the beam enters (left face) and leaves (right face) at BEAM_Y. */
export const ENTRY_X = 405;
export const EXIT_X = 535;
/** Left edge of the fix cards. */
export const CARD_X = 790;

/** One row per failure; the row's centre is where its beam lands. */
export const rowY = (i: number) => 50 + i * 100;

export function beamPath(i: number) {
  const y = rowY(i);
  const spread = (i - 2) * 9;
  return `M ${EXIT_X} ${BEAM_Y + spread} C ${EXIT_X + 120} ${BEAM_Y + spread * 2}, ${CARD_X - 140} ${y}, ${CARD_X} ${y}`;
}

/** A shard's whole journey: along the input beam, through the prism, out on its fix's beam. */
export function shardPath(i: number) {
  const spread = (i - 2) * 9;
  return `M 20 ${BEAM_Y} L ${ENTRY_X} ${BEAM_Y} L ${EXIT_X} ${BEAM_Y + spread} C ${EXIT_X + 120} ${BEAM_Y + spread * 2}, ${CARD_X - 140} ${rowY(i)}, ${CARD_X} ${rowY(i)}`;
}

/** The order failures arrive in (rate limits are the most common). */
export const PATTERN: readonly CaseId[] = [
  "rateLimit",
  "timeout",
  "rateLimit",
  "overload",
  "setup",
  "rateLimit",
  "timeout",
  "login",
  "overload",
  "rateLimit",
];

export const rowOf = (id: CaseId) => CASE_IDS.indexOf(id);

/** A new failure every TICK_MS; each takes TRAVEL ticks to reach its card. */
export const TICK_MS = 1150;
export const TRAVEL = 3;
export const FLIGHT_S = (TICK_MS * TRAVEL) / 1000;
/** Ticks shown before anything moves: the server render and reduced motion. */
export const START_TICK = 23;
const tickMs = () => TICK_MS;
export const stepMs = tickMs;
export const TICK_LOOP = 10_000;

/** How many of each failure have reached their card by tick n. */
export function arrivals(n: number): Record<CaseId, number> {
  const out = { rateLimit: 0, timeout: 0, overload: 0, setup: 0, login: 0 } as Record<CaseId, number>;
  for (let m = 0; m <= n - TRAVEL; m++) out[PATTERN[m % PATTERN.length]]++;
  return out;
}
