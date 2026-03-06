"use client";

import { useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import { BRAND_COLORS, rgba } from "@/lib/colors";

const ACCENT_COUNTS: Record<QualityTier, number> = { high: 8, medium: 5, low: 3 };

type AccentDef = {
  type: "ring" | "cross" | "diamond" | "dot";
  x: string;
  y: string;
  size: number;
  color: string;
  /** Parallax travel = -(speed * 600)px over full scroll */
  speed: number;
};

const accents: AccentDef[] = [
  { type: "ring", x: "7%", y: "12%", size: 54, color: rgba(BRAND_COLORS.cyan, 0.15), speed: 0.15 },
  { type: "cross", x: "88%", y: "22%", size: 24, color: rgba(BRAND_COLORS.purple, 0.18), speed: 0.3 },
  { type: "diamond", x: "14%", y: "42%", size: 16, color: rgba(BRAND_COLORS.emerald, 0.15), speed: 0.2 },
  { type: "dot", x: "93%", y: "52%", size: 14, color: rgba(BRAND_COLORS.amber, 0.12), speed: 0.4 },
  { type: "ring", x: "78%", y: "68%", size: 46, color: rgba(BRAND_COLORS.purple, 0.12), speed: 0.12 },
  { type: "cross", x: "22%", y: "78%", size: 20, color: rgba(BRAND_COLORS.cyan, 0.15), speed: 0.35 },
  { type: "diamond", x: "62%", y: "32%", size: 14, color: rgba(BRAND_COLORS.rose, 0.1), speed: 0.25 },
  { type: "dot", x: "42%", y: "88%", size: 12, color: rgba(BRAND_COLORS.blue, 0.14), speed: 0.45 },
];

function ShapeSVG({ type, size, color }: { type: AccentDef["type"]; size: number; color: string }) {
  switch (type) {
    case "ring":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke={color} strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8" stroke={color} strokeWidth="0.5" opacity="0.5" />
        </svg>
      );
    case "cross":
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <line x1="10" y1="2" x2="10" y2="18" stroke={color} strokeWidth="1" />
          <line x1="2" y1="10" x2="18" y2="10" stroke={color} strokeWidth="1" />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="8" y="1" width="10" height="10" rx="1" transform="rotate(45 8 1)" stroke={color} strokeWidth="1" fill={color.replace(/[\d.]+\)$/, "0.03)")} />
        </svg>
      );
    case "dot":
      return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="3" fill={color} />
          <circle cx="6" cy="6" r="5.5" stroke={color} strokeWidth="0.5" opacity="0.4" />
        </svg>
      );
  }
}

export default function ParallaxAccents() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const visibleAccents = accents.slice(0, ACCENT_COUNTS[tier]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {visibleAccents.map((accent, i) => (
        <div
          key={i}
          className="absolute parallax-shape"
          style={{
            left: accent.x,
            top: accent.y,
            "--parallax-offset": `${-accent.speed * 600}px`,
          } as React.CSSProperties}
        >
          <ShapeSVG type={accent.type} size={accent.size} color={accent.color} />
        </div>
      ))}
    </div>
  );
}
