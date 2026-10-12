"use client";

import type { Translations } from "@/i18n/en";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fitTextLength } from "./textFit";

const LABEL_FONT_SIZE = 9;

/**
 * An SVG text label that is translated, themed and width-safe by construction.
 *
 * - Text is chosen by `k`, a selector over the catalog, so there is no free-form
 *   English to bake in: `<Label k={(t) => t.faqSection.shieldLabels.localOnly} />`.
 * - Colour is a brand key (`BRAND_VAR` / `tint`), never a raw rgba, so it follows
 *   every theme including the light ones (a hard-coded white-at-20% label is
 *   invisible there; the theme CSS only remaps Tailwind classes, not SVG attributes).
 * - A label longer than `maxWidth` is squeezed with `textLength` instead of
 *   spilling over neighbouring art, since translations run longer than English.
 */
export function Label({
  k,
  x,
  y,
  anchor = "start",
  tone = "emerald",
  strength = 70,
  maxWidth,
}: {
  k: (t: Translations) => string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  tone?: BrandKey;
  /** Percent of the brand colour kept, via color-mix. */
  strength?: number;
  /** Widest the label may be in viewBox units before it is compressed. */
  maxWidth?: number;
}) {
  const { t } = useTranslation();
  const text = k(t);
  const textLength = maxWidth === undefined ? undefined : fitTextLength(text, LABEL_FONT_SIZE, maxWidth);
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      textLength={textLength}
      lengthAdjust={textLength === undefined ? undefined : "spacingAndGlyphs"}
      fontSize={LABEL_FONT_SIZE}
      style={{
        fill: strength >= 100 ? BRAND_VAR[tone] : tint(tone, strength),
        fontFamily: "var(--font-geist-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </text>
  );
}
