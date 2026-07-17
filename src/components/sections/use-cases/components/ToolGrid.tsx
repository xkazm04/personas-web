"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { useStaggeredReveal } from "@/lib/useStaggeredReveal";
import { tools } from "../data";
import ToolButton from "./ToolButton";

interface Props {
  selected: string;
  autoplay: boolean;
  progress: number;
  panelId: string;
  onManualClick: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onToggleAutoplay: () => void;
  desktopRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  mobileRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}

export default function ToolGrid({
  selected,
  autoplay,
  progress,
  panelId,
  onManualClick,
  onKeyDown,
  onToggleAutoplay,
  desktopRefs,
  mobileRefs,
}: Props) {
  // Mount the tool buttons in small batches so they cascade in rather than all
  // rendering at once (smoother feel + lighter single-shot load).
  const revealed = useStaggeredReveal(tools.length, { initial: 4, batch: 2, intervalMs: 60 });
  return (
    <>
      {/* Desktop tablist */}
      <motion.div
        variants={fadeUp}
        className="hidden md:grid grid-cols-4 gap-3 mx-auto max-w-2xl lg:grid-cols-8 lg:max-w-4xl"
        role="tablist"
        aria-label="Integration tools"
        onKeyDown={onKeyDown}
      >
        {tools.slice(0, revealed).map((tool, i) => (
          <ToolButton
            key={tool.id}
            ref={(node) => {
              desktopRefs.current[tool.id] = node;
            }}
            tool={tool}
            index={i}
            isActive={selected === tool.id}
            autoplay={autoplay}
            progress={progress}
            panelId={panelId}
            onClick={() => onManualClick(tool.id)}
            variant="desktop"
          />
        ))}
      </motion.div>

      {/* Mobile strip */}
      <motion.div
        variants={fadeUp}
        className="md:hidden"
        style={{
          maskImage: "linear-gradient(to right, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black 85%, transparent)",
        }}
      >
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
          role="tablist"
          aria-label="Integration tools"
          onKeyDown={onKeyDown}
        >
          {tools.slice(0, revealed).map((tool, i) => (
            <ToolButton
              key={tool.id}
              ref={(node) => {
                mobileRefs.current[tool.id] = node;
              }}
              tool={tool}
              index={i}
              isActive={selected === tool.id}
              autoplay={autoplay}
              progress={progress}
              panelId={panelId}
              onClick={() => onManualClick(tool.id)}
              variant="mobile"
            />
          ))}
        </div>
      </motion.div>

      {/* Pause/Play control — WCAG 2.2.2 for the >5s auto-updating showcase. */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onToggleAutoplay}
          aria-pressed={!autoplay}
          className="inline-flex items-center gap-1.5 rounded-full border border-glass px-3 py-1.5 text-sm font-medium text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
        >
          {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {autoplay ? "Pause" : "Play"}
        </button>
      </div>
    </>
  );
}
