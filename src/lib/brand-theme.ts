/**
 * Theme-adaptive brand colors.
 *
 * Rather than hardcoding hex values (which only look right in dark themes),
 * use BRAND_VAR keys so components pick up the correct token in every theme
 * variant (dark-midnight, light, light-ice, light-news, etc.).
 *
 * Usage:
 *   style={{ color: BRAND_VAR.cyan }}
 *   style={{ backgroundColor: tint("purple", 14) }}
 */

export type BrandKey = "cyan" | "purple" | "emerald" | "amber" | "rose" | "blue";

export const BRAND_VAR: Record<BrandKey, string> = {
  cyan: "var(--brand-cyan)",
  purple: "var(--brand-purple)",
  emerald: "var(--brand-emerald)",
  amber: "var(--brand-amber)",
  rose: "var(--brand-rose)",
  blue: "var(--status-info)",
};

/** Tint a brand color using CSS color-mix — stays consistent across themes. */
export function tint(key: BrandKey, pct: number): string {
  return `color-mix(in srgb, ${BRAND_VAR[key]} ${pct}%, transparent)`;
}

/**
 * Build a brand-tinted glow shadow string.
 * Replaces the repeated `0 0 Xpx ${tint(key, alpha)}` inline pattern.
 *
 * @example
 *   style={{ boxShadow: brandShadow("purple", 24) }}
 *   style={{ boxShadow: brandShadow("cyan", 32, 28) }} // size=32, alpha=28
 */
export function brandShadow(
  key: BrandKey,
  size = 24,
  alpha = 25,
): string {
  return `0 0 ${size}px ${tint(key, alpha)}`;
}

/** Same as brandShadow but for textShadow (color-only, no spread). */
export function brandTextShadow(
  key: BrandKey,
  size = 24,
  alpha = 30,
): string {
  return `0 0 ${size}px ${tint(key, alpha)}`;
}

/** Map a legacy hex color to the closest brand key. */
export function hexToBrand(hex: string): BrandKey {
  const h = hex.toLowerCase();
  if (h.includes("06b6d4") || h.includes("0891b2") || h.includes("0e7490")) return "cyan";
  if (h.includes("a855f7") || h.includes("7c3aed") || h.includes("8b5cf6")) return "purple";
  if (h.includes("34d399") || h.includes("059669") || h.includes("10b981")) return "emerald";
  if (h.includes("fbbf24") || h.includes("f59e0b") || h.includes("b45309") || h.includes("f97316")) return "amber";
  if (h.includes("f43f5e") || h.includes("be123c") || h.includes("ef4444") || h.includes("f87171")) return "rose";
  if (h.includes("60a5fa") || h.includes("3b82f6") || h.includes("2563eb") || h.includes("5865f2") || h.includes("6366f1")) return "blue";
  return "cyan";
}
