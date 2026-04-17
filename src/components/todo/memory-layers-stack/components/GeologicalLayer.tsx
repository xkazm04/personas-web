"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type Memory, type Category, CATEGORY_META } from "../../memoryShared";
import MemoryPill from "./MemoryPill";

export default function GeologicalLayer({
  category,
  memories,
  freshId,
  index,
  total,
}: {
  category: Category;
  memories: Memory[];
  freshId: number | null;
  index: number;
  total: number;
}) {
  const meta = CATEGORY_META[category];
  const depthInset = index * 2;
  const depthOpacity = 1 - (index / total) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: depthOpacity, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="relative"
      style={{ marginLeft: depthInset, marginRight: depthInset }}
    >
      <div
        className={`relative rounded-xl border overflow-hidden bg-gradient-to-r ${meta.gradient} backdrop-blur-sm`}
        style={{ borderColor: `${meta.color}20` }}
      >
        <div
          className="absolute left-0 inset-y-0 w-1"
          style={{ backgroundColor: `${meta.color}40` }}
        />

        <div className="relative px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <motion.span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: meta.color,
                boxShadow: `0 0 10px ${meta.color}60`,
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className="text-base font-mono uppercase tracking-widest font-semibold"
              style={{ color: meta.color }}
            >
              {meta.label} layer
            </span>
            <span className="ml-auto text-base font-mono text-foreground/70 tabular-nums">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[56px] items-start">
            <AnimatePresence mode="popLayout">
              {memories
                .slice()
                .sort((a, b) => b.importance - a.importance)
                .map((mem) => (
                  <MemoryPill key={mem.id} mem={mem} isFresh={freshId === mem.id} />
                ))}
            </AnimatePresence>
          </div>

          {memories.length === 0 && (
            <div className="text-base font-mono text-foreground/60 py-2">
              no memories in this layer yet
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
