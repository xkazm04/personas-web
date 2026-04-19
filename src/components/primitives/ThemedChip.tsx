"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { BRAND_VAR, tint, brandShadow, type BrandKey } from "@/lib/brand-theme";

interface ThemedChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Brand accent applied when active. Defaults to cyan. */
  brand?: BrandKey;
  /** Whether the chip is in its active/selected state. */
  active?: boolean;
  /** Optional leading icon (already rendered as a React node). */
  icon?: ReactNode;
  /** Children render after the icon. */
  children: ReactNode;
  /** Adds a glow shadow when active. Defaults to true. */
  glow?: boolean;
  /** Use mono font (for sci-fi style chips). Defaults to false. */
  mono?: boolean;
  /** Density: "sm" / "md" — defaults to md. */
  size?: "sm" | "md";
}

/**
 * ThemedChip — the brand-tinted rounded-full pill button used for filters,
 * tab selectors, scenario chips, and category chips across the site.
 *
 * Replaces ~12 hand-rolled `rounded-full border bg active:bg-brand-X/...`
 * patterns. Theme-adaptive — uses BRAND_VAR + tint() instead of hex.
 *
 * @example
 *   <ThemedChip active={cat === "all"} onClick={...}>All posts</ThemedChip>
 *   <ThemedChip brand="purple" active={...} icon={<Icon />} mono>Label</ThemedChip>
 */
export default function ThemedChip({
  brand = "cyan",
  active = false,
  icon,
  children,
  glow = true,
  mono = false,
  size = "md",
  className = "",
  ...buttonProps
}: ThemedChipProps) {
  const sizeClass =
    size === "sm" ? "px-3.5 py-1 text-base" : "px-5 py-2 text-base";
  const fontClass = mono ? "font-mono tracking-wider" : "font-medium";

  const activeStyle = active
    ? {
        borderColor: tint(brand, 45),
        backgroundColor: tint(brand, 12),
        color: BRAND_VAR[brand],
        boxShadow: glow ? brandShadow(brand, 16, 18) : undefined,
      }
    : {
        borderColor: "var(--border-glass-hover)",
        backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        color: "var(--muted)",
      };

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`cursor-pointer rounded-full border transition-all duration-200 ${sizeClass} ${fontClass} ${
        active ? "" : "hover:border-glass-strong hover:text-foreground"
      } ${className}`}
      style={activeStyle}
      {...buttonProps}
    >
      {icon ? (
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
