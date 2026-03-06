/** Brand color RGB triplets — single source of truth for inline styles and canvas rendering. */
export const BRAND_COLORS = {
  cyan: "6,182,212",
  purple: "168,85,247",
  emerald: "52,211,153",
  amber: "251,191,36",
  blue: "96,165,250",
  rose: "244,63,94",
} as const;

/** Build an rgba() string from a brand color key and alpha. */
export function rgba(rgb: string, alpha: number): string {
  return `rgba(${rgb},${alpha})`;
}
