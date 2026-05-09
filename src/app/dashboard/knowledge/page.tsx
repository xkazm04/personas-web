"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Table2, GitFork, Brain } from "lucide-react";
import GradientText from "@/components/GradientText";
import KnowledgeDenseTable from "./KnowledgeDenseTable";
import KnowledgeClusterGraph from "./KnowledgeClusterGraph";
import MemoriesView from "./MemoriesView";

type ViewVariant = "dense-table" | "cluster-graph" | "memories";

const VIEW_VARIANTS: { key: ViewVariant; label: string; icon: React.ElementType }[] = [
  { key: "dense-table", label: "Dense Table", icon: Table2 },
  { key: "cluster-graph", label: "Graph", icon: GitFork },
  { key: "memories", label: "Memories", icon: Brain },
];

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
          <p className="mt-1 text-base text-muted-dark">
            Patterns learned from agent executions
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-glass bg-white/[0.02] p-1">
          {VIEW_VARIANTS.map((v) => {
            const VIcon = v.icon;
            return (
              <button
                key={v.key}
                onClick={() => setActiveVariant(v.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
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

      {activeVariant === "dense-table" && <KnowledgeDenseTable />}
      {activeVariant === "cluster-graph" && <KnowledgeClusterGraph />}
      {activeVariant === "memories" && <MemoriesView />}
    </div>
  );
}
