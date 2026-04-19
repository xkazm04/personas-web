"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GitBranch, Brain, Share2 } from "lucide-react";
import {
  CATEGORIES,
  useMemoryFeed,
  type Memory,
} from "../memoryShared";
import GraphCanvas from "./components/GraphCanvas";
import GraphLegend from "./components/GraphLegend";

/**
 * Stacking memory graph:
 *   - 4 category hubs anchored across the top row
 *   - New memories drop downward as nodes connected to their category hub
 *   - Shared tags create cross-links between nodes (cluster stacking)
 *   - The longer the feed runs, the deeper the stack grows
 */
export default function MemoryLayersGraph() {
  const { memories, freshId } = useMemoryFeed();
  const reduced = useReducedMotion();

  const graph = useMemo(() => buildGraph(memories), [memories]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative z-10"
    >
      <div className="force-dark mx-auto max-w-4xl rounded-2xl border border-foreground/10 bg-background/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between border-b border-foreground/6 px-5 py-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-brand-purple" />
            <span className="text-base font-mono text-foreground/90 font-semibold">
              memory-graph-view
            </span>
          </div>
          <div className="flex items-center gap-4 text-base font-mono text-foreground/75">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="tabular-nums">{memories.length}</span>
              <span className="text-foreground/60">nodes</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              <span className="tabular-nums">{graph.edges.length}</span>
              <span className="text-foreground/60">links</span>
            </span>
          </div>
        </div>

        <GraphCanvas
          graph={graph}
          freshId={freshId}
          reduced={Boolean(reduced)}
        />

        <GraphLegend />
      </div>
    </motion.div>
  );
}

/* ── Graph layout: deterministic stacking around category hubs ───── */

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  memory: Memory;
  isHub?: boolean;
  hubCategory?: Memory["category"];
  hubLabel?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hubs: { id: string; x: number; y: number; category: Memory["category"] }[];
}

/* Plot a category hub along the top, then stack its children downward. */
function buildGraph(memories: Memory[]): GraphData {
  const WIDTH = 680;
  const HUB_Y = 60;
  const ROW_GAP = 72;
  const COL_GAP = 150;

  /* Distribute hubs evenly across the top row */
  const hubStep = WIDTH / (CATEGORIES.length + 1);
  const hubs = CATEGORIES.map((cat, i) => ({
    id: `hub-${cat}`,
    category: cat,
    x: hubStep * (i + 1),
    y: HUB_Y,
  }));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  /* Stack memories vertically beneath their category hub, newest at top */
  CATEGORIES.forEach((cat, catIdx) => {
    const hub = hubs[catIdx];
    const inCat = memories
      .filter((m) => m.category === cat)
      .sort((a, b) => b.importance - a.importance);

    inCat.forEach((mem, row) => {
      /* Gentle horizontal stagger for organic layout */
      const stagger = (row % 2 === 0 ? -1 : 1) * (COL_GAP * 0.12);
      const x = hub.x + stagger;
      const y = HUB_Y + ROW_GAP * (row + 1);
      nodes.push({ id: mem.id, x, y, memory: mem });
      edges.push({ from: hub.id, to: String(mem.id), weight: mem.importance });
    });
  });

  /* Cross-links: memories sharing a tag get a thin bridge */
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.memory.category === b.memory.category) continue;
      const shared = a.memory.tags.filter((t) => b.memory.tags.includes(t));
      if (shared.length > 0) {
        edges.push({
          from: String(a.id),
          to: String(b.id),
          weight: shared.length,
        });
      }
    }
  }

  return { nodes, edges, hubs };
}
