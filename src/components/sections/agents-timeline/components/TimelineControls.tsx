"use client";

import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { CYCLE_MS, scenarios } from "../data";

export default function TimelineControls({
  activeIndex,
  paused,
  onSelect,
  onReplay,
  onTogglePause,
}: {
  activeIndex: number;
  paused: boolean;
  onSelect: (i: number) => void;
  onReplay: () => void;
  onTogglePause: () => void;
}) {
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
              {i === activeIndex && !paused && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  key={`progress-${s.id}`}
                />
              )}
              {i === activeIndex && paused && (
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
          Race {activeIndex + 1} of {scenarios.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onReplay}
            className="cursor-pointer flex items-center gap-1.5 min-h-[44px] transition-colors hover:text-muted-dark"
          >
            <RotateCcw className="h-3 w-3" />
            Replay
          </button>
          <button
            onClick={onTogglePause}
            className="cursor-pointer flex items-center gap-1.5 min-h-[44px] transition-colors hover:text-muted-dark"
          >
            {paused ? (
              <>
                <Play className="h-3 w-3" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                Pause
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
