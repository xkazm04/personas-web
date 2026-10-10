import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { MEMORY_CATEGORIES, type MemoryCategory } from "@/lib/product-facts";

/* The six memory categories the desktop files every memory under (its
 * `MEMORY_CATEGORIES`, snapshotted in src/lib/product-facts), each with its
 * brand colour and a drawn glyph. The records below `satisfies` the full
 * category union, so a category the desktop adds fails to compile here until
 * it has a colour, a glyph and an example. */

export type CategoryKey = MemoryCategory;

export const MEMORY_KINDS: readonly CategoryKey[] = MEMORY_CATEGORIES;
export const CATEGORY_KEYS = MEMORY_KINDS;

/* Hues follow the desktop's category palette (formatters.ts), in brand tokens. */
export const CATEGORY_BRAND = {
  fact: "blue",
  preference: "amber",
  instruction: "purple",
  context: "emerald",
  learned: "cyan",
  constraint: "rose",
} satisfies Record<CategoryKey, BrandKey>;

export const catColor = (k: CategoryKey) => BRAND_VAR[CATEGORY_BRAND[k]];
export const catTint = (k: CategoryKey, pct: number) => tint(CATEGORY_BRAND[k], pct);

/** Glyph paths drawn in a 24-unit box centred on 0,0 (stroke, round caps). */
const GLYPH = {
  // a pinned note
  fact: "M-6 -8 H6 V8 H-6 Z M-3 -3 H3 M-3 1 H3 M-3 5 H1",
  // a slider set to taste
  preference: "M-8 -4 H8 M-8 4 H8 M-3 -7 V-1 M3 1 V7",
  // a prompt: do this
  instruction: "M-8 -6 L-2 0 L-8 6 M1 6 H8",
  // a frame around the subject
  context: "M-4 -8 H-8 V8 H-4 M4 -8 H8 V8 H4 M0 -0.1 V0.1",
  // a step up
  learned: "M-8 7 H-3 V1 H2 V-5 H8 M4 -9 L8 -5 L4 -1",
  // a warning triangle: never do this
  constraint: "M0 -9 L9 7 H-9 Z M0 -3 V2 M0 4.6 V4.8",
} satisfies Record<CategoryKey, string>;

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
