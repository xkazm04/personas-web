"use client";

import { motion } from "framer-motion";
import { Brain, Radar } from "lucide-react";
import { CATEGORIES, CATEGORY_META, useMemoryFeed } from "../memoryShared";
import NeuralHub from "./components/NeuralHub";
import FreshBanner from "./components/FreshBanner";

export default function MemoryLayersNeural() {
  const { memories, freshId } = useMemoryFeed();
  const freshMemory = freshId ? memories.find((m) => m.id === freshId) ?? null : null;

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
            <Radar className="h-5 w-5 text-brand-purple" />
            <span className="text-base font-mono text-foreground/90 font-semibold">
              neural-hub-view
            </span>
          </div>
          <div className="flex items-center gap-4 text-base font-mono text-foreground/75">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="tabular-nums">{memories.length}</span>
              <span className="text-foreground/60">memories</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="text-foreground/60">4 cortical arms</span>
            </span>
          </div>
        </div>

        <div className="relative p-5">
          <NeuralHub memories={memories} freshId={freshId} />
          <FreshBanner freshMemory={freshMemory} />
        </div>

        <div className="flex items-center justify-center gap-6 border-t border-foreground/6 px-5 py-3">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: meta.color,
                    boxShadow: `0 0 6px ${meta.color}70`,
                  }}
                />
                <span className="text-base font-mono text-foreground/80 font-medium">
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
