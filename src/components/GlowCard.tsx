"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { BRAND_COLORS, rgba } from "@/lib/colors";

type AccentColor = "cyan" | "purple" | "emerald" | "amber";

const accentMap: Record<AccentColor, { border: string; glow: string; accentRgb: string }> = {
  cyan: {
    border: "border-brand-cyan/12 hover:border-brand-cyan/25",
    glow: `hover:shadow-[0_0_50px_${rgba(BRAND_COLORS.cyan, 0.08)}]`,
    accentRgb: BRAND_COLORS.cyan,
  },
  purple: {
    border: "border-brand-purple/12 hover:border-brand-purple/25",
    glow: `hover:shadow-[0_0_50px_${rgba(BRAND_COLORS.purple, 0.08)}]`,
    accentRgb: BRAND_COLORS.purple,
  },
  emerald: {
    border: "border-brand-emerald/12 hover:border-brand-emerald/25",
    glow: `hover:shadow-[0_0_50px_${rgba(BRAND_COLORS.emerald, 0.08)}]`,
    accentRgb: BRAND_COLORS.emerald,
  },
  amber: {
    border: "border-brand-amber/12 hover:border-brand-amber/25",
    glow: `hover:shadow-[0_0_50px_${rgba(BRAND_COLORS.amber, 0.08)}]`,
    accentRgb: BRAND_COLORS.amber,
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
      className={`
        glow-card group relative overflow-hidden rounded-2xl border
        bg-gradient-to-br from-white/[0.035] to-white/[0.008]
        ${colors.border} ${colors.glow}
        transition-[border-color,box-shadow] duration-500
        ${highlighted ? "ring-1 ring-brand-purple/20 scale-[1.02]" : ""}
        ${textureClass[texture]}
        ${className}
      `}
      style={{
        "--gc-accent": colors.accentRgb,
        "--gc-grid-size": texture === "dense-grid" ? "12px" : "24px",
        "--gc-grid-opacity": texture === "dense-grid" ? "0.025" : "0.015",
      } as React.CSSProperties}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
