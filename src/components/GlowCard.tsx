"use client";

import { useRef, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { useCanHover, useQualityTier } from "@/contexts/QualityContext";

import { BRAND_COLORS, rgba } from "@/lib/colors";

type AccentColor = "cyan" | "purple" | "emerald" | "amber";

const accentMap: Record<AccentColor, { border: string; glow: string; rgb: string }> = {
  cyan: {
    border: "border-brand-cyan/12 hover:border-brand-cyan/25",
    glow: `hover:shadow-[0_0_50px_rgba(${BRAND_COLORS.cyan},0.08)]`,
    rgb: BRAND_COLORS.cyan,
  },
  purple: {
    border: "border-brand-purple/12 hover:border-brand-purple/25",
    glow: `hover:shadow-[0_0_50px_rgba(${BRAND_COLORS.purple},0.08)]`,
    rgb: BRAND_COLORS.purple,
  },
  emerald: {
    border: "border-brand-emerald/12 hover:border-brand-emerald/25",
    glow: `hover:shadow-[0_0_50px_rgba(${BRAND_COLORS.emerald},0.08)]`,
    rgb: BRAND_COLORS.emerald,
  },
  amber: {
    border: "border-brand-amber/12 hover:border-brand-amber/25",
    glow: `hover:shadow-[0_0_50px_rgba(${BRAND_COLORS.amber},0.08)]`,
    rgb: BRAND_COLORS.amber,
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
  const tier = useQualityTier();
  const canHover = useCanHover();
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (tier === "low") return;
      const glow = glowRef.current;
      const card = e.currentTarget;
      if (!glow || !card) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        glow.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
        glow.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
        glow.style.opacity = "1";
      });
    },
    [tier],
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const glow = glowRef.current;
    if (glow) glow.style.opacity = "0";
  }, []);

  return (
    <motion.div
      variants={variants ?? fadeUp}
      whileHover={canHover ? { y: -6, transition: { duration: 0.3, ease: "easeOut" } } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-2xl border ${tier === "low" ? "" : "backdrop-blur-md"}
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
        className={`pointer-events-none absolute inset-0 ${texture === "dense-grid" ? "opacity-[0.025] grid-texture-dense" : "opacity-[0.015] grid-texture"}`}
      />
      {/* Top shine line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {/* Bottom subtle accent line */}
      <div
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${rgba(colors.rgb, 0.08)}, transparent)` }}
      />
      {/* Corner accent — top-left */}
      <div className="pointer-events-none absolute top-0 left-0 w-8 h-8">
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, ${rgba(colors.rgb, 0.08)}, transparent)` }} />
        <div className="absolute top-0 left-0 h-full w-px" style={{ background: `linear-gradient(180deg, ${rgba(colors.rgb, 0.08)}, transparent)` }} />
      </div>
      {/* Corner accent — bottom-right */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-8 h-8">
        <div className="absolute bottom-0 right-0 w-full h-px" style={{ background: `linear-gradient(270deg, ${rgba(colors.rgb, 0.08)}, transparent)` }} />
        <div className="absolute bottom-0 right-0 h-full w-px" style={{ background: `linear-gradient(0deg, ${rgba(colors.rgb, 0.08)}, transparent)` }} />
      </div>
      {/* Cursor-reactive glow */}
      {tier !== "low" && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${rgba(colors.rgb, 0.07)}, transparent 40%)`,
          }}
        />
      )}
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
