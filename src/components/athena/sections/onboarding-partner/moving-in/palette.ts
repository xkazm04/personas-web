import { BRAND_VAR } from "@/lib/brand-theme";

/** The three faces of every iso solid in v2: theme mixes, never raw colour,
 *  so the slab and desks read as lit objects in dark and light themes. */
const MIX = (a: string, pctA: number, b: string) => `color-mix(in srgb, ${a} ${pctA}%, ${b})`;

export const FACE = {
  top: MIX(BRAND_VAR.cyan, 5, "var(--surface)"),
  left: MIX("var(--foreground)", 9, "var(--background)"),
  right: MIX("var(--foreground)", 4, "var(--background)"),
};
