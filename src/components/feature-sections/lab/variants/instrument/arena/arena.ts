/**
 * The Arena bench's projections. A contender id comes from the ledger
 * (`arenaContenders`), its genome node from `LEDGER_NODE`, and its per-input
 * dimension profile from the experiment matrix - so the traces, the means the
 * rounds report (`ARENA_ROUNDS`) and the ratings on the version rail are one
 * set of numbers. Pure TS, no React.
 */
import type { BrandKey } from "@/lib/brand-theme";
import { ARENA_ROUNDS } from "../../../data";
import { LEDGER_NODE, experimentVersion } from "../../../experiment";
import type { ArenaSide } from "../../../ledger";

export const SIDE_COLOR: Record<ArenaSide, BrandKey> = { A: "cyan", B: "purple" };

/** Screen range: every cell of both contenders sits in 60-100. */
export const Y_LO = 60;
export const Y_HI = 100;

export const ROUNDS = ARENA_ROUNDS.length;
/** Two beats per round: acquire (both traces sweep on), then lock. */
export const ARENA_STEPS = ROUNDS * 2;
export const arenaStepMs = (step: number) => (step % 2 === 0 ? 1500 : 2700);

const NODE: Record<string, string> = LEDGER_NODE;

/** A ledger version's six dimension scores on one arena input. */
export function profile(versionId: string, round: number): readonly number[] {
  const node = NODE[versionId];
  return node ? experimentVersion(node).scores[round] : [];
}

/** Wins per side over rounds [0, upTo]. */
export function tally(upTo: number): Record<ArenaSide, number> {
  const wins = { A: 0, B: 0 };
  ARENA_ROUNDS.slice(0, upTo + 1).forEach((r) => wins[r.winner]++);
  return wins;
}
