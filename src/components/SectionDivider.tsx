"use client";

import { useId } from "react";
import { BRAND_COLORS } from "@/lib/colors";

export default function SectionDivider({
  from = "cyan",
  to = "purple",
  height = 0,
}: {
  from?: keyof typeof BRAND_COLORS;
  to?: keyof typeof BRAND_COLORS;
  height?: number;
}) {
  const uid = useId();
  const gradId = `${uid}-sd`;

  const fromRgb = BRAND_COLORS[from] ?? BRAND_COLORS.cyan;
  const toRgb = BRAND_COLORS[to] ?? BRAND_COLORS.purple;

  return (
    <div
      className="pointer-events-none relative overflow-hidden"
      style={{ height }}
    >
      <div
        className="absolute inset-0 section-divider-scroll"
        style={
          {
            animationTimeline: "view()",
            animationRange: "entry 0% cover 100%",
          } as Record<string, string>
        }
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={`${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={`rgba(${fromRgb},0.18)`} />
              <stop offset="50%" stopColor={`rgba(${toRgb},0.10)`} />
              <stop offset="100%" stopColor={`rgba(${toRgb},0.18)`} />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C240,20 480,90 720,50 C960,10 1200,80 1440,40 L1440,100 L0,100 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M0,70 C360,30 720,95 1080,55 C1260,35 1380,65 1440,50 L1440,100 L0,100 Z"
            fill={`rgba(${toRgb},0.06)`}
          />
        </svg>

        {/* Soft radial glow at center */}
        <div
          className="absolute left-1/2 top-1/2 h-full w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(ellipse, rgba(${fromRgb},0.08) 0%, rgba(${toRgb},0.04) 50%, transparent 80%)`,
          }}
        />
      </div>
    </div>
  );
}
