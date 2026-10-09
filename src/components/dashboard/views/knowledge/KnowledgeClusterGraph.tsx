"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { type KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KnowledgeClusterTopBar } from "./knowledge-cluster-graph/KnowledgeClusterTopBar";
import type { KnowledgeType } from "./knowledge-cluster-graph/knowledgeClusterConfig";

/**
 * The graph body (layout math, SVG, five sub-components, framer-motion) is the
 * heavy part of a non-default tab, so it stays code-split. One named loader is
 * shared by `dynamic()`, the slot's `preload`, and the Graph tab's hover/focus
 * intent (index.tsx), so the chunk is in flight before the slot releases.
 */
export const loadClusterCanvas = () => import("./knowledge-cluster-graph/KnowledgeClusterCanvas");
const KnowledgeClusterCanvas = dynamic(loadClusterCanvas, { ssr: false });

/**
 * Cluster-graph tab. T1: the stats/filter top bar and the bordered frame
 * paint with the tab (cascade 0-1); the frame is the height reservation
 * (flex-1 of a fixed-height column). T3: the graph body mounts inside it when
 * the view's arrival queue releases slot 0, and not while data is pending.
 */
export default function KnowledgeClusterGraph({
  patterns,
  pending = false,
}: {
  patterns: KnowledgePattern[];
  /** Cold load with nothing held: chrome paints, stats are ghosted, no graph. */
  pending?: boolean;
}) {
  const [selectedPattern, setSelectedPattern] = useState<KnowledgePattern | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | KnowledgeType>("all");

  const filteredPatterns = useMemo(() => {
    if (activeFilter === "all") return patterns;
    return patterns.filter((pattern) => pattern.knowledgeType === activeFilter);
  }, [activeFilter, patterns]);

  const stats = useMemo(() => {
    const total = patterns.length;
    const avgConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / Math.max(1, total);
    const personas = new Set(patterns.map((pattern) => pattern.personaName)).size;
    const types = new Set(patterns.map((pattern) => pattern.knowledgeType)).size;
    return { total, avgConfidence, personas, types };
  }, [patterns]);

  const handleSelect = useCallback((pattern: KnowledgePattern) => {
    setSelectedPattern((prev) => (prev?.id === pattern.id ? null : pattern));
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className={ARRIVE} style={arriveAt(0)}>
        <KnowledgeClusterTopBar
          stats={stats}
          pending={pending}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          clearSelection={() => setSelectedPattern(null)}
        />
      </div>
      <div
        className={`${ARRIVE} relative flex-1 min-h-0 rounded-xl border border-glass bg-white/[0.01] overflow-hidden grid-texture`}
        style={arriveAt(1)}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--brand-purple) 5%, transparent), transparent 80%)" }} />
        {!pending && (
          <Deferred minHeight="100%" order={0} preload={loadClusterCanvas} className="absolute inset-0">
            <KnowledgeClusterCanvas
              patterns={filteredPatterns}
              activeFilter={activeFilter}
              selectedPattern={selectedPattern}
              onSelect={handleSelect}
              onClose={() => setSelectedPattern(null)}
            />
          </Deferred>
        )}
      </div>
    </div>
  );
}
