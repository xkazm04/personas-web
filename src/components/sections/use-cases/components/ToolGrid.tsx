"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { tools } from "../data";
import ToolButton from "./ToolButton";

interface Props {
  selected: string;
  autoplay: boolean;
  progress: number;
  onManualClick: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  desktopRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  mobileRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}

export default function ToolGrid({
  selected,
  autoplay,
  progress,
  onManualClick,
  onKeyDown,
  desktopRefs,
  mobileRefs,
}: Props) {
  return (
    <>
      {/* Desktop grid */}
      <motion.div
        variants={fadeUp}
        className="hidden md:grid grid-cols-4 gap-3 mx-auto max-w-2xl lg:grid-cols-8 lg:max-w-4xl"
        role="toolbar"
        aria-label="Integration tools"
        onKeyDown={onKeyDown}
      >
        {tools.map((tool, i) => (
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
          role="toolbar"
          aria-label="Integration tools"
          onKeyDown={onKeyDown}
        >
          {tools.map((tool, i) => (
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
              onClick={() => onManualClick(tool.id)}
              variant="mobile"
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}
