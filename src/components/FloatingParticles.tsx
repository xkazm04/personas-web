"use client";

import { useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import { useCanvasCompositor } from "@/hooks/useCanvasCompositor";

const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 30, medium: 15, low: 0 };

// Match the original color palette (parsed to rgb components for canvas)
const COLORS: [number, number, number, number][] = [
  [6, 182, 212, 0.3],   // cyan
  [168, 85, 247, 0.2],  // purple
  [52, 211, 153, 0.15], // emerald
  [96, 165, 250, 0.12], // blue
];

interface Particle {
  xPct: number;       // horizontal position as 0-1 fraction
  size: number;        // radius
  delay: number;       // animation delay in seconds
  duration: number;    // animation duration in seconds
  color: [number, number, number, number]; // rgba
  blur: boolean;
}

// Deterministic particle config — generated up-front at max count, sliced by tier
const MAX_PARTICLES = PARTICLE_COUNTS.high;
const ALL_PARTICLES: Particle[] = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
  xPct: ((i * 3.33 + (i * 7.3) % 10) % 100) / 100,
  size: (1.5 + ((i * 2.7) % 3)) / 2, // half-size = radius
  delay: (i * 0.27) % 10,
  duration: 5 + ((i * 2.1) % 8),
  color: COLORS[i % 4],
  blur: i % 5 === 0,
}));

export default function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = ALL_PARTICLES.slice(0, PARTICLE_COUNTS[tier]);

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
      for (const p of particles) {
        // Replicate the CSS float keyframe: ease-in-out sine wave
        // Subtract delay so each particle starts at a different phase
        const t = elapsed - p.delay;
        if (t < 0) continue; // still in delay period

        // Progress through one cycle (0 to 1), looping
        const progress = (t % p.duration) / p.duration;
        // ease-in-out sine: maps 0→0, 0.5→1, 1→0
        const sine = Math.sin(progress * Math.PI * 2);

        // Y offset: original is translateY(-20px) at 50%, 0 at 0%/100%
        const yOffset = -sine * 20;

        // Opacity: original is 0.15 at 0%/100%, 0.4 at 50%
        const opacityMix = (1 + sine) / 2;
        const opacity = 0.15 + opacityMix * 0.25;

        const x = p.xPct * w;
        const baseY = h + 10; // bottom: -10px equivalent (start just below canvas)
        const y = baseY + yOffset;

        ctx.globalAlpha = opacity;

        if (p.blur) {
          // Approximate blur with a larger, more transparent circle
          ctx.beginPath();
          ctx.arc(x, y, p.size + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.3)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},1)`;
        ctx.fill();
      }
    },
    [particles],
  );

  useCanvasCompositor(canvasRef, render, {
    enabled: !prefersReducedMotion && tier !== "low",
  });

  if (prefersReducedMotion || tier === "low") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
