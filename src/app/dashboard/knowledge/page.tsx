"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Table2, GitFork } from "lucide-react";
import GradientText from "@/components/GradientText";

type ViewVariant = "dense-table" | "cluster-graph";

// Both views are dynamically imported with ssr: false so the inactive view's
// JS (graph: framer-motion choreography, ResizeObserver wiring, edge math;
// table: sort/filter logic) doesn't ship in the initial bundle for users who
// only ever look at the default view. The toggle button prefetches the
// alternate chunk on hover/focus so the switch feels instant.
const KnowledgeDenseTable = dynamic(() => import("./KnowledgeDenseTable"), {
  ssr: false,
  loading: () => <ViewLoadingPlaceholder />,
});

const KnowledgeClusterGraph = dynamic(() => import("./KnowledgeClusterGraph"), {
  ssr: false,
  loading: () => <ViewLoadingPlaceholder />,
});

// Map each variant to a function that triggers the dynamic import. Calling
// this on hover/focus warms the chunk cache without forcing a re-render.
const PREFETCHERS: Record<ViewVariant, () => Promise<unknown>> = {
  "dense-table": () => import("./KnowledgeDenseTable"),
  "cluster-graph": () => import("./KnowledgeClusterGraph"),
};

const VIEW_VARIANTS: { key: ViewVariant; label: string; icon: React.ElementType }[] = [
  { key: "dense-table", label: "Dense Table", icon: Table2 },
  { key: "cluster-graph", label: "Graph", icon: GitFork },
];

function ViewLoadingPlaceholder() {
  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-foreground/40" />
    </div>
  );
}

export default function KnowledgeGraphPage() {
  const [activeVariant, setActiveVariant] = useState<ViewVariant>("dense-table");

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">Knowledge Graph</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-dark">
            Patterns learned from agent executions
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {VIEW_VARIANTS.map((v) => {
            const VIcon = v.icon;
            const prefetch = () => {
              if (v.key !== activeVariant) void PREFETCHERS[v.key]();
            };
            return (
              <button
                key={v.key}
                onClick={() => setActiveVariant(v.key)}
                onMouseEnter={prefetch}
                onFocus={prefetch}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  activeVariant === v.key
                    ? "bg-white/[0.08] text-foreground shadow-sm"
                    : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
                }`}
              >
                <VIcon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {activeVariant === "dense-table" ? <KnowledgeDenseTable /> : <KnowledgeClusterGraph />}
    </div>
  );
}
