"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";

type AccentColor = "cyan" | "purple" | "emerald" | "amber";

const accentMap: Record<AccentColor, { border: string; glow: string; accent: string }> = {
  cyan: {
    border: "border-brand-cyan/12 hover:border-brand-cyan/25",
    glow: "hover:shadow-[0_0_50px_rgba(6,182,212,0.08)]",
    accent: "rgba(6,182,212,",
  },
  purple: {
    border: "border-brand-purple/12 hover:border-brand-purple/25",
    glow: "hover:shadow-[0_0_50px_rgba(168,85,247,0.08)]",
    accent: "rgba(168,85,247,",
  },
  emerald: {
    border: "border-brand-emerald/12 hover:border-brand-emerald/25",
    glow: "hover:shadow-[0_0_50px_rgba(52,211,153,0.08)]",
    accent: "rgba(52,211,153,",
  },
  amber: {
    border: "border-brand-amber/12 hover:border-brand-amber/25",
    glow: "hover:shadow-[0_0_50px_rgba(251,191,36,0.08)]",
    accent: "rgba(251,191,36,",
  },
};

type TextureType = "none" | "dense-grid" | "stripes" | "dots" | "lines";

const textureClass: Record<TextureType, string> = {
  none: "",
  "dense-grid": "",
  stripes: "texture-stripes",
  dots: "texture-dots",
  lines: "texture-lines",
};

export default function GlowCard({
  accent = "cyan",
  children,
  className = "",
  highlighted = false,
  texture = "none",
  variants,
}: {
  accent?: AccentColor;
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  texture?: TextureType;
  variants?: Variants;
}) {
  const colors = accentMap[accent];

  return (
    <motion.div
      variants={variants ?? fadeUp}
      whileHover={{ y: -6, transition: TRANSITION_NORMAL }}
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-md
        bg-gradient-to-br from-white/[0.035] to-white/[0.008]
        ${colors.border} ${colors.glow}
        transition-all duration-500
        ${highlighted ? "ring-1 ring-brand-purple/20 scale-[1.02]" : ""}
        ${textureClass[texture]}
        ${className}
      `}
    >
      {/* Grid overlay — denser variant for dense-grid texture */}
      <div
        className={`pointer-events-none absolute inset-0 ${texture === "dense-grid" ? "opacity-[0.025]" : "opacity-[0.015]"}`}
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: texture === "dense-grid" ? "12px 12px" : "24px 24px",
        }}
      />
      {/* Top shine line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {/* Bottom subtle accent line */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}0.08), transparent)` }}
      />
      {/* Corner accent — top-left */}
      <div className="pointer-events-none absolute top-0 left-0 w-8 h-8">
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, ${colors.accent}0.08), transparent)` }} />
        <div className="absolute top-0 left-0 h-full w-px" style={{ background: `linear-gradient(180deg, ${colors.accent}0.08), transparent)` }} />
      </div>
      {/* Corner accent — bottom-right */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-8 h-8">
        <div className="absolute bottom-0 right-0 w-full h-px" style={{ background: `linear-gradient(270deg, ${colors.accent}0.08), transparent)` }} />
        <div className="absolute bottom-0 right-0 h-full w-px" style={{ background: `linear-gradient(0deg, ${colors.accent}0.08), transparent)` }} />
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
