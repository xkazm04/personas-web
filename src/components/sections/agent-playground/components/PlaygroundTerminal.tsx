"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { SimLine } from "../types";

interface Props {
  phase: "idle" | "running" | "done";
  visibleLines: SimLine[];
  isRunning: boolean;
}

const PlaygroundTerminal = forwardRef<HTMLDivElement, Props>(function PlaygroundTerminal(
  { phase, visibleLines, isRunning },
  ref,
) {
  return (
    <div ref={ref} className="h-[280px] overflow-y-auto px-4 py-4 sm:px-5 scrollbar-hide">
      {phase === "idle" && (
        <div className="flex h-full items-center justify-center">
          <p className="text-base text-muted-dark font-mono text-center">
            Pick an example above or type your own instruction to begin
          </p>
        </div>
      )}

      <AnimatePresence>
        {visibleLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-base leading-relaxed ${line.color || "text-muted"}`}
            style={{ paddingLeft: line.indent ? `${line.indent * 8}px` : undefined }}
          >
            {line.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="mt-1 font-mono text-base"
          style={{ color: tint("cyan", 50) }}
        >
          _
        </motion.div>
      )}
    </div>
  );
});

export default PlaygroundTerminal;
