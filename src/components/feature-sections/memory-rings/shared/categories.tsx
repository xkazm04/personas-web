import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/* The five memory categories the product files every memory under (guide:
 * "Memory Categories"), each with its brand colour and a drawn glyph. */

export type CategoryKey = "fact" | "decision" | "insight" | "learning" | "warning";

export const CATEGORY_KEYS: CategoryKey[] = ["fact", "decision", "insight", "learning", "warning"];

export const CATEGORY_BRAND: Record<CategoryKey, BrandKey> = {
  fact: "cyan",
  decision: "blue",
  insight: "purple",
  learning: "emerald",
  warning: "amber",
};

export const catColor = (k: CategoryKey) => BRAND_VAR[CATEGORY_BRAND[k]];
export const catTint = (k: CategoryKey, pct: number) => tint(CATEGORY_BRAND[k], pct);

/** Glyph paths drawn in a 24-unit box centred on 0,0 (stroke, round caps). */
const GLYPH: Record<CategoryKey, string> = {
  // a pinned note
  fact: "M-6 -8 H6 V8 H-6 Z M-3 -3 H3 M-3 1 H3 M-3 5 H1",
  // a fork in the road
  decision: "M0 9 V1 M0 1 L-6 -7 M0 1 L6 -7 M-6 -7 L-6 -3 M-6 -7 L-2 -7",
  // a spark
  insight: "M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z",
  // a step up
  learning: "M-8 7 H-3 V1 H2 V-5 H8 M4 -9 L8 -5 L4 -1",
  // a warning triangle
  warning: "M0 -9 L9 7 H-9 Z M0 -3 V2 M0 4.6 V4.8",
};

export function CategoryGlyph({ k, x = 0, y = 0, size = 24, color, width = 2 }: {
  k: CategoryKey;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  width?: number;
}) {
  const s = size / 24;
  return (
    <path
      d={GLYPH[k]}
      transform={`translate(${x} ${y}) scale(${s})`}
      stroke={color ?? catColor(k)}
      strokeWidth={width / s}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}
