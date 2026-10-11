/**
 * The Lab's one experiment — the single typed source of every score the Lab
 * tabs display (arena rounds, eval radar, genome fitness and the version
 * ledger's ratings). Nothing downstream types a figure: each tab is a
 * projection of this matrix, so the tabs cannot tell different stories.
 *
 * Shape: version × input × dimension, 0-100. It is deliberately the shape of
 * the desktop Lab's result table (one row per version, per test input, per
 * scored dimension), so a real export can replace `EXPERIMENT_VERSIONS`
 * without touching a projection.
 *
 * The genome tree's nodes ARE versions: `g4a` is the live `v4.2` and `g4b` is
 * the refined `v4.3` the chat minted (see `LEDGER_NODE`). The refined version
 * loses the head-to-head on purpose (mean 85 vs 88) — the Versions table's
 * regression flag has to stay demonstrable.
 * Pure TS, no React.
 */
import type { ArenaInputKey, EvalDimensionKey, GenomeNode, Round } from "./types";

/** Matrix column order (inner index). */
export const DIMENSIONS: readonly EvalDimensionKey[] = [
  "accuracy",
  "clarity",
  "tone",
  "latency",
  "cost",
  "safety",
];

/** Matrix row order (middle index). */
export const INPUTS: readonly ArenaInputKey[] = [
  "prodBug",
  "declineMeeting",
  "slackSummary",
  "explainPr",
  "flakyTest",
];

export interface ExperimentVersion {
  /** Genome node id. */
  id: string;
  gen: number;
  /** Horizontal layout position, 0-1. */
  x: number;
  parent: string | null;
  alive: boolean;
  best: boolean;
  /** scores[input][dimension], aligned with INPUTS and DIMENSIONS. */
  scores: readonly (readonly number[])[];
}

export const EXPERIMENT_VERSIONS: readonly ExperimentVersion[] = [
  { id: "g0", gen: 0, x: 0.5, parent: null, alive: true, best: false, scores: [[66,63,64,54,59,66],[63,61,62,55,58,64],[68,66,65,56,60,69],[63,57,60,52,58,64],[68,63,68,56,63,69]] },
  { id: "g1a", gen: 1, x: 0.3, parent: "g0", alive: true, best: false, scores: [[72,69,70,59,65,73],[70,66,68,60,64,71],[75,71,72,60,67,75],[69,64,66,58,63,70],[75,70,74,62,67,75]] },
  { id: "g1b", gen: 1, x: 0.7, parent: "g0", alive: false, best: false, scores: [[70,65,67,57,62,69],[66,64,65,57,61,68],[71,69,69,58,63,72],[66,60,63,55,61,67],[71,67,71,59,65,72]] },
  { id: "g2a", gen: 2, x: 0.25, parent: "g1a", alive: true, best: false, scores: [[79,74,76,65,71,79],[75,73,74,65,70,78],[81,78,78,66,71,82],[76,69,73,63,69,76],[81,76,80,67,74,81]] },
  { id: "g2b", gen: 2, x: 0.4, parent: "g1a", alive: false, best: false, scores: [[75,71,73,62,68,77],[73,69,71,62,67,75],[78,73,75,64,70,78],[72,68,70,60,66,72],[78,74,77,64,70,78]] },
  { id: "g3a", gen: 3, x: 0.22, parent: "g2a", alive: true, best: false, scores: [[88,82,84,72,79,87],[84,81,82,72,78,86],[89,86,87,72,79,91],[84,77,81,70,77,85],[89,84,88,75,81,90]] },
  { id: "g3b", gen: 3, x: 0.35, parent: "g2a", alive: true, best: false, scores: [[82,75,84,72,71,90],[80,74,82,71,70,88],[85,79,86,73,72,91],[78,73,80,70,70,85],[85,79,88,74,72,91]] },
  { id: "g4a", gen: 4, x: 0.22, parent: "g3a", alive: true, best: false, scores: [[98,92,95,82,89,96],[84,80,83,74,79,86],[100,95,96,85,91,97],[83,78,80,72,79,82],[100,95,98,87,92,98]] },
  { id: "g4b", gen: 4, x: 0.36, parent: "g3b", alive: true, best: false, scores: [[79,79,81,70,76,83],[92,87,90,83,85,91],[90,87,88,78,84,89],[93,91,93,84,90,95],[86,82,83,77,79,85]] },
  { id: "g5a", gen: 5, x: 0.28, parent: "g4a", alive: true, best: true, scores: [[96,95,95,89,92,97],[94,92,93,90,91,95],[99,97,97,91,94,98],[93,91,92,87,90,93],[99,97,99,91,95,98]] },
];

/** The ledger's version labels, as genome nodes: v4.2 is live, v4.3 is the chat's refinement. */
export const LEDGER_NODE = { "v4.2": "g4a", "v4.3": "g4b" } as const;

/** The pre-refinement reference version the eval radar compares against. */
export const EVAL_BASELINE_NODE = "g3b";

const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function experimentVersion(id: string): ExperimentVersion {
  const v = EXPERIMENT_VERSIONS.find((x) => x.id === id);
  if (!v) throw new Error(`unknown experiment version: ${id}`);
  return v;
}

/** One input's score for a version: the rounded mean across dimensions. */
export function inputScore(id: string, input: number): number {
  return Math.round(mean(experimentVersion(id).scores[input]));
}

/** A version's overall fitness: the rounded mean of every cell. */
export function versionFitness(id: string): number {
  return Math.round(mean(experimentVersion(id).scores.flat()));
}

/** A version's per-dimension score: the rounded mean across inputs. */
export function dimensionScore(id: string, dim: number): number {
  return Math.round(mean(experimentVersion(id).scores.map((row) => row[dim])));
}

/** Arena rounds: one per input, side A against side B. */
export function arenaRounds(a: string, b: string): Round[] {
  return INPUTS.map((input, i) => {
    const scoreA = inputScore(a, i);
    const scoreB = inputScore(b, i);
    return { id: i + 1, input, winner: scoreA >= scoreB ? "A" : "B", scoreA, scoreB };
  });
}

/** Eval radar rows: the live version against the baseline version. */
export function evalDimensions(
  liveId: string,
  baselineId: string,
): { key: EvalDimensionKey; score: number; baseline: number }[] {
  return DIMENSIONS.map((key, d) => ({
    key,
    score: dimensionScore(liveId, d),
    baseline: dimensionScore(baselineId, d),
  }));
}

/** Genome tree nodes: each node's fitness is its version's overall mean. */
export function genomeNodes(): GenomeNode[] {
  return EXPERIMENT_VERSIONS.map((v) => ({
    id: v.id,
    gen: v.gen,
    x: v.x,
    fitness: versionFitness(v.id),
    parent: v.parent,
    alive: v.alive,
    best: v.best,
  }));
}
