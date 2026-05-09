"use client";

import { useRef, useCallback } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import {
  useParticleLayer,
  type ParticleLayerRender,
  type ParticleLayerResize,
  type ParticleLayerUpdate,
} from "@/components/ParticleHost";

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
  // Pre-computed fillStyle. Building `rgba(255,255,255,${p.opacity})` per
  // particle per frame churned the string interner and added GC pressure.
  fill: string;
}

function AmbientParticles() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();
  const particleCount = PARTICLE_COUNTS[tier];
  const hostRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Particles store position in section-local coords; render translates
  // to viewport coords using the host rect each frame.
  const onResize = useCallback<ParticleLayerResize>(
    (rect) => {
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: particleCount }, () => {
          const opacity = 0.03 + Math.random() * 0.05;
          return {
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            r: 1 + Math.random() * 1.5,
            opacity,
            speed: BASE_SPEED + Math.random() * 0.2,
            fill: `rgba(255,255,255,${opacity})`,
          };
        });
      }
    },
    [particleCount],
  );

  // Physics-only tick. Compositor calls this before render() and skips
  // it entirely when the layer is offscreen — particles freeze in place
  // while out of view, then resume from where they were on re-entry.
  const update = useCallback<ParticleLayerUpdate>((rect) => {
    for (const p of particlesRef.current) {
      p.y -= p.speed;
      if (p.y + p.r < 0) {
        p.y = rect.height + p.r;
        p.x = Math.random() * rect.width;
      }
    }
  }, []);

  const render = useCallback<ParticleLayerRender>((ctx, rect) => {
    // Per-particle viewport culling. Section-local Y positions can be far
    // outside the actual viewport (e.g. very tall hosts, scroll position),
    // so skip arc/fill calls for particles that wouldn't contribute pixels.
    const viewportH =
      typeof window !== "undefined" ? window.innerHeight : 9999;
    for (const p of particlesRef.current) {
      const screenY = rect.y + p.y;
      if (screenY + p.r < 0 || screenY - p.r > viewportH) continue;
      ctx.beginPath();
      ctx.arc(rect.x + p.x, screenY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.fill;
      ctx.fill();
    }
  }, []);

  useParticleLayer(hostRef, render, {
    update,
    onResize,
    enabled: !prefersReducedMotion,
  });

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

export default function CinematicBreather() {
  const tier = useQualityTier();
  const isHigh = tier === "high";
  const isLow = tier === "low";

  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4">
      {/* Full-bleed animated gradient — static fallback on low tier */}
      <div
        className={`absolute inset-0 ${isLow ? "cinematic-gradient-static" : "cinematic-gradient"}`}
        aria-hidden="true"
      />

      {/* Ambient particle field (already tier-aware) */}
      <AmbientParticles />

      {/* Noise overlay — high tier only (fractal noise is GPU-heavy) */}
      {isHigh && <div className="noise absolute inset-0" aria-hidden="true" />}

      {/* Edge fades into surrounding sections */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" aria-hidden="true" />

      {/* Decorative side lines — high tier only */}
      {isHigh && (
        <>
          <div className="pointer-events-none absolute left-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-r from-transparent to-brand-cyan/15 lg:block" aria-hidden="true" />
          <div className="pointer-events-none absolute right-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-l from-transparent to-brand-purple/15 lg:block" aria-hidden="true" />
        </>
      )}

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
