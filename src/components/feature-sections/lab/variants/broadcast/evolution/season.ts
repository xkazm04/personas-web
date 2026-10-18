/**
 * The genome tree laid out as a season bracket: one column per generation,
 * entries stacked by their tree position, each carrying its tone (lineage /
 * alive / culled, from genome.ts) and its gain over its parent. Pure.
 */
import { GENOME_NODES } from "../../../data";
import { bestLineage, bestNode, genomeSummary, nodeTone, type NodeTone } from "../../../genome";
import { LEDGER_NODE } from "../../../experiment";
import type { GenomeNode } from "../../../types";

export const LINEAGE = bestLineage(GENOME_NODES);
export const SUMMARY = genomeSummary(GENOME_NODES);
export const CHAMP = bestNode(GENOME_NODES);
export const GENS = SUMMARY.generation + 1;

export interface Entry {
  node: GenomeNode;
  tone: NodeTone;
  col: number;
  /** Vertical centre, 0-1 of the board. */
  y: number;
  /** Fitness gain over the parent; null for the founder. */
  delta: number | null;
}

const byId = new Map(GENOME_NODES.map((n) => [n.id, n]));

export const ENTRIES: Entry[] = Array.from({ length: GENS }, (_, g) => {
  const col = GENOME_NODES.filter((n) => n.gen === g).sort((a, b) => a.x - b.x);
  return col.map((node, i) => {
    const parent = node.parent ? byId.get(node.parent) : undefined;
    return {
      node,
      tone: nodeTone(node, LINEAGE),
      col: g,
      y: col.length === 1 ? 0.5 : 0.25 + (i * 0.5) / (col.length - 1),
      delta: parent ? node.fitness - parent.fitness : null,
    };
  });
}).flat();

export const ENTRY_BY_ID = new Map(ENTRIES.map((e) => [e.node.id, e]));

/** "g4a" -> "G4·A": the entry's bracket seed. */
export const seed = (n: GenomeNode) => `G${n.gen}·${n.id.slice(String(n.gen).length + 1).toUpperCase() || "A"}`;

/** The genome node a ledger version id was measured as, if any. */
export const nodeForVersion = (id: string): string | undefined => (LEDGER_NODE as Record<string, string>)[id];

/** Steps: one per generation entering the bracket, then the crowning. */
export const EVO_STEPS = GENS + 1;
export const evoMs = (at: number) => (at === 0 ? 350 : 1000);

export const genCounts = (g: number) => {
  const col = ENTRIES.filter((e) => e.col === g);
  return { advance: col.filter((e) => e.node.alive).length, elim: col.filter((e) => !e.node.alive).length };
};
