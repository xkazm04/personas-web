"use client";

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

const PARTICLE_COUNT = 30;

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

// Deterministic particle config matching the original procedural generation
const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  xPct: ((i * 3.33 + (i * 7.3) % 10) % 100) / 100,
  size: (1.5 + ((i * 2.7) % 3)) / 2, // half-size = radius
  delay: (i * 0.27) % 10,
  duration: 5 + ((i * 2.1) % 8),
  color: COLORS[i % 4],
  blur: i % 5 === 0,
}));

export default function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const inViewRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const draw = useCallback((now: number) => {
    rafRef.current = requestAnimationFrame(draw);
    if (!inViewRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (startTimeRef.current === 0) startTimeRef.current = now;
    const elapsed = (now - startTimeRef.current) / 1000; // seconds

    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    for (const p of PARTICLES) {
      // Replicate the CSS float keyframe: ease-in-out sine wave
      // Subtract delay so each particle starts at a different phase
      const t = elapsed - p.delay;
      if (t < 0) continue; // still in delay period

      // Progress through one cycle (0 to 1), looping
      const progress = (t % p.duration) / p.duration;
      // ease-in-out sine: maps 0→0, 0.5→1, 1→0
      const sine = Math.sin(progress * Math.PI * 2);

      // Y offset: original is translateY(-20px) at 50%, 0 at 0%/100%
      // sine goes -1 to 1, we want 0 to -20 to 0
      const yOffset = -sine * 20; // negative = upward

      // Opacity: original is 0.15 at 0%/100%, 0.4 at 50%
      // sine-based interpolation for ease-in-out
      const opacityMix = (1 + sine) / 2; // 0→1→0 over cycle
      const baseAlpha = p.color[3];
      // Scale base alpha: at 0%/100% use 0.15/baseAlpha ratio, at 50% use 0.4/baseAlpha ratio
      // Original CSS: opacity goes 0.15→0.4→0.15 regardless of color alpha
      // The color already has its own alpha baked in, and opacity modulates on top
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

    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [prefersReducedMotion, draw]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
