"use client";

import { motion, AnimatePresence, useTransform, type useSpring } from "framer-motion";
import type { Layer } from "../types";

type Spring = ReturnType<typeof useSpring>;

export default function LayerAnimated({
  layer,
  index,
  isHovered,
  onHover,
  onLeave,
  spread,
  baseOffset,
  stackHeight,
  prefersReducedMotion,
}: {
  layer: Layer;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  spread: Spring;
  baseOffset: number;
  stackHeight: number;
  prefersReducedMotion: boolean;
}) {
  const compressedOffset = index * 18;
  const expandedOffset = baseOffset;

  const y = useTransform(spread, (s: number) => {
    const pos = compressedOffset + (expandedOffset - compressedOffset) * s;
    return stackHeight - pos - 80;
  });

  const hoverLift = isHovered ? -12 : 0;
  const hoverScale = isHovered ? 1.03 : 1;
  const hoverGlow = isHovered
    ? `0 0 60px rgba(${layer.rgb}, 0.15), 0 8px 32px rgba(0,0,0,0.3)`
    : `0 4px 20px rgba(0,0,0,0.15)`;

  const Icon = layer.icon;

  return (
    <motion.div
      className="absolute inset-x-0"
      style={{ zIndex: index + 1, top: y, perspective: "1200px" }}
    >
      <motion.div
        className={`relative mx-auto w-full max-w-2xl rounded-2xl border backdrop-blur-md bg-gradient-to-br ${layer.tw.bg} ${layer.tw.border} cursor-pointer overflow-hidden`}
        style={{ transformStyle: "preserve-3d", boxShadow: hoverGlow }}
        animate={{
          y: hoverLift,
          scale: hoverScale,
          rotateX: prefersReducedMotion ? 0 : 10,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(${layer.rgb},0.3) 0px, transparent 1px, transparent 20px), repeating-linear-gradient(0deg, rgba(${layer.rgb},0.3) 0px, transparent 1px, transparent 20px)`,
          }}
        />

        <div className="relative z-10 px-5 py-4 sm:px-8 sm:py-5 flex items-center gap-4 sm:gap-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${layer.tw.labelBorder} ${layer.tw.labelBg}`}
          >
            <Icon className={`h-5 w-5 ${layer.tw.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base font-semibold ${layer.tw.text}`}>{layer.pillar}</h3>
              <span className="text-base font-mono text-muted-dark uppercase tracking-wider">{layer.label}</span>
            </div>
            <p className="text-base text-muted-dark leading-relaxed line-clamp-2">{layer.description}</p>
          </div>

          <div className="hidden sm:block shrink-0">{layer.visual}</div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl border-2"
              style={{ borderColor: `rgba(${layer.rgb}, 0.3)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
