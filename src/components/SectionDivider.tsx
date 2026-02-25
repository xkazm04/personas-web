"use client";

import { useId, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const brandColors: Record<string, string> = {
  cyan: "6,182,212",
  purple: "168,85,247",
  emerald: "52,211,153",
  blue: "96,165,250",
  amber: "251,191,36",
};

export default function SectionDivider({
  from = "cyan",
  to = "purple",
  height = 100,
}: {
  from?: string;
  to?: string;
  height?: number;
}) {
  const uid = useId();
  const gradId = `${uid}-sd`;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.15, 0.15, 0]);
  const scaleX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.6, 1, 1, 0.6]);

  const fromRgb = brandColors[from] ?? brandColors.cyan;
  const toRgb = brandColors[to] ?? brandColors.purple;

  return (
    <div
      ref={ref}
      className="pointer-events-none relative overflow-hidden"
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ opacity, scaleX }}
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
      </motion.div>
    </div>
  );
}
