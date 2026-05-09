"use client";

import { motion, LayoutGroup } from "framer-motion";
import { Layers, Brain, Search } from "lucide-react";
import { CATEGORIES, useMemoryFeed } from "../memoryShared";
import DepthScale from "./components/DepthScale";
import GeologicalLayer from "./components/GeologicalLayer";
import StackLegend from "./components/StackLegend";

export default function MemoryLayersStack() {
  const { memories, freshId } = useMemoryFeed();

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    memories: memories.filter((m) => m.category === cat),
  }));

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
            <Layers className="h-5 w-5 text-brand-purple" />
            <span className="text-base font-mono text-foreground/90 font-semibold">
              cortical-layers-view
            </span>
          </div>
          <div className="flex items-center gap-4 text-base font-mono text-foreground/75">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="tabular-nums">{memories.length}</span>
              <span className="text-foreground/60">memories</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              <span className="text-foreground/60">instant recall</span>
            </span>
          </div>
        </div>

        <div className="flex">
          <DepthScale />

          <LayoutGroup>
            <div className="flex-1 relative p-5 space-y-3">
              {grouped.map((group, i) => (
                <GeologicalLayer
                  key={group.category}
                  category={group.category}
                  memories={group.memories}
                  freshId={freshId}
                  index={i}
                  total={CATEGORIES.length}
                />
              ))}

              <div className="mt-2 h-2 rounded-lg bg-gradient-to-r from-white/[0.02] via-white/[0.06] to-white/[0.02]" />
            </div>
          </LayoutGroup>
        </div>

        <StackLegend />
      </div>
    </motion.div>
  );
}
