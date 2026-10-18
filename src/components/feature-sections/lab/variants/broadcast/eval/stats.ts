/**
 * The post-match stat card, projected from the experiment matrix: a version's
 * six attributes against the pre-refinement baseline, and where each one
 * ranks among every version in the league (all experiment versions). Pure.
 */
import {
  DIMENSIONS,
  EVAL_BASELINE_NODE,
  EXPERIMENT_VERSIONS,
  dimensionScore,
  evalDimensions,
  versionFitness,
} from "../../../experiment";
import type { EvalDimensionKey } from "../../../types";

export type Tier = "elite" | "pro" | "starter" | "bench";

export const LEAGUE_SIZE = EXPERIMENT_VERSIONS.length;
const DIM_TABLE = DIMENSIONS.map((_, d) => EXPERIMENT_VERSIONS.map((v) => dimensionScore(v.id, d)));
const FIT_TABLE = EXPERIMENT_VERSIONS.map((v) => versionFitness(v.id));

/** Competition ranking: 1 + how many league entries score strictly higher. */
const rankIn = (table: readonly number[], v: number) => 1 + table.filter((x) => x > v).length;

export function tier(score: number): Tier {
  if (score >= 92) return "elite";
  if (score >= 85) return "pro";
  if (score >= 75) return "starter";
  return "bench";
}

export interface Attribute {
  key: EvalDimensionKey;
  score: number;
  baseline: number;
  delta: number;
  rank: number;
}

export interface StatCard {
  attributes: Attribute[];
  avg: number;
  avgBaseline: number;
  leagueRank: number;
}

export function statCard(node: string): StatCard {
  const attributes = evalDimensions(node, EVAL_BASELINE_NODE).map((row, d) => ({
    ...row,
    delta: row.score - row.baseline,
    rank: rankIn(DIM_TABLE[d], row.score),
  }));
  const mean = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  return {
    attributes,
    avg: mean(attributes.map((a) => a.score)),
    avgBaseline: mean(attributes.map((a) => a.baseline)),
    leagueRank: rankIn(FIT_TABLE, versionFitness(node)),
  };
}
