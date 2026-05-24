"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type Memory, CATEGORY_META } from "../../memoryShared";

export default function MemoryPill({
  mem,
  isFresh,
}: {
  mem: Memory;
  isFresh: boolean;
}) {
  const meta = CATEGORY_META[mem.category];

  return (
    <motion.div
      layout
      layoutId={`mem-stack-${mem.id}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
      transition={{
        layout: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.35 },
        scale: { type: "spring", stiffness: 320, damping: 22 },
      }}
      className="relative"
    >
      <div
        className="relative flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-md"
        style={{
          borderColor: isFresh ? `${meta.color}60` : `${meta.color}22`,
          backgroundColor: isFresh ? `${meta.color}12` : `${meta.color}06`,
          boxShadow: isFresh
            ? `0 0 24px ${meta.color}50, 0 0 0 1px ${meta.color}40 inset`
            : "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex h-10 w-1 shrink-0 flex-col-reverse overflow-hidden rounded-full bg-foreground/[0.04]">
          <div
            className="w-full rounded-full transition-all duration-500"
            style={{
              height: `${(mem.importance / 10) * 100}%`,
              backgroundColor: meta.color,
              boxShadow: `0 0 6px ${meta.color}80`,
            }}
          />
        </div>

        <div className="min-w-0">
          <div className="text-base text-foreground/90 leading-snug truncate max-w-[240px]">
            {mem.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-mono" style={{ color: `${meta.color}aa` }}>
              {mem.source}
            </span>
            <span className="text-base font-mono text-foreground/60">
              · imp {mem.importance}
            </span>
          </div>
        </div>

        {isFresh && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: meta.color }}
          >
            <Sparkles className="h-3 w-3 text-black" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
