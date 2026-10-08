"use client";

import { useCallback, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useQualityTier, type QualityTier } from "@/contexts/QualityContext";
import { useCanvasCompositor } from "@/hooks/useCanvasCompositor";

/* ── Ambient particle field ── */

const PARTICLE_COUNTS: Record<QualityTier, number> = { high: 28, medium: 16, low: 8 };
const BASE_SPEED = 0.3; // px per frame
const COLOR_EVERY = 1; // s - re-read the theme colour so a theme switch follows

interface Particle {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
}

interface Field {
  particles: Particle[];
  color: string;
  colorAt: number;
}

/** Mutations live in plain helpers so the React compiler never sees a ref
 *  written during render. */
function seedField(field: Field, count: number, w: number, h: number) {
  if (field.particles.length > 0) return;
  field.particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 1.6,
    opacity: 0.08 + Math.random() * 0.14,
    speed: BASE_SPEED + Math.random() * 0.25,
  }));
}

function tickField(field: Field, canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) {
  if (canvas && (field.color === "" || elapsed - field.colorAt > COLOR_EVERY)) {
    // The canvas carries text-foreground, so this is the theme's ink colour.
    field.color = getComputedStyle(canvas).color;
    field.colorAt = elapsed;
  }
  ctx.fillStyle = field.color;
  for (const p of field.particles) {
    p.y -= p.speed;
    if (p.y + p.r < 0) {
      p.y = h + p.r;
      p.x = Math.random() * w;
    }
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function Particles({ enabled }: { enabled: boolean }) {
  const count = PARTICLE_COUNTS[useQualityTier()];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field>({ particles: [], color: "", colorAt: 0 });

  const onResize = useCallback((w: number, h: number) => seedField(fieldRef.current, count, w, h), [count]);
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) =>
      tickField(fieldRef.current, canvasRef.current, ctx, w, h, elapsed),
    [],
  );

  // The compositor also stops its frame loop off-screen and in a hidden tab.
  useCanvasCompositor(canvasRef, render, { onResize, enabled });

  // Always rendered: disabled, the canvas simply stays blank - reduced motion
  // changes what is drawn, never the DOM shape.
  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 text-foreground" />;
}

/**
 * The manifesto's backdrop: a slow full-bleed brand gradient, drifting
 * particles and film noise, faded into the sections around it. Both loops
 * stop under reduced motion, off-screen and in a background tab.
 */
export default function Ambience() {
  const still = useStillMotion();
  const ref = useRef<HTMLDivElement>(null);
  const live = useIsVisible(ref) && !still;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${live ? "cinematic-gradient" : "cinematic-gradient-static"}`} />
      <Particles enabled={!still} />
      <div className="noise absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
