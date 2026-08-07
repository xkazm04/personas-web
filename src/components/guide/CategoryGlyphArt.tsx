import {
  BarChart3,
  Bot,
  Brain,
  Cloud,
  FlaskConical,
  GitBranch,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { BRAND_VAR, hexToBrand, tint } from "@/lib/brand-theme";

/**
 * `GuideCategory.icon` is a lucide component name stored as a string in
 * `src/data/guide/categories.ts`. Resolve it explicitly (no dynamic lookup)
 * so tree-shaking still works and a typo fails visibly rather than silently.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Bot,
  Brain,
  Cloud,
  FlaskConical,
  GitBranch,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
};

/**
 * Fallback artwork for a guide category that has no entry in
 * `GUIDE_ILLUSTRATIONS`. Renders a brand-tinted field with concentric rings
 * and the category glyph so every category card keeps the same
 * illustration → text rhythm instead of collapsing into a bare text card.
 *
 * It fills its positioned parent — the caller owns the aspect ratio.
 */
export default function CategoryGlyphArt({
  icon,
  color,
}: {
  /** Lucide icon name from the category record. */
  icon: string;
  /** Category hex color from the category record. */
  color: string;
}) {
  const brand = hexToBrand(color);
  const Icon = CATEGORY_ICONS[icon] ?? Sparkles;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 55%, ${tint(brand, 22)} 0%, ${tint(brand, 6)} 45%, transparent 75%)`,
      }}
    >
      {/* Concentric rings — the same neon line-work as the illustration set */}
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g fill="none" stroke={BRAND_VAR[brand]} strokeWidth="0.4">
          <circle cx="100" cy="52" r="26" opacity="0.35" />
          <circle cx="100" cy="52" r="38" opacity="0.2" />
          <circle cx="100" cy="52" r="52" opacity="0.12" />
          <line x1="0" y1="52" x2="48" y2="52" opacity="0.18" />
          <line x1="152" y1="52" x2="200" y2="52" opacity="0.18" />
        </g>
      </svg>

      <Icon
        className="relative h-12 w-12"
        strokeWidth={1.25}
        style={{
          color: BRAND_VAR[brand],
          filter: `drop-shadow(0 0 14px ${tint(brand, 45)})`,
        }}
      />
    </div>
  );
}
