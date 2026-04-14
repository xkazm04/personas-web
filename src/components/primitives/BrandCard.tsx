"use client";

import type { CSSProperties, ReactNode } from "react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/**
 * BrandCard — the themed surface we use for every "feature card" on the site.
 *
 * Replaces the repeated `rounded-2xl border bg gradient-wash` pattern that
 * shows up in Pricing, VisionGrid, Blog, Community, Guide, UseCases, etc.
 * Theme-adaptive — uses color-mix on brand CSS variables instead of hex.
 */

interface BrandCardProps {
  brand?: BrandKey;
  /** Whether to show a subtle diagonal gradient wash using the brand color. */
  gradientWash?: boolean;
  /** Whether the card is interactive (hover scale). */
  interactive?: boolean;
  /** Extra Tailwind classes. */
  className?: string;
  /** Inline style overrides merged into the card. */
  style?: CSSProperties;
  children: ReactNode;
}

export function BrandCard({
  brand,
  gradientWash = true,
  interactive = true,
  className = "",
  style,
  children,
}: BrandCardProps) {
  const washBrand = brand && gradientWash
    ? { backgroundImage: `linear-gradient(160deg, ${tint(brand, 12)} 0%, transparent 55%)` }
    : {};

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
        interactive ? "hover:scale-[1.01]" : ""
      } ${className}`}
      style={{
        borderColor: "rgba(var(--surface-overlay), 0.08)",
        backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        ...washBrand,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * CornerGlow — an ambient radial glow that peeks in from a card corner.
 * Pairs with BrandCard. Place inside the card with `pointer-events-none`.
 */
interface CornerGlowProps {
  brand: BrandKey;
  /** Which corner to anchor the glow. */
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Size of the glow blob in px. */
  size?: number;
  /** Opacity of the glow (0–1). */
  opacity?: number;
}

export function CornerGlow({
  brand,
  corner = "top-right",
  size = 192,
  opacity = 0.4,
}: CornerGlowProps) {
  const positions: Record<typeof corner, string> = {
    "top-right": "-right-16 -top-16",
    "top-left": "-left-16 -top-16",
    "bottom-right": "-right-16 -bottom-16",
    "bottom-left": "-left-16 -bottom-16",
  };

  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${positions[corner]}`}
      style={{
        width: size,
        height: size,
        backgroundColor: tint(brand, 25),
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Pill — small brand-tinted badge used for category labels, stats, etc.
 */
interface PillProps {
  brand: BrandKey;
  children: ReactNode;
  className?: string;
}

export function Pill({ brand, children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-base font-semibold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: tint(brand, 14),
        color: BRAND_VAR[brand],
      }}
    >
      {children}
    </span>
  );
}
