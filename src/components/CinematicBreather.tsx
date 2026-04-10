"use client";

import { useRef, useCallback } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import { useCanvasCompositor } from "@/hooks/useCanvasCompositor";

function TypewriterLine({
  text,
  className,
  baseDelay = 0,
  charStep = 0.03,
  pulseAfter = false,
}: {
  text: string;
  className: string;
  baseDelay?: number;
  charStep?: number;
  pulseAfter?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const lineRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(lineRef, { once: true, margin: "-80px" });
  const chars = Array.from(text);
  const revealDuration = chars.length * charStep;

  return (
    <span ref={lineRef} className={`block ${className}`}>
      {chars.map((char, index) => (
        <span
          key={`${text}-${index}-${char}`}
          className={`inline-block ${inView && !prefersReducedMotion ? "tw-char-reveal" : "tw-char-hidden"}`}
          style={
            inView && !prefersReducedMotion
              ? { animationDelay: `${baseDelay + index * charStep}s` }
              : undefined
          }
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      {pulseAfter && (
        <span
          className={`absolute inset-0 pointer-events-none bg-linear-to-r from-brand-cyan/0 via-brand-cyan/20 to-brand-purple/0 mix-blend-screen ${
            inView && !prefersReducedMotion ? "tw-pulse-reveal" : "tw-char-hidden"
          }`}
          style={
            inView && !prefersReducedMotion
              ? { animationDelay: `${baseDelay + revealDuration + 0.12}s` }
              : undefined
          }
        />
      )}
    </span>
  );
}

/* ── Ambient particle field ── */

const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 25, medium: 15, low: 8 };
const BASE_SPEED = 0.3; // px per frame

interface Particle {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
}

function AmbientParticles() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const particleCount = PARTICLE_COUNTS[tier];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  const onResize = useCallback(
    (w: number, h: number) => {
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: particleCount }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 1.5,
          opacity: 0.03 + Math.random() * 0.05,
          speed: BASE_SPEED + Math.random() * 0.2,
        }));
      }
    },
    [particleCount],
  );

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      for (const p of particlesRef.current) {
        p.y -= p.speed;
        // Respawn at bottom
        if (p.y + p.r < 0) {
          p.y = h + p.r;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }
    },
    [],
  );

  useCanvasCompositor(canvasRef, render, {
    onResize,
    enabled: !prefersReducedMotion,
  });

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

export default function CinematicBreather() {
  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4">
      {/* Full-bleed animated gradient */}
      <div className="absolute inset-0 cinematic-gradient" />

      {/* Ambient particle field */}
      <AmbientParticles />

      {/* Noise overlay */}
      <div className="noise absolute inset-0" />

      {/* Edge fades into surrounding sections */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

      {/* Decorative side lines */}
      <div className="pointer-events-none absolute left-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-r from-transparent to-brand-cyan/15 lg:block" />
      <div className="pointer-events-none absolute right-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-l from-transparent to-brand-purple/15 lg:block" />

      <div className="relative z-10 text-center">
        <h2 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl md:text-8xl lg:text-[7rem] drop-shadow-2xl">
          <TypewriterLine text="Your agents." baseDelay={0.05} className="text-white drop-shadow-md" />
          <TypewriterLine
            text="Your rules."
            baseDelay={0.55}
            className="mt-3 bg-linear-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent drop-shadow-lg"
          />
          <span className="relative mt-3 inline-block">
            <TypewriterLine
              text="Your infrastructure."
              baseDelay={1.05}
              className="text-muted font-light tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              pulseAfter
            />
          </span>
        </h2>
      </div>
    </section>
  );
}
