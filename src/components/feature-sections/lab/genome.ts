/**
 * The Evolution tab's genome tree, read as data rather than painted by rule of
 * thumb. Pure TS, no React: `EvolutionTab.tsx` projects everything it draws —
 * the amber lineage, each node's legend colour and the header figures — from
 * these functions, so the picture, the legend and the numbers cannot disagree.
 *
 * "Best lineage" is literal: the best node and every ancestor reached by
 * walking `parent` links to the root. A fit sibling branch is not on it, and a
 * weak early ancestor is.
 */
import type { GenomeNode } from "./types";

/** The three legend entries; every node renders as exactly one of them. */
export type NodeTone = "lineage" | "alive" | "culled";

export interface GenomeSummary {
  /** The deepest generation present. */
  generation: number;
  /** Fitness of the best node. */
  best: number;
  /** Best fitness vs the lineage root's, as a rounded percentage gain. */
  lineageGainPct: number;
}

/** The node flagged `best`; failing that, the fittest survivor. */
export function bestNode(nodes: readonly GenomeNode[]): GenomeNode | undefined {
  const flagged = nodes.find((n) => n.best);
  if (flagged) return flagged;
  return nodes
    .filter((n) => n.alive)
    .reduce<GenomeNode | undefined>((top, n) => (!top || n.fitness > top.fitness ? n : top), undefined);
}

/**
 * Ids from the best node up to its root, in walk order (best first). Stops at
 * a missing parent and at a cycle, so malformed data cannot hang the render.
 */
export function bestLineage(nodes: readonly GenomeNode[]): Set<string> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lineage = new Set<string>();
  let cursor = bestNode(nodes);
  while (cursor && !lineage.has(cursor.id)) {
    lineage.add(cursor.id);
    cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
  }
  return lineage;
}

export function genomeSummary(nodes: readonly GenomeNode[]): GenomeSummary {
  const top = bestNode(nodes);
  if (!top) return { generation: 0, best: 0, lineageGainPct: 0 };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const chain = [...bestLineage(nodes)];
  const root = byId.get(chain[chain.length - 1])!;
  const generation = Math.max(...nodes.map((n) => n.gen));
  const lineageGainPct =
    root.fitness > 0 ? Math.round(((top.fitness - root.fitness) / root.fitness) * 100) : 0;
  return { generation, best: top.fitness, lineageGainPct };
}

export function nodeTone(n: GenomeNode, lineage: ReadonlySet<string>): NodeTone {
  if (lineage.has(n.id)) return "lineage";
  return n.alive ? "alive" : "culled";
}
