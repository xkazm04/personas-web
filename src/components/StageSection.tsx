import { BRAND_COLORS, rgba, resolveStageColor } from "@/lib/colors";
import type { StageColor } from "@/lib/colors";
import type { ReactNode } from "react";

export default function StageSection({
  children,
  id,
  glow,
  showTopLine = true,
  fromColor,
  toColor,
}: {
  children: ReactNode;
  id?: string;
  glow: "cyan" | "purple" | "emerald";
  showTopLine?: boolean;
  fromColor?: StageColor;
  toColor?: StageColor;
}) {
  const glowStyle: Record<typeof glow, string> = {
    cyan: `radial-gradient(circle, ${rgba(BRAND_COLORS.cyan, 0.05)} 0%, transparent 65%)`,
    purple: `radial-gradient(circle, ${rgba(BRAND_COLORS.purple, 0.045)} 0%, transparent 65%)`,
    emerald: `radial-gradient(circle, ${rgba(BRAND_COLORS.emerald, 0.04)} 0%, transparent 65%)`,
  };

  const fromRgba = fromColor ? resolveStageColor(fromColor, "from") : undefined;
  const toRgba = toColor ? resolveStageColor(toColor, "to") : undefined;

  return (
    <section id={id} className="relative overflow-hidden" data-animate-when-visible>
      {showTopLine && !fromColor && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] section-line" />
      )}
      {fromRgba && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24"
          style={{ background: `linear-gradient(to bottom, ${fromRgba}, transparent)` }}
        />
      )}
      {toRgba && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24"
          style={{ background: `linear-gradient(to top, ${toRgba}, transparent)` }}
        />
      )}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: glowStyle[glow] }}
        />
      </div>
      <div className="relative z-[2]">{children}</div>
    </section>
  );
}
