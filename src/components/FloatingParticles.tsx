"use client";

import { useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import {
  useParticleLayer,
  type ParticleLayerRender,
} from "@/components/ParticleHost";

const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 30, medium: 15, low: 0 };

const COLORS: [number, number, number, number][] = [
  [6, 182, 212, 0.3],
  [168, 85, 247, 0.2],
  [52, 211, 153, 0.15],
  [96, 165, 250, 0.12],
];

// Pre-compute the two fillStyle strings each particle ever uses. The render
// loop runs at 60fps × 30 particles, so allocating fresh template-literal
// strings each frame churned the V8 string interner and added GC pressure.
const FILL_OPAQUE: string[] = COLORS.map(([r, g, b]) => `rgba(${r},${g},${b},1)`);
const FILL_BLUR: string[] = COLORS.map(([r, g, b]) => `rgba(${r},${g},${b},0.3)`);

interface Particle {
  xPct: number;
  size: number;
  delay: number;
  duration: number;
  fillOpaque: string;
  fillBlur: string;
  blur: boolean;
}

const MAX_PARTICLES = PARTICLE_COUNTS.high;
const ALL_PARTICLES: Particle[] = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
  xPct: ((i * 3.33 + (i * 7.3) % 10) % 100) / 100,
  size: (1.5 + ((i * 2.7) % 3)) / 2,
  delay: (i * 0.27) % 10,
  duration: 5 + ((i * 2.1) % 8),
  fillOpaque: FILL_OPAQUE[i % 4],
  fillBlur: FILL_BLUR[i % 4],
  blur: i % 5 === 0,
}));

export default function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const hostRef = useRef<HTMLDivElement>(null);
  const particles = ALL_PARTICLES.slice(0, PARTICLE_COUNTS[tier]);

  const render = useCallback<ParticleLayerRender>(
    (ctx, rect, elapsed) => {
      const baseY = rect.y + rect.height + 10;
      for (const p of particles) {
        const t = elapsed - p.delay;
        if (t < 0) continue;

        const progress = (t % p.duration) / p.duration;
        const sine = Math.sin(progress * Math.PI * 2);

        const yOffset = -sine * 20;
        const opacityMix = (1 + sine) / 2;
        const opacity = 0.15 + opacityMix * 0.25;

        const x = rect.x + p.xPct * rect.width;
        const y = baseY + yOffset;

        ctx.globalAlpha = opacity;

        if (p.blur) {
          ctx.beginPath();
          ctx.arc(x, y, p.size + 1, 0, Math.PI * 2);
          ctx.fillStyle = p.fillBlur;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.fillOpaque;
        ctx.fill();
      }
    },
    [particles],
  );

  useParticleLayer(hostRef, render, {
    enabled: !prefersReducedMotion && tier !== "low",
  });

  if (prefersReducedMotion || tier === "low") return null;

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
