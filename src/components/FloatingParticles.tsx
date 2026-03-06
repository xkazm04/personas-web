"use client";

import { useRef, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import { useCanvasCompositor, type LayerRenderFn } from "@/hooks/useCanvasCompositor";
import { BRAND_COLORS } from "@/lib/colors";

const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 30, medium: 15, low: 5 };

// Parse "r,g,b" string to numeric tuple for canvas rendering
function parseRgb(rgb: string): [number, number, number] {
  const [r, g, b] = rgb.split(",").map(Number);
  return [r, g, b];
}

const COLORS: [number, number, number, number][] = [
  [...parseRgb(BRAND_COLORS.cyan), 0.3],
  [...parseRgb(BRAND_COLORS.purple), 0.2],
  [...parseRgb(BRAND_COLORS.emerald), 0.15],
  [...parseRgb(BRAND_COLORS.blue), 0.12],
];

// Pre-computed sine lookup table (256 entries for one full cycle)
const SINE_LUT_SIZE = 256;
const SINE_LUT = new Float32Array(SINE_LUT_SIZE);
for (let i = 0; i < SINE_LUT_SIZE; i++) {
  SINE_LUT[i] = Math.sin((i / SINE_LUT_SIZE) * Math.PI * 2);
}
function sinLut(progress: number): number {
  // progress is 0..1 representing one full cycle
  return SINE_LUT[((progress * SINE_LUT_SIZE) | 0) % SINE_LUT_SIZE];
}

interface Particle {
  xPct: number;       // horizontal position as 0-1 fraction
  size: number;        // radius
  delay: number;       // animation delay in seconds
  duration: number;    // animation duration in seconds
  invDuration: number; // 1/duration — avoid per-frame division
  blur: boolean;
  fillMain: string;    // pre-built rgba string (alpha=1)
  fillBlur: string;    // pre-built rgba string (alpha=0.3)
}

// Deterministic particle config — generated for max count, sliced by tier
const ALL_PARTICLES: Particle[] = Array.from({ length: 30 }, (_, i) => {
  const c = COLORS[i % 4];
  return {
    xPct: ((i * 3.33 + (i * 7.3) % 10) % 100) / 100,
    size: (1.5 + ((i * 2.7) % 3)) / 2,
    delay: (i * 0.27) % 10,
    duration: 5 + ((i * 2.1) % 8),
    invDuration: 1 / (5 + ((i * 2.1) % 8)),
    blur: i % 5 === 0,
    fillMain: `rgba(${c[0]},${c[1]},${c[2]},1)`,
    fillBlur: `rgba(${c[0]},${c[1]},${c[2]},0.3)`,
  };
});

export default function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particleCount = PARTICLE_COUNTS[tier];
  const particles = useMemo(() => ALL_PARTICLES.slice(0, particleCount), [particleCount]);
  const skipBlur = tier === "low";

  const render = useCallback<LayerRenderFn>((ctx, w, h, elapsed) => {
    const TWO_PI = Math.PI * 2;
    for (const p of particles) {
      const t = elapsed - p.delay;
      if (t < 0) continue;

      const progress = (t % p.duration) * p.invDuration;
      const sine = sinLut(progress);

      const x = p.xPct * w;
      const y = h + 10 - sine * 20;

      ctx.globalAlpha = 0.275 + sine * 0.125;

      if (p.blur && !skipBlur) {
        ctx.beginPath();
        ctx.arc(x, y, p.size + 1, 0, TWO_PI);
        ctx.fillStyle = p.fillBlur;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, TWO_PI);
      ctx.fillStyle = p.fillMain;
      ctx.fill();
    }
  }, [particles, skipBlur]);

  useCanvasCompositor(canvasRef, render, { enabled: !prefersReducedMotion });

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
