"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { scenarios } from "../data";

export default function ChatProgressBar({
  activeIndex,
  paused,
  hovered,
  cycleMs,
  onSelect,
  onTogglePause,
}: {
  activeIndex: number;
  paused: boolean;
  hovered: boolean;
  cycleMs: number;
  onSelect: (i: number) => void;
  onTogglePause: () => void;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
      <div className="flex gap-1.5">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className="flex-1 cursor-pointer flex items-center min-h-[44px]"
          >
            <div className="relative h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
              {i === activeIndex && !paused && !hovered && !prefersReduced && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: cycleMs / 1000, ease: "linear" }}
                  key={`progress-${s.id}`}
                />
              )}
              {i === activeIndex && (paused || hovered || prefersReduced) && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
              )}
              {i < activeIndex && (
                <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-mono text-muted-dark/60">
        <span>
          Chat {activeIndex + 1} of {scenarios.length}
        </span>
        <button
          onClick={onTogglePause}
          className="cursor-pointer flex items-center gap-1.5 min-h-[44px] transition-colors hover:text-muted-dark"
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
