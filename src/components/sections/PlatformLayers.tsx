"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/*  Layer data — bottom-up stacking order                              */
/* ------------------------------------------------------------------ */

const layers = [
  {
    id: "deploy",
    label: "Infrastructure",
    pillar: "Deploy",
    icon: Cloud,
    color: "emerald",
    rgb: "52,211,153",
    tw: {
      border: "border-brand-emerald/20",
      bg: "from-emerald-500/[0.06] to-emerald-900/[0.02]",
      text: "text-emerald-400",
      glow: "shadow-[0_0_40px_rgba(52,211,153,0.08)]",
      labelBg: "bg-emerald-500/10",
      labelBorder: "border-emerald-500/20",
    },
    description: "One-click cloud deployment. Local to cloud, hybrid execution, bring your own infra.",
    visual: (
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-emerald-400/60">local</span>
        <svg width="32" height="8" className="text-emerald-500/40">
          <line x1="0" y1="4" x2="28" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points="26,1 30,4 26,7" fill="currentColor" />
        </svg>
        <span className="text-emerald-300">cloud 24/7</span>
      </div>
    ),
  },
  {
    id: "coordinate",
    label: "Execution",
    pillar: "Coordinate",
    icon: Zap,
    color: "cyan",
    rgb: "6,182,212",
    tw: {
      border: "border-brand-cyan/20",
      bg: "from-cyan-500/[0.06] to-cyan-900/[0.02]",
      text: "text-cyan-400",
      glow: "shadow-[0_0_40px_rgba(6,182,212,0.08)]",
      labelBg: "bg-cyan-500/10",
      labelBorder: "border-cyan-500/20",
    },
    description: "Event bus chaining — Email triggers Slack triggers GitHub. Runs locally.",
    visual: (
      <div className="flex items-center gap-1.5 font-mono text-sm">
        {["Em", "Sl", "GH"].map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              {n}
            </div>
            {i < 2 && (
              <div className="h-px w-4 bg-gradient-to-r from-cyan-500/40 to-cyan-500/10" />
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "design",
    label: "Intelligence",
    pillar: "Design",
    icon: Wand2,
    color: "purple",
    rgb: "168,85,247",
    tw: {
      border: "border-brand-purple/20",
      bg: "from-purple-500/[0.06] to-purple-900/[0.02]",
      text: "text-purple-400",
      glow: "shadow-[0_0_40px_rgba(168,85,247,0.08)]",
      labelBg: "bg-purple-500/10",
      labelBorder: "border-purple-500/20",
    },
    description: "Natural language design — prompt scaffolding, feasibility analysis, tool suggestions.",
    visual: (
      <div className="font-mono text-sm space-y-0.5">
        <div><span className="text-purple-400">role</span><span className="text-muted-dark">: </span><span className="text-emerald-400">&quot;Email triage&quot;</span></div>
        <div><span className="text-purple-400">tools</span><span className="text-muted-dark">: </span><span className="text-amber-400">[gmail, slack]</span></div>
        <div><span className="text-purple-400">healing</span><span className="text-muted-dark">: </span><span className="text-emerald-400">true</span></div>
      </div>
    ),
  },
  {
    id: "monitor",
    label: "Observability",
    pillar: "Monitor",
    icon: Activity,
    color: "amber",
    rgb: "251,191,36",
    tw: {
      border: "border-brand-amber/20",
      bg: "from-amber-500/[0.06] to-amber-900/[0.02]",
      text: "text-amber-400",
      glow: "shadow-[0_0_40px_rgba(251,191,36,0.08)]",
      labelBg: "bg-amber-500/10",
      labelBorder: "border-amber-500/20",
    },
    description: "Real-time streaming, audit trails, healing engine, usage analytics.",
    visual: (
      <div className="flex items-end gap-0.5 h-6">
        {[30, 55, 40, 70, 45, 80, 60, 90].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-sm bg-gradient-to-t from-amber-500/20 to-amber-400/50"
            style={{ height: `${h * 0.28}px` }}
          />
        ))}
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Connection pillar between layers                                   */
/* ------------------------------------------------------------------ */

function ConnectionPillar({
  fromRgb,
  toRgb,
  progress,
}: {
  fromRgb: string;
  toRgb: string;
  progress: number;
}) {
  const opacity = Math.min(progress * 1.5, 1);
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-px pointer-events-none" style={{ height: "100%", top: 0 }}>
      {/* Dashed line */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${fromRgb},${0.3 * opacity}), rgba(${toRgb},${0.3 * opacity}))`,
          maskImage: "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
          WebkitMaskImage: "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
        }}
      />
      {/* Flowing dot */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: `rgba(${toRgb}, 0.6)`,
          boxShadow: `0 0 8px rgba(${toRgb}, 0.4)`,
          opacity,
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PlatformLayers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /* Scroll-driven explosion */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const rawSpread = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const spread = useSpring(rawSpread, { stiffness: 80, damping: 20 });

  /* We compute a discrete spread value for each layer's Y offset */
  const spreadValues = layers.map((_, i) => {
    const maxSpread = 120; // max gap between layers in px
    return i * maxSpread;
  });

  return (
    <SectionWrapper id="platform-layers" dotGrid>
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center mb-20">
        <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-sm font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
          Architecture
        </span>
        <SectionHeading>
          <GradientText>Layered</GradientText> by design
        </SectionHeading>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Four architectural layers that compose into a complete AI agent platform.
          Scroll to explore the stack.
        </p>
      </motion.div>

      {/* 3D Layer Stack */}
      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        {/* The stack needs vertical space for the exploded view */}
        <div className="relative" style={{ height: `${layers.length * 120 + 140}px` }}>
          {/* Stack labels */}
          <StackLabelsAnimated spread={spread} />

          {/* Connection pillars between layers */}
          {layers.slice(0, -1).map((layer, i) => {
            const nextLayer = layers[i + 1];
            return (
              <LayerConnectionAnimated
                key={`conn-${layer.id}`}
                index={i}
                fromRgb={layer.rgb}
                toRgb={nextLayer.rgb}
                spread={spread}
              />
            );
          })}

          {/* Layers (rendered bottom-to-top) */}
          {layers.map((layer, i) => (
            <LayerAnimated
              key={layer.id}
              layer={layer}
              index={i}
              isHovered={hoveredIndex === i}
              onHover={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
              spread={spread}
              baseOffset={spreadValues[i]}
              stackHeight={layers.length * 120 + 140}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated wrappers that consume MotionValues                        */
/* ------------------------------------------------------------------ */

function StackLabelsAnimated({
  spread,
}: {
  spread: ReturnType<typeof useSpring>;
}) {
  const opacity = useTransform(spread, [0.3, 0.7], [0, 1]);

  return (
    <motion.div style={{ opacity }} className="hidden lg:flex flex-col items-end gap-3 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-8 z-10">
      {[...layers].reverse().map((layer, i) => (
        <motion.div
          key={layer.id}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span className={`text-sm font-mono uppercase tracking-wider ${layer.tw.text} opacity-60`}>
            {layer.label}
          </span>
          <div className="w-6 h-px" style={{ background: `rgba(${layer.rgb}, 0.3)` }} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function LayerConnectionAnimated({
  index,
  fromRgb,
  toRgb,
  spread,
}: {
  index: number;
  fromRgb: string;
  toRgb: string;
  spread: ReturnType<typeof useSpring>;
}) {
  const gap = 120;
  const baseTop = (index + 1) * gap;

  const y = useTransform(spread, (s: number) => {
    const layerOffset = index * gap * s;
    return baseTop - layerOffset * 0.5;
  });

  const height = useTransform(spread, (s: number) => Math.max(gap * s * 0.8, 0));
  const opacity = useTransform(spread, [0.2, 0.6], [0, 0.8]);

  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 z-0"
      style={{ top: y, height, opacity }}
    >
      <ConnectionPillar fromRgb={fromRgb} toRgb={toRgb} progress={1} />
    </motion.div>
  );
}

function LayerAnimated({
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
  layer: (typeof layers)[number];
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  spread: ReturnType<typeof useSpring>;
  baseOffset: number;
  stackHeight: number;
  prefersReducedMotion: boolean;
}) {
  /* Compute Y position: start compressed, spread out on scroll */
  const compressedOffset = index * 18; // initially stacked tight with 18px offset
  const expandedOffset = baseOffset;

  const y = useTransform(spread, (s: number) => {
    /* Invert: bottom layer goes to bottom, top goes to top */
    const pos = compressedOffset + (expandedOffset - compressedOffset) * s;
    return stackHeight - pos - 80; // position from bottom of container
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
      style={{
        zIndex: index + 1,
        top: y,
        perspective: "1200px",
      }}
    >
      <motion.div
        className={`
          relative mx-auto w-full max-w-2xl rounded-2xl border backdrop-blur-md
          bg-gradient-to-br ${layer.tw.bg}
          ${layer.tw.border}
          cursor-pointer overflow-hidden
        `}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: hoverGlow,
        }}
        animate={{
          y: hoverLift,
          scale: hoverScale,
          rotateX: prefersReducedMotion ? 0 : 10,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Glass overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent" />

        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(${layer.rgb},0.3) 0px, transparent 1px, transparent 20px), repeating-linear-gradient(0deg, rgba(${layer.rgb},0.3) 0px, transparent 1px, transparent 20px)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-5 py-4 sm:px-8 sm:py-5 flex items-center gap-4 sm:gap-6">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${layer.tw.labelBorder} ${layer.tw.labelBg}`}
          >
            <Icon className={`h-5 w-5 ${layer.tw.text}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-sm font-semibold ${layer.tw.text}`}>
                {layer.pillar}
              </h3>
              <span className="text-sm font-mono text-muted-dark uppercase tracking-wider">
                {layer.label}
              </span>
            </div>
            <p className="text-sm text-muted-dark leading-relaxed line-clamp-2">
              {layer.description}
            </p>
          </div>

          {/* Mini visual */}
          <div className="hidden sm:block shrink-0">{layer.visual}</div>
        </div>

        {/* Hover highlight */}
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
