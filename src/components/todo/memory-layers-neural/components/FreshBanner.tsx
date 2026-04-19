"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { type Memory, CATEGORY_META } from "../../memoryShared";

export default function FreshBanner({ freshMemory }: { freshMemory: Memory | null }) {
  const reduced = useReducedMotion();
  return (
    <div className="mt-4 h-[54px] relative">
      <AnimatePresence mode="wait">
        {freshMemory && (
          <motion.div
            key={freshMemory.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-0 flex items-center gap-3 rounded-xl border backdrop-blur-md px-4 py-3"
            style={{
              borderColor: `${CATEGORY_META[freshMemory.category].color}50`,
              backgroundColor: `${CATEGORY_META[freshMemory.category].color}10`,
            }}
          >
            <div
              className={`h-2 w-2 rounded-full${reduced ? "" : " animate-pulse"}`}
              style={{ backgroundColor: CATEGORY_META[freshMemory.category].color }}
            />
            <span
              className="text-base font-mono uppercase tracking-widest font-semibold"
              style={{ color: CATEGORY_META[freshMemory.category].color }}
            >
              new {CATEGORY_META[freshMemory.category].label}
            </span>
            <span className="text-base text-foreground/90 truncate flex-1">
              {freshMemory.title}
            </span>
            <span className="text-base font-mono text-foreground/60">
              imp {freshMemory.importance}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
