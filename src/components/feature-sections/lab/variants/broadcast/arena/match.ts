/**
 * The arena as a best-of-N match, derived from `ARENA_ROUNDS` (which the
 * ledger's ratings are also the mean of). Pure: the scorebug tally, the
 * momentum chart and the instant replay's "deciding round" all come from here.
 */
import { ARENA_ROUNDS } from "../../../data";
import type { ArenaSide } from "../../../ledger";

export const ROUNDS = ARENA_ROUNDS;
export const N = ROUNDS.length;
/** Each round is two beats (matchup, result); then the final; the held frame is the replay. */
export const ROUND_STEPS = N * 2;
export const ARENA_STEPS = ROUND_STEPS + 1;

export function arenaMs(at: number): number {
  if (at < ROUND_STEPS) return at % 2 === 0 ? 1100 : 1800;
  return 1600;
}

/** Rounds whose result is on screen at step `at`. */
export const resultsShown = (at: number) => (at >= ROUND_STEPS ? N : Math.floor((at + 1) / 2));
export const roundAt = (at: number) => (at >= ROUND_STEPS ? N - 1 : Math.floor(at / 2));

export function winsThrough(count: number): Record<ArenaSide, number> {
  const wins = { A: 0, B: 0 };
  for (let i = 0; i < count; i++) wins[ROUNDS[i].winner]++;
  return wins;
}

export const FINAL = winsThrough(N);
export const WINNER: ArenaSide = FINAL.A >= FINAL.B ? "A" : "B";
const MAJORITY = Math.floor(N / 2) + 1;

/** The round in which the match winner reached a majority - the moment the replay shows. */
export const DECIDER: number = (() => {
  let w = 0;
  for (let i = 0; i < N; i++) {
    if (ROUNDS[i].winner === WINNER) w++;
    if (w >= MAJORITY) return i;
  }
  return N - 1;
})();

/** Per-round margin, A minus B: positive bars lean to A. */
export const MARGINS = ROUNDS.map((r) => r.scoreA - r.scoreB);
export const MAX_MARGIN = Math.max(1, ...MARGINS.map(Math.abs));
