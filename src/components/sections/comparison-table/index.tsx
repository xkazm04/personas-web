"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { CompetitorId } from "@/data/comparison";
import { COMPETITORS, COMPARISON_CATEGORIES } from "@/data/comparison";
import CompetitorChips from "./components/CompetitorChips";
import CompetitorHeader from "./components/CompetitorHeader";
import CategoryBlock from "./components/CategoryBlock";

export default function ComparisonTable() {
  const [activeIds, setActiveIds] = useState<Set<CompetitorId>>(
    () => new Set<CompetitorId>(["personas", "crewai", "langchain", "n8n", "autogen"]),
  );

  const toggleCompetitor = (id: CompetitorId) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 2) return prev; // keep at least Personas + 1
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeCompetitors = COMPETITORS.filter((c) => activeIds.has(c.id));
  const colCount = activeCompetitors.length + 1;

  return (
    <motion.div variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-8">
        <CompetitorChips activeIds={activeIds} onToggle={toggleCompetitor} />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="overflow-x-auto rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.3)]"
      >
        <div
          className="grid items-center gap-2 px-4 sm:px-6 py-5 border-b border-white/8 bg-white/[0.02]"
          style={{
            gridTemplateColumns: `minmax(140px, 1.5fr) repeat(${colCount - 1}, minmax(80px, 1fr))`,
          }}
        >
          <div className="text-base font-medium text-muted">Feature</div>
          {activeCompetitors.map((comp) => (
            <CompetitorHeader key={comp.id} competitor={comp} isPersonas={comp.id === "personas"} />
          ))}
        </div>

        {COMPARISON_CATEGORIES.map((cat, i) => (
          <CategoryBlock key={cat.name} category={cat} activeCompetitors={activeCompetitors} defaultOpen={i < 3} />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-4 justify-center">
        {activeCompetitors
          .filter((c) => c.id !== "personas")
          .map((comp) => (
            <a
              key={comp.id}
              href={comp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-base text-muted hover:text-foreground transition-colors"
            >
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: comp.color }} />
              {comp.name}
              <span className="text-muted/60">{comp.type}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
      </motion.div>
    </motion.div>
  );
}
