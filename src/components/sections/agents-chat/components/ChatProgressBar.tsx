"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { CYCLE_MS, scenarios } from "../data";

export default function ChatProgressBar({
  activeIndex,
  paused,
  hovered,
  onSelect,
  onTogglePause,
}: {
  activeIndex: number;
  paused: boolean;
  hovered: boolean;
  onSelect: (i: number) => void;
  onTogglePause: () => void;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
      <div className="flex gap-1.5">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.06] overflow-hidden"
          >
            {i === activeIndex && !paused && !hovered && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                key={`progress-${s.id}`}
              />
            )}
            {i === activeIndex && (paused || hovered) && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
            )}
            {i < activeIndex && (
              <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-mono text-muted-dark/60">
        <span>
          Chat {activeIndex + 1} of {scenarios.length}
        </span>
        <button
          onClick={onTogglePause}
          className="cursor-pointer flex items-center gap-1.5 transition-colors hover:text-muted-dark"
        >
          {paused ? (
            <>
              <Play className="h-3 w-3" />
              Resume auto-play
            </>
          ) : (
            <>
              <Pause className="h-3 w-3" />
              Auto-cycling
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
