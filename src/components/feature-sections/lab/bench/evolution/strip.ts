/**
 * The Evolution bench's strip-chart projections, all read from the genome
 * nodes and genome.ts (lineage, summary) so the chart, the legend and the
 * readouts cannot disagree. Pure TS, no React.
 */
import { GENOME_NODES } from "../../data";
import { bestLineage, genomeSummary } from "../../genome";
import { LEDGER_NODE } from "../../experiment";

export const NODES = GENOME_NODES;
export const LINEAGE = bestLineage(GENOME_NODES);
export const SUMMARY = genomeSummary(GENOME_NODES);
export const SPAN = Math.max(SUMMARY.generation, 1);
export const GENS = Array.from({ length: SUMMARY.generation + 1 }, (_, g) => g);

export const Y_LO = 55;
export const Y_HI = 100;
export const Y_TICKS = [60, 70, 80, 90, 100];

/** The lineage in generation order, root first. */
export const LINEAGE_NODES = NODES.filter((n) => LINEAGE.has(n.id)).sort((a, b) => a.gen - b.gen);

/** Per generation: the weakest and the fittest version (the envelope). */
export const ENVELOPE = GENS.map((g) => {
  const f = NODES.filter((n) => n.gen === g).map((n) => n.fitness);
  return { gen: g, lo: Math.min(...f), hi: Math.max(...f) };
});

/** Genome node id -> ledger version id, for the nodes the ledger names. */
export const NODE_VERSION: Record<string, string> = Object.fromEntries(
  Object.entries(LEDGER_NODE).map(([version, node]) => [node, version]),
);

/** Sweep: one beat per generation, then a hold on the full chart. */
const HOLD = 3;
export const SWEEP_STEPS = GENS.length + HOLD;
export const sweepStepMs = (step: number) => (step < GENS.length ? 950 : 1400);
export const cursorGen = (step: number) => Math.min(step, SUMMARY.generation);
